import { NextResponse } from 'next/server';
import { and, eq, gte, lte } from 'drizzle-orm';
import { db, agendamentos, clientes } from '@/lib/db';
import { linkMarcacao } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron diário (09:00) declarado em vercel.json.
 *
 * Prepara os lembretes das consultas do dia seguinte. A Vercel assina os
 * pedidos de cron com CRON_SECRET — sem essa verificação qualquer pessoa
 * conseguiria disparar o envio.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
  }

  const amanha = new Date(Date.now() + 864e5);
  const dia = amanha.toISOString().slice(0, 10);

  const marcacoes = await db
    .select({
      id: agendamentos.id,
      inicioEm: agendamentos.inicioEm,
      tipo: agendamentos.tipo,
      cidade: agendamentos.cidade,
      nome: clientes.nome,
      telefone: clientes.telefone,
    })
    .from(agendamentos)
    .innerJoin(clientes, eq(clientes.id, agendamentos.clienteId))
    .where(
      and(
        gte(agendamentos.inicioEm, new Date(`${dia}T00:00:00Z`)),
        lte(agendamentos.inicioEm, new Date(`${dia}T23:59:59Z`)),
        eq(agendamentos.status, 'confirmado'),
      ),
    );

  /**
   * Não enviamos mensagens automáticas em nome da casa: geramos os links e a
   * consultora carrega em enviar. Numa marca que vive de proximidade, um
   * lembrete robotizado às 9h da manhã custa mais do que rende.
   */
  const lembretes = marcacoes.map((m) => ({
    agendamentoId: m.id,
    cliente: m.nome,
    hora: m.inicioEm.toISOString().slice(11, 16),
    whatsapp: m.telefone
      ? linkMarcacao({ nome: m.nome, tipo: m.tipo, data: dia, hora: m.inicioEm.toISOString().slice(11, 16), cidade: m.cidade ?? undefined })
      : null,
  }));

  return NextResponse.json({ ok: true, dia, total: lembretes.length, lembretes });
}
