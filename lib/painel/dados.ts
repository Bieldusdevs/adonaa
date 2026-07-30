import 'server-only';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import {
  db,
  temBaseDeDados,
  agendamentos,
  clientes,
  notas,
  consultas,
  pedidos,
  pedidoItens,
  pedidoEventos,
  type Nota,
} from '@/lib/db';

/**
 * Consultas do painel.
 *
 * Todas degradam com elegância: sem base de dados devolvem vazio em vez de
 * rebentar. O painel tem de abrir sempre — uma vendedora que não consegue
 * ver a agenda do dia porque o Postgres está lento perdeu a manhã.
 */

export type VisitaHoje = {
  id: string;
  inicioEm: Date;
  tipo: string;
  status: string;
  cidade: string | null;
  endereco: string | null;
  observacoes: string | null;
  clienteNome: string;
  clienteTelefone: string | null;
};

function inicioDoDia(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fimDoDia(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function visitasDoDia(dia = new Date()): Promise<VisitaHoje[]> {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({
        id: agendamentos.id,
        inicioEm: agendamentos.inicioEm,
        tipo: agendamentos.tipo,
        status: agendamentos.status,
        cidade: agendamentos.cidade,
        endereco: agendamentos.endereco,
        observacoes: agendamentos.observacoes,
        clienteNome: clientes.nome,
        clienteTelefone: clientes.telefone,
      })
      .from(agendamentos)
      .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
      .where(
        and(gte(agendamentos.inicioEm, inicioDoDia(dia)), lte(agendamentos.inicioEm, fimDoDia(dia))),
      )
      .orderBy(agendamentos.inicioEm);
  } catch {
    return [];
  }
}

export async function proximasVisitas(limite = 30): Promise<VisitaHoje[]> {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({
        id: agendamentos.id,
        inicioEm: agendamentos.inicioEm,
        tipo: agendamentos.tipo,
        status: agendamentos.status,
        cidade: agendamentos.cidade,
        endereco: agendamentos.endereco,
        observacoes: agendamentos.observacoes,
        clienteNome: clientes.nome,
        clienteTelefone: clientes.telefone,
      })
      .from(agendamentos)
      .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
      .where(gte(agendamentos.inicioEm, inicioDoDia()))
      .orderBy(agendamentos.inicioEm)
      .limit(limite);
  } catch {
    return [];
  }
}

/**
 * "Precisa de si" — ordenado por urgência, não por data.
 *
 * Uma agendamento sem resposta há cinco horas está acima de uma pedido de
 * ontem: a cliente está à espera agora.
 */
export type Pendencia = {
  tipo: 'marcacao' | 'pedido' | 'mensagem' | 'registo';
  texto: string;
  detalhe: string;
  href: string;
  urgencia: number;
};

export async function pendencias(): Promise<Pendencia[]> {
  if (!temBaseDeDados()) return [];
  const lista: Pendencia[] = [];

  try {
    const porConfirmar = await db
      .select({
        id: agendamentos.id,
        criadoEm: agendamentos.criadoEm,
        inicioEm: agendamentos.inicioEm,
        nome: clientes.nome,
      })
      .from(agendamentos)
      .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
      .where(and(eq(agendamentos.status, 'pendente'), gte(agendamentos.inicioEm, new Date())))
      .orderBy(agendamentos.criadoEm)
      .limit(10);

    for (const a of porConfirmar) {
      const horas = Math.floor((Date.now() - a.criadoEm.getTime()) / 3.6e6);
      lista.push({
        tipo: 'marcacao',
        texto: `Agendamento de ${a.nome} por confirmar`,
        detalhe: horas < 1 ? 'há menos de 1 hora' : `há ${horas}h`,
        href: '/visitas',
        urgencia: 100 + horas,
      });
    }

    const porTratar = await db
      .select({
        id: pedidos.id,
        referencia: pedidos.referencia,
        estado: pedidos.estado,
        criadoEm: pedidos.criadoEm,
        nome: clientes.nome,
      })
      .from(pedidos)
      .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
      .where(inArray(pedidos.estado, ['novo', 'confirmado', 'preparado'] as const))
      .orderBy(pedidos.criadoEm)
      .limit(10);

    for (const o of porTratar) {
      const horas = Math.floor((Date.now() - o.criadoEm.getTime()) / 3.6e6);
      const acao =
        o.estado === 'novo' ? 'a confirmar'
        : o.estado === 'confirmado' ? 'a preparar'
        : 'a enviar';
      lista.push({
        tipo: 'pedido',
        texto: `Pedido ${o.referencia} de ${o.nome} ${acao}`,
        detalhe: horas < 24 ? `há ${Math.max(1, horas)}h` : `há ${Math.floor(horas / 24)} dias`,
        href: `/pedidos/ficha?ref=${o.id}`,
        // uma pedido parada há dias sobe na lista
        urgencia: 70 + Math.floor(horas / 12) * 10,
      });
    }

    const semResposta = await db
      .select({ id: consultas.id, assunto: consultas.assunto, criadoEm: consultas.criadoEm })
      .from(consultas)
      .where(eq(consultas.status, 'nova'))
      .orderBy(consultas.criadoEm)
      .limit(10);

    for (const c of semResposta) {
      const horas = Math.floor((Date.now() - c.criadoEm.getTime()) / 3.6e6);
      lista.push({
        tipo: 'mensagem',
        texto: `Mensagem sem resposta: ${c.assunto}`,
        detalhe: horas < 1 ? 'há menos de 1 hora' : `há ${horas}h`,
        href: '/clientes',
        urgencia: 50 + horas,
      });
    }
  } catch {
    return [];
  }

  return lista.sort((a, b) => b.urgencia - a.urgencia).slice(0, 6);
}

