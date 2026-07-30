import 'server-only';
import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import {
  db,
  temBaseDeDados,
  pedidos,
  pedidoItens,
  clientes,
  agendamentos,
  type EstadoPedido,
} from '@/lib/db';

/**
 * Consultas de análise.
 *
 * Todas degradam para zero se a base de dados não estiver disponível — a
 * página de números abre sempre, mesmo que vazia.
 */

/** Estados que contam como receita realizada. */
const RECEITA: EstadoPedido[] = ['confirmado', 'preparado', 'enviado', 'entregue'];

const diasAtras = (n: number) => new Date(Date.now() - n * 864e5);

/**
 * `db.execute()` devolve formatos diferentes conforme o driver: um array
 * simples no postgres-js (local) e `{ rows: [...] }` no driver HTTP da Neon
 * (produção). Este helper esconde a diferença.
 */
function primeiraLinha<T>(r: unknown): T | undefined {
  if (Array.isArray(r)) return r[0] as T | undefined;
  const rows = (r as { rows?: unknown[] })?.rows;
  return Array.isArray(rows) ? (rows[0] as T | undefined) : undefined;
}

/* ------------------------------------------------------------------ *
 *  Indicadores com comparação ao período anterior
 * ------------------------------------------------------------------ */

export type Indicador = {
  rotulo: string;
  valor: number;
  formato: 'moeda' | 'numero' | 'percentagem';
  variacao: number | null; // pontos percentuais de variação
  nota?: string;
};

export async function indicadores(dias = 30): Promise<Indicador[]> {
  const vazio: Indicador[] = [
    { rotulo: 'Receita', valor: 0, formato: 'moeda', variacao: null },
    { rotulo: 'Pedidos', valor: 0, formato: 'numero', variacao: null },
    { rotulo: 'Ticket médio', valor: 0, formato: 'moeda', variacao: null },
    { rotulo: 'Visitas', valor: 0, formato: 'numero', variacao: null },
    { rotulo: 'Conversão', valor: 0, formato: 'percentagem', variacao: null },
  ];
  if (!temBaseDeDados()) return vazio;

  const agora = new Date();
  const inicio = diasAtras(dias);
  const inicioAnterior = diasAtras(dias * 2);

  try {
    const somaPedidos = async (de: Date, ate: Date) => {
      const [r] = await db
        .select({
          n: sql<number>`count(*)::int`,
          total: sql<number>`coalesce(sum(${pedidos.totalCents}), 0)::int`,
        })
        .from(pedidos)
        .where(
          and(
            gte(pedidos.criadoEm, de),
            lt(pedidos.criadoEm, ate),
            inArray(pedidos.estado, RECEITA),
          ),
        );
      return { n: r?.n ?? 0, total: r?.total ?? 0 };
    };

    const contaVisitas = async (de: Date, ate: Date) => {
      const [r] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(agendamentos)
        .where(and(gte(agendamentos.inicioEm, de), lt(agendamentos.inicioEm, ate)));
      return r?.n ?? 0;
    };

    const [atual, anterior, visitasAtual, visitasAnterior] = await Promise.all([
      somaPedidos(inicio, agora),
      somaPedidos(inicioAnterior, inicio),
      contaVisitas(inicio, agora),
      contaVisitas(inicioAnterior, inicio),
    ]);

    /** Variação percentual; null quando não há base de comparação. */
    const varPct = (a: number, b: number) => (b === 0 ? null : Math.round(((a - b) / b) * 100));

    const ticket = atual.n ? Math.round(atual.total / atual.n) : 0;
    const ticketAnt = anterior.n ? Math.round(anterior.total / anterior.n) : 0;

    // pedidos que nasceram de uma visita / total de visitas
    const [conv] = await db
      .select({ n: sql<number>`count(distinct ${pedidos.agendamentoId})::int` })
      .from(pedidos)
      .where(
        and(
          gte(pedidos.criadoEm, inicio),
          sql`${pedidos.agendamentoId} is not null`,
          inArray(pedidos.estado, RECEITA),
        ),
      );
    const conversao = visitasAtual ? Math.round(((conv?.n ?? 0) / visitasAtual) * 100) : 0;

    return [
      {
        rotulo: 'Receita',
        valor: atual.total,
        formato: 'moeda',
        variacao: varPct(atual.total, anterior.total),
      },
      { rotulo: 'Pedidos', valor: atual.n, formato: 'numero', variacao: varPct(atual.n, anterior.n) },
      {
        rotulo: 'Ticket médio',
        valor: ticket,
        formato: 'moeda',
        variacao: varPct(ticket, ticketAnt),
      },
      {
        rotulo: 'Visitas',
        valor: visitasAtual,
        formato: 'numero',
        variacao: varPct(visitasAtual, visitasAnterior),
      },
      {
        rotulo: 'Conversão',
        valor: conversao,
        formato: 'percentagem',
        variacao: null,
        nota: 'visitas que viraram pedido',
      },
    ];
  } catch {
    return vazio;
  }
}

