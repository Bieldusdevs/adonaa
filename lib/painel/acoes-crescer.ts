'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db, indicacoes, oportunidadesTratadas, clientes } from '@/lib/db';
import { exigirSessao, ADMIN_PATH } from '@/lib/auth';
import { gerarCodigoIndicacao } from '@/lib/painel/crescer';

/** Dispensa uma sugestão para que não volte a aparecer. */
export async function dispensarOportunidade(formData: FormData) {
  const sessao = await exigirSessao();
  const chave = String(formData.get('chave') ?? '');
  if (!chave) return;

  await db
    .insert(oportunidadesTratadas)
    .values({ chave, usuarioId: sessao.uid })
    .onConflictDoNothing();

  revalidatePath(`/${ADMIN_PATH}/crescer`);
}

/** Cria um código de indicação para uma cliente. */
export async function criarIndicacao(formData: FormData) {
  await exigirSessao();
  const clienteId = String(formData.get('clienteId') ?? '');
  if (!clienteId) return;

  const [c] = await db
    .select({ nome: clientes.nome })
    .from(clientes)
    .where(eq(clientes.id, clienteId))
    .limit(1);
  if (!c) return;

  /**
   * O código deriva do primeiro nome, portanto pode colidir. Tenta algumas
   * vezes antes de desistir — mais simples e mais legível do que um código
   * aleatório que ninguém consegue ditar ao telefone.
   */
  for (let i = 0; i < 5; i++) {
    try {
      await db.insert(indicacoes).values({
        codigo: gerarCodigoIndicacao(c.nome),
        clienteOrigemId: clienteId,
        descontoPercent: Number(formData.get('desconto') ?? 15),
      });
      break;
    } catch (e: unknown) {
      if ((e as { code?: string })?.code !== '23505') throw e;
    }
  }

  revalidatePath(`/${ADMIN_PATH}/crescer`);
}
