'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, pedidos, pedidoEventos, type EstadoPedido } from '@/lib/db';
import { exigirSessao, ADMIN_PATH } from '@/lib/auth';
import { podeTransitar } from '@/lib/pedidos';

/**
 * Muda o estado de uma pedido e regista o evento.
 *
 * As duas escritas acontecem na mesma transação: se o registo do evento
 * falhar, o estado também não muda. Uma linha do tempo com buracos é pior
 * do que não ter linha do tempo — dá a ilusão de estar completa.
 */
export async function mudarEstadoPedido(formData: FormData) {
  const sessao = await exigirSessao();

  const id = String(formData.get('id') ?? '');
  const novo = String(formData.get('estado') ?? '') as EstadoPedido;
  const nota = String(formData.get('nota') ?? '').trim() || null;

  if (!id || !novo) return;

  const [atual] = await db
    .select({ estado: pedidos.estado })
    .from(pedidos)
    .where(eq(pedidos.id, id))
    .limit(1);

  if (!atual) return;

  // A validação é do servidor, não da interface. Um POST forjado não passa.
  if (!podeTransitar(atual.estado, novo)) return;

  await db.transaction(async (tx) => {
    await tx
      .update(pedidos)
      .set({ estado: novo, atualizadoEm: new Date() })
      .where(eq(pedidos.id, id));

    await tx.insert(pedidoEventos).values({
      pedidoId: id,
      estadoAnterior: atual.estado,
      estadoNovo: novo,
      autorId: sessao.uid,
      // o nome fica congelado: se o usuário for apagado, o histórico
      // continua a dizer quem fez o quê
      autorNome: sessao.nome,
      nota,
    });
  });

  const base = `/${ADMIN_PATH}`;
  revalidatePath(`${base}/pedidos`);
  revalidatePath(`${base}/pedidos/ficha`);
  revalidatePath(base);
}

/** Guarda notas internas e código de seguimento. */
export async function guardarDetalhes(formData: FormData) {
  await exigirSessao();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  await db
    .update(pedidos)
    .set({
      notasInternas: String(formData.get('notasInternas') ?? '').trim() || null,
      codigoSeguimento: String(formData.get('codigoSeguimento') ?? '').trim() || null,
      atualizadoEm: new Date(),
    })
    .where(eq(pedidos.id, id));

  revalidatePath(`/${ADMIN_PATH}/pedidos/ficha`);
}
