import 'server-only';
import { and, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import {
  db,
  temBaseDeDados,
  pedidos,
  clientes,
  agendamentos,
  indicacoes,
  oportunidadesTratadas,
  type EstadoPedido,
} from '@/lib/db';
import { normalizarNumero } from '@/lib/whatsapp';

const RECEITA: EstadoPedido[] = ['confirmado', 'preparado', 'enviado', 'entregue'];
const diasAtras = (n: number) => new Date(Date.now() - n * 864e5);

/* ------------------------------------------------------------------ *
 *  Motor de oportunidades
 * ------------------------------------------------------------------ */

export type Oportunidade = {
  /** Estável entre execuções — é o que permite dispensar sem reaparecer. */
  chave: string;
  tipo: 'reposicao' | 'seguimento' | 'aniversario' | 'zona' | 'indicacao';
  titulo: string;
  contexto: string;
  /** Mensagem pronta, aberta no WhatsApp. Nunca enviada sozinha. */
  mensagem: string;
  telefone: string | null;
  prioridade: number;
};

/**
 * Sugestões derivadas dos dados reais.
 *
 * Regra que orienta tudo aqui: nada de conselhos genéricos. "Publique nas
 * redes sociais" é ruído — a vendedora já sabe. Só entra o que os dados
 * dela dizem e que ela não conseguiria ver sozinha sem abrir o Postgres.
 *
 * Se não houver dados, não há sugestão. Uma lista vazia é honesta; uma
 * lista de banalidades ensina a ignorar a secção inteira.
 */
export async function oportunidades(): Promise<Oportunidade[]> {
  if (!temBaseDeDados()) return [];

  const lista: Oportunidade[] = [];

  try {
    const dispensadas = new Set(
      (await db.select({ chave: oportunidadesTratadas.chave }).from(oportunidadesTratadas)).map(
        (d) => d.chave,
      ),
    );

    /* --- 1. clientes sem comprar há 90+ dias ------------------------- */
    const paraRepor = await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        telefone: clientes.telefone,
        ultima: sql<string>`max(${pedidos.criadoEm})`,
        dias: sql<number>`extract(day from now() - max(${pedidos.criadoEm}))::int`,
      })
      .from(pedidos)
      .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
      .where(inArray(pedidos.estado, RECEITA))
      .groupBy(clientes.id, clientes.nome, clientes.telefone)
      .having(sql`max(${pedidos.criadoEm}) < now() - interval '90 days'`)
      .orderBy(sql`max(${pedidos.criadoEm}) desc`)
      .limit(6);

    for (const c of paraRepor) {
      const primeiro = c.nome.split(' ')[0];
      const meses = Math.round(c.dias / 30);
      lista.push({
        chave: `reposicao:${c.id}:${Math.floor(c.dias / 30)}`,
        tipo: 'reposicao',
        titulo: `${c.nome} não compra há ${meses} meses`,
        contexto:
          'As clientes costumam repor a cada 3 ou 4 meses. Uma mensagem discreta costuma bastar.',
        mensagem: `Oi, ${primeiro}! Tudo bem?\n\nChegaram peças novas no ateliê e lembrei de você. Se quiser, mando umas fotos — sem compromisso nenhum.`,
        telefone: c.telefone,
        prioridade: 80 - meses,
      });
    }

    /* --- 2. visita sem compra nos últimos 7 dias --------------------- */
    const semCompra = await db
      .select({
        id: agendamentos.id,
        nome: clientes.nome,
        telefone: clientes.telefone,
        quando: agendamentos.inicioEm,
        clienteId: clientes.id,
      })
      .from(agendamentos)
      .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
      .where(
        and(
          eq(agendamentos.status, 'realizado'),
          gte(agendamentos.inicioEm, diasAtras(14)),
          lt(agendamentos.inicioEm, diasAtras(2)),
          sql`not exists (
            select 1 from ${pedidos}
            where ${pedidos.clienteId} = ${clientes.id}
              and ${pedidos.criadoEm} >= ${agendamentos.inicioEm}
          )`,
        ),
      )
      .limit(6);

    for (const v of semCompra) {
      const primeiro = v.nome.split(' ')[0];
      lista.push({
        chave: `seguimento:${v.id}`,
        tipo: 'seguimento',
        titulo: `${v.nome} provou e não levou`,
        contexto:
          'Visita realizada sem pedido. Um seguimento leve, sem insistência, costuma converter cerca de um terço.',
        mensagem: `Oi, ${primeiro}! Foi um prazer te atender.\n\nFiquei pensando naquela peça que você experimentou. Se quiser rever ou tirar qualquer dúvida de tamanho, é só me chamar.`,
        telefone: v.telefone,
        prioridade: 95,
      });
    }

    /* --- 3. concentração geográfica ---------------------------------- */
    const porCidade = await db
      .select({ cidade: agendamentos.cidade, n: sql<number>`count(*)::int` })
      .from(agendamentos)
      .where(and(gte(agendamentos.inicioEm, diasAtras(60)), sql`${agendamentos.cidade} is not null`))
      .groupBy(agendamentos.cidade)
      .having(sql`count(*) >= 3`)
      .orderBy(sql`count(*) desc`)
      .limit(3);

    for (const c of porCidade) {
      lista.push({
        chave: `zona:${c.cidade}:${Math.floor(Date.now() / 6048e5)}`, // semana
        tipo: 'zona',
        titulo: `${c.n} atendimentos em ${c.cidade}`,
        contexto:
          'Concentrar visitas no mesmo dia e região poupa horas de trânsito — e abre espaço para mais uma cliente.',
        mensagem: '',
        telefone: null,
        prioridade: 40,
      });
    }

    /* --- 4. clientes fiéis sem código de indicação ------------------- */
    const fieis = await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        telefone: clientes.telefone,
        n: sql<number>`count(*)::int`,
      })
      .from(pedidos)
      .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
      .where(inArray(pedidos.estado, RECEITA))
      .groupBy(clientes.id, clientes.nome, clientes.telefone)
      .having(
        sql`count(*) >= 2 and not exists (
          select 1 from ${indicacoes} where ${indicacoes.clienteOrigemId} = ${clientes.id}
        )`,
      )
      .limit(4);

    for (const c of fieis) {
      lista.push({
        chave: `indicacao:${c.id}`,
        tipo: 'indicacao',
        titulo: `${c.nome} já comprou ${c.n} vezes`,
        contexto:
          'Clientes que voltam são as melhores embaixadoras. Vale criar um código de indicação para ela.',
        mensagem: '',
        telefone: c.telefone,
        prioridade: 60,
      });
    }

    return lista
      .filter((o) => !dispensadas.has(o.chave))
      .sort((a, b) => b.prioridade - a.prioridade)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function linkOportunidade(o: Oportunidade) {
  if (!o.mensagem) return null;
  const numero = o.telefone ? normalizarNumero(o.telefone) : '';
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(o.mensagem)}`;
}

/* ------------------------------------------------------------------ *
 *  Indicações
 * ------------------------------------------------------------------ */

/** Código legível: ADONA-MARTA. Sem acentos, sem espaços. */
export function gerarCodigoIndicacao(nome: string) {
  const primeiro = nome
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 10);
  const sufixo = Math.floor(Math.random() * 90 + 10);
  return `ADONA-${primeiro}${sufixo}`;
}

export async function listarIndicacoes() {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({
        id: indicacoes.id,
        codigo: indicacoes.codigo,
        estado: indicacoes.estado,
        descontoPercent: indicacoes.descontoPercent,
        criadoEm: indicacoes.criadoEm,
        usadoEm: indicacoes.usadoEm,
        origemNome: clientes.nome,
        origemTelefone: clientes.telefone,
      })
      .from(indicacoes)
      .innerJoin(clientes, eq(clientes.id, indicacoes.clienteOrigemId))
      .orderBy(desc(indicacoes.criadoEm))
      .limit(60);
  } catch {
    return [];
  }
}

export async function clientesParaIndicar() {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({ id: clientes.id, nome: clientes.nome })
      .from(clientes)
      .orderBy(desc(clientes.criadoEm))
      .limit(100);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ *
 *  Modelos de mensagem
 * ------------------------------------------------------------------ */

export const MODELOS = [
  {
    id: 'pos-visita',
    titulo: 'Depois da visita',
    quando: 'Enviar 48 h depois, se não houve pedido',
    texto:
      'Oi, {nome}! Foi um prazer te atender.\n\nQualquer dúvida sobre tamanho ou tecido, me chama. Sem compromisso nenhum.',
  },
  {
    id: 'reposicao',
    titulo: 'Hora de repor',
    quando: '3 a 4 meses depois da última compra',
    texto:
      'Oi, {nome}! Tudo bem?\n\nChegaram peças novas e lembrei de você. Quer que eu mande umas fotos?',
  },
  {
    id: 'primeira-compra',
    titulo: 'Obrigada pela primeira compra',
    quando: 'Logo após a entrega do primeiro pedido',
    texto:
      'Oi, {nome}! Obrigada por confiar na gente.\n\nSe algo não ficar perfeito, me diz — a gente resolve sem complicação. E se gostar, me conta também. Faz toda a diferença.',
  },
  {
    id: 'aniversario',
    titulo: 'Aniversário',
    quando: 'No dia',
    texto:
      'Oi, {nome}! Feliz aniversário. 🤍\n\nSeparei um mimo para você — passa aqui quando quiser, ou me chama que eu levo.',
  },
  {
    id: 'depoimento',
    titulo: 'Pedir depoimento',
    quando: '2 a 3 semanas depois de uma compra bem-sucedida',
    texto:
      'Oi, {nome}! Você ficou satisfeita com as peças?\n\nSe sim, me ajudaria muito se pudesse escrever duas linhas sobre a experiência. Uso só o primeiro nome e a cidade — nada mais.',
  },
  {
    id: 'indicacao',
    titulo: 'Convidar para indicar',
    quando: 'Para clientes com 2+ compras',
    texto:
      'Oi, {nome}! Criei um código só seu: *{codigo}*.\n\nQuem usar ganha {desconto}% na primeira compra — e você ganha os mesmos {desconto}% na próxima. Fica à vontade para passar para quem quiser.',
  },
] as const;

/* ------------------------------------------------------------------ *
 *  Calendário editorial
 * ------------------------------------------------------------------ */

export const CALENDARIO = [
  { mes: 1, titulo: 'Verão e conforto', ideia: 'Peças em algodão e modal: o que veste bem no calor de Minas. Conteúdo sobre tecidos que respiram.' },
  { mes: 2, titulo: 'Carnaval', ideia: 'Peças que funcionam sob fantasia e roupa leve. Tom leve, sem apelação.' },
  { mes: 3, titulo: 'Dia Internacional da Mulher', ideia: 'Falar de conforto e autonomia, não de "presente". Evitar o clichê da data.' },
  { mes: 5, titulo: 'Dia das Mães', ideia: 'A data mais forte do semestre. Vale-presente e embalagem especial — mantendo a discrição.' },
  { mes: 6, titulo: 'Dia dos Namorados', ideia: 'Cuidado com o tom: falar para ela, nunca para ele. A peça é dela.' },
  { mes: 8, titulo: 'Volta do frio', ideia: 'Seda como termorreguladora — o argumento técnico que quase ninguém usa.' },
  { mes: 10, titulo: 'Outubro Rosa', ideia: 'Lingerie pós-cirúrgica ou parceria com associação local. Assunto sensível: tratar com cuidado real ou não tratar.' },
  { mes: 11, titulo: 'Black Friday', ideia: 'Decidir se participa. Uma marca premium pode ganhar mais NÃO participando — e dizendo porquê.' },
  { mes: 12, titulo: 'Festas', ideia: 'Presente e autopresente. Prazo de entrega em destaque a partir do dia 10.' },
] as const;