/* ------------------------------------------------------------------ *
 *  Séries para os gráficos
 * ------------------------------------------------------------------ */

export type PontoSerie = { rotulo: string; valor: number; secundario?: number };

/** Receita por semana, últimas 12 semanas. */
export async function receitaPorSemana(): Promise<PontoSerie[]> {
  if (!temBaseDeDados()) return [];
  try {
    const linhas = await db
      .select({
        semana: sql<string>`to_char(date_trunc('week', ${pedidos.criadoEm}), 'DD/MM')`,
        total: sql<number>`coalesce(sum(${pedidos.totalCents}), 0)::int`,
        n: sql<number>`count(*)::int`,
      })
      .from(pedidos)
      .where(
        and(
          gte(pedidos.criadoEm, diasAtras(84)),
          inArray(pedidos.estado, RECEITA),
        ),
      )
      .groupBy(sql`date_trunc('week', ${pedidos.criadoEm})`)
      .orderBy(sql`date_trunc('week', ${pedidos.criadoEm})`);

    return linhas.map((l) => ({ rotulo: l.semana, valor: l.total, secundario: l.n }));
  } catch {
    return [];
  }
}

/** Peças mais vendidas. */
export async function pecasMaisVendidas(limite = 6): Promise<PontoSerie[]> {
  if (!temBaseDeDados()) return [];
  try {
    const linhas = await db
      .select({
        nome: pedidoItens.nomeProduto,
        qtd: sql<number>`sum(${pedidoItens.quantidade})::int`,
        receita: sql<number>`sum(${pedidoItens.quantidade} * ${pedidoItens.precoUnitarioCents})::int`,
      })
      .from(pedidoItens)
      .innerJoin(pedidos, eq(pedidos.id, pedidoItens.pedidoId))
      .where(inArray(pedidos.estado, RECEITA))
      .groupBy(pedidoItens.nomeProduto)
      .orderBy(sql`sum(${pedidoItens.quantidade}) desc`)
      .limit(limite);

    return linhas.map((l) => ({ rotulo: l.nome, valor: l.qtd, secundario: l.receita }));
  } catch {
    return [];
  }
}

/** Quando as clientes agendam — dia da semana. */
export async function visitasPorDiaSemana(): Promise<PontoSerie[]> {
  if (!temBaseDeDados()) return [];
  const NOMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  try {
    const linhas = await db
      .select({
        dia: sql<number>`extract(dow from ${agendamentos.inicioEm})::int`,
        n: sql<number>`count(*)::int`,
      })
      .from(agendamentos)
      .where(gte(agendamentos.inicioEm, diasAtras(180)))
      .groupBy(sql`extract(dow from ${agendamentos.inicioEm})`);

    const mapa = new Map(linhas.map((l) => [l.dia, l.n]));
    return NOMES.map((nome, i) => ({ rotulo: nome, valor: mapa.get(i) ?? 0 }));
  } catch {
    return [];
  }
}

