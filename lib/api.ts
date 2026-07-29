import 'server-only';
import { eq, and, desc } from 'drizzle-orm';
import { db, temBaseDeDados, produtos, materiais, produtoMateriais } from '@/lib/db';
import type { Produto, Material } from '@/lib/db';
import { CATALOGO_EXEMPLO } from '@/lib/catalogo-exemplo';

type Composicao = { percentual: number; aplicacao: string | null; material: Material };
export type ProdutoCompleto = Produto & { composicao: Composicao[] };

/**
 * Acesso a dados dos Server Components — vai direto à base de dados.
 *
 * A versão anterior fazia `fetch` à própria API. Funciona em dev, mas parte
 * no build da Vercel: durante a geração estática não há servidor a ouvir.
 * Um RSC e o Route Handler correm no mesmo processo, portanto pedir por HTTP
 * a nós próprios só acrescentava uma viagem de rede e um ponto de falha.
 *
 * Cada função degrada com elegância: se a base de dados ainda não existir ou
 * estiver vazia, cai no catálogo de exemplo. Um deploy nunca deve ficar em
 * branco por causa de uma variável de ambiente em falta.
 */

async function comFallback<T>(consulta: () => Promise<T>, alternativa: T): Promise<T> {
  if (!temBaseDeDados()) return alternativa;
  try {
    const r = await consulta();
    return Array.isArray(r) && r.length === 0 ? alternativa : r;
  } catch (e) {
    console.warn('[dados] a usar catálogo de exemplo:', (e as Error).message);
    return alternativa;
  }
}

export async function obterDestaques(): Promise<Produto[]> {
  return comFallback(
    () =>
      db
        .select()
        .from(produtos)
        .where(and(eq(produtos.ativo, true), eq(produtos.destaque, true)))
        .orderBy(desc(produtos.criadoEm))
        .limit(3),
    CATALOGO_EXEMPLO.filter((p) => p.destaque).slice(0, 3),
  );
}

export async function obterProdutos(colecao?: string): Promise<Produto[]> {
  return comFallback(
    () =>
      db
        .select()
        .from(produtos)
        .where(and(eq(produtos.ativo, true), colecao ? eq(produtos.colecao, colecao) : undefined))
        .orderBy(desc(produtos.destaque), desc(produtos.criadoEm))
        .limit(24),
    colecao ? CATALOGO_EXEMPLO.filter((p) => p.colecao === colecao) : CATALOGO_EXEMPLO,
  );
}

export async function obterProduto(slug: string): Promise<ProdutoCompleto | null> {
  const exemplo = CATALOGO_EXEMPLO.find((p) => p.slug === slug);
  const alternativa = exemplo ? { ...exemplo, composicao: [] as Composicao[] } : null;

  if (!temBaseDeDados()) return alternativa;

  try {
    const [produto] = await db.select().from(produtos).where(eq(produtos.slug, slug)).limit(1);
    if (!produto) return alternativa;

    const composicao = await db
      .select({
        percentual: produtoMateriais.percentual,
        aplicacao: produtoMateriais.aplicacao,
        material: materiais,
      })
      .from(produtoMateriais)
      .innerJoin(materiais, eq(materiais.id, produtoMateriais.materialId))
      .where(eq(produtoMateriais.produtoId, produto.id));

    return { ...produto, composicao };
  } catch (e) {
    console.warn('[dados] a usar catálogo de exemplo:', (e as Error).message);
    return alternativa;
  }
}