export async function resumoSemana() {
  const vazio = { visitas: 0, novasClientes: 0, mensagens: 0, receitaCents: 0, pedidos: 0 };
  if (!temBaseDeDados()) return vazio;

  const seteDias = new Date(Date.now() - 7 * 864e5);
  try {
    const [[v], [c], [m], [r]] = await Promise.all([
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(agendamentos)
        .where(gte(agendamentos.inicioEm, seteDias)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(clientes)
        .where(gte(clientes.criadoEm, seteDias)),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(consultas)
        .where(gte(consultas.criadoEm, seteDias)),
      db
        .select({
          n: sql<number>`count(*)::int`,
          total: sql<number>`coalesce(sum(${pedidos.totalCents}), 0)::int`,
        })
        .from(pedidos)
        .where(
          and(
            gte(pedidos.criadoEm, seteDias),
            inArray(pedidos.estado, ['confirmado', 'preparado', 'enviado', 'entregue'] as const),
          ),
        ),
    ]);
    return {
      visitas: v?.n ?? 0,
      novasClientes: c?.n ?? 0,
      mensagens: m?.n ?? 0,
      pedidos: r?.n ?? 0,
      receitaCents: r?.total ?? 0,
    };
  } catch {
    return vazio;
  }
}

/* ----------------------------- notas ------------------------------ */

export async function listarNotas(autorId: string): Promise<Nota[]> {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select()
      .from(notas)
      .where(and(eq(notas.autorId, autorId), eq(notas.arquivada, false)))
      .orderBy(desc(notas.fixada), desc(notas.atualizadoEm));
  } catch {
    return [];
  }
}

export async function listarClientes(limite = 100) {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({
        id: clientes.id,
        nome: clientes.nome,
        email: clientes.email,
        telefone: clientes.telefone,
        criadoEm: clientes.criadoEm,
        numVisitas: sql<number>`(
          select count(*)::int from ${agendamentos}
          where ${agendamentos.clienteId} = ${clientes.id}
        )`,
      })
      .from(clientes)
      .orderBy(desc(clientes.criadoEm))
      .limit(limite);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ *
 *  Pedidos
 * ------------------------------------------------------------------ */

export type PedidoLista = {
  id: string;
  referencia: string;
  estado: string;
  origem: string;
  totalCents: number;
  criadoEm: Date;
  clienteNome: string;
  clienteTelefone: string | null;
  numItens: number;
};

export async function listarPedidos(estado?: string): Promise<PedidoLista[]> {
  if (!temBaseDeDados()) return [];
  try {
    return await db
      .select({
        id: pedidos.id,
        referencia: pedidos.referencia,
        estado: pedidos.estado,
        origem: pedidos.origem,
        totalCents: pedidos.totalCents,
        criadoEm: pedidos.criadoEm,
        clienteNome: clientes.nome,
        clienteTelefone: clientes.telefone,
        numItens: sql<number>`(
          select coalesce(sum(${pedidoItens.quantidade}), 0)::int
          from ${pedidoItens}
          where ${pedidoItens.pedidoId} = ${pedidos.id}
        )`,
      })
      .from(pedidos)
      .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
      .where(estado ? eq(pedidos.estado, estado as never) : undefined)
      .orderBy(desc(pedidos.criadoEm))
      .limit(200);
  } catch {
    return [];
  }
}

export async function obterPedido(id: string) {
  if (!temBaseDeDados()) return null;
  try {
    const [e] = await db
      .select({
        pedido: pedidos,
        clienteNome: clientes.nome,
        clienteEmail: clientes.email,
        clienteTelefone: clientes.telefone,
      })
      .from(pedidos)
      .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
      .where(eq(pedidos.id, id))
      .limit(1);
    if (!e) return null;

    const [itens, eventos] = await Promise.all([
      db.select().from(pedidoItens).where(eq(pedidoItens.pedidoId, id)),
      db
        .select()
        .from(pedidoEventos)
        .where(eq(pedidoEventos.pedidoId, id))
        .orderBy(desc(pedidoEventos.criadoEm)),
    ]);

    return { ...e, itens, eventos };
  } catch {
    return null;
  }
}

/** Contagem por estado — alimenta os filtros rápidos. */
export async function contarPorEstado(): Promise<Record<string, number>> {
  if (!temBaseDeDados()) return {};
  try {
    const linhas = await db
      .select({ estado: pedidos.estado, n: sql<number>`count(*)::int` })
      .from(pedidos)
      .groupBy(pedidos.estado);
    return Object.fromEntries(linhas.map((l) => [l.estado, l.n]));
  } catch {
    return {};
  }
}