/** Origem dos pedidos. */
export async function origemPedidos(): Promise<PontoSerie[]> {
  if (!temBaseDeDados()) return [];
  const ROTULOS: Record<string, string> = {
    site: 'Site',
    visita: 'Visita',
    whatsapp: 'WhatsApp',
    atelier: 'Ateliê',
  };
  try {
    const linhas = await db
      .select({ origem: pedidos.origem, n: sql<number>`count(*)::int` })
      .from(pedidos)
      .where(inArray(pedidos.estado, RECEITA))
      .groupBy(pedidos.origem);
    return linhas.map((l) => ({ rotulo: ROTULOS[l.origem] ?? l.origem, valor: l.n }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ *
 *  Taxa de recompra a 90 dias
 * ------------------------------------------------------------------ */

export type Recompra = {
  base: number;
  voltaram: number;
  taxa: number;
  disponivel: boolean;
};

/**
 * De quantas clientes que compraram há mais de 90 dias, quantas voltaram
 * a comprar dentro desses 90 dias?
 *
 * É o melhor indicador de saúde deste negócio — melhor do que receita
 * mensal, que oscila com sazonalidade e com uma única venda grande. Em
 * lingerie, quem volta é quem confia: no tamanho, no atendimento e na
 * discrição. Uma taxa em queda avisa de um problema meses antes de a
 * receita cair.
 */
export async function taxaRecompra90(): Promise<Recompra> {
  const vazio = { base: 0, voltaram: 0, taxa: 0, disponivel: false };
  if (!temBaseDeDados()) return vazio;

  try {
    const bruto = await db.execute(sql`
      with primeira as (
        select ${pedidos.clienteId} as cliente_id,
               min(${pedidos.criadoEm}) as primeira_em
        from ${pedidos}
        where ${pedidos.estado} in ('confirmado','preparado','enviado','entregue')
        group by ${pedidos.clienteId}
      ),
      elegiveis as (
        -- só quem já teve 90 dias para voltar
        select * from primeira where primeira_em < now() - interval '90 days'
      )
      select
        (select count(*)::int from elegiveis) as base,
        (select count(distinct e.cliente_id)::int
           from elegiveis e
           join ${pedidos} p on p.cliente_id = e.cliente_id
          where p.criado_em > e.primeira_em
            and p.criado_em <= e.primeira_em + interval '90 days'
            and p.estado in ('confirmado','preparado','enviado','entregue')
        ) as voltaram
    `);

    const r = primeiraLinha<{ base: number; voltaram: number }>(bruto);
    const base = Number(r?.base ?? 0);
    const voltaram = Number(r?.voltaram ?? 0);

    return {
      base,
      voltaram,
      taxa: base ? Math.round((voltaram / base) * 100) : 0,
      // com menos de 10 clientes a percentagem é ruído, não sinal
      disponivel: base >= 10,
    };
  } catch {
    return vazio;
  }
}

/* ------------------------------------------------------------------ *
 *  Novas vs. recorrentes
 * ------------------------------------------------------------------ */

export async function novasVsRecorrentes(dias = 90) {
  const vazio = { novas: 0, recorrentes: 0 };
  if (!temBaseDeDados()) return vazio;
  try {
    const bruto = await db.execute(sql`
      with contagem as (
        select ${pedidos.clienteId} as cliente_id, count(*)::int as n
        from ${pedidos}
        where ${pedidos.criadoEm} >= now() - (${dias} || ' days')::interval
          and ${pedidos.estado} in ('confirmado','preparado','enviado','entregue')
        group by ${pedidos.clienteId}
      )
      select
        count(*) filter (where n = 1)::int as novas,
        count(*) filter (where n > 1)::int as recorrentes
      from contagem
    `);
    const r = primeiraLinha<{ novas: number; recorrentes: number }>(bruto);
    return { novas: Number(r?.novas ?? 0), recorrentes: Number(r?.recorrentes ?? 0) };
  } catch {
    return vazio;
  }
}
