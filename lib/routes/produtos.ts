import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, temBaseDeDados, produtos, materiais, produtoMateriais } from '@/lib/db';
import { cached, invalidate } from '@/lib/cache';

export const produtosRoute = new Hono();

const listaQuery = z.object({
  colecao: z.string().optional(),
  destaque: z.coerce.boolean().optional(),
  limite: z.coerce.number().min(1).max(48).default(12),
  pagina: z.coerce.number().min(1).default(1),
});

/** GET /produtos — catálogo paginado, servido do Redis (TTL 5 min). */
produtosRoute.get('/', zValidator('query', listaQuery), async (c) => {
  const { colecao, destaque, limite, pagina } = c.req.valid('query');
  const key = `produtos:lista:${colecao ?? 'all'}:${destaque ?? 'all'}:${pagina}:${limite}`;

  if (!temBaseDeDados()) {
    return c.json({ itens: [], total: 0, pagina, paginas: 0 });
  }

  const data = await cached(key, 300, async () => {
    const where = and(
      eq(produtos.ativo, true),
      colecao ? eq(produtos.colecao, colecao) : undefined,
      destaque !== undefined ? eq(produtos.destaque, destaque) : undefined,
    );

    const [itens, [{ total }]] = await Promise.all([
      db
        .select()
        .from(produtos)
        .where(where)
        .orderBy(desc(produtos.destaque), desc(produtos.criadoEm))
        .limit(limite)
        .offset((pagina - 1) * limite),
      db.select({ total: sql<number>`count(*)::int` }).from(produtos).where(where),
    ]);

    return { itens, total, pagina, paginas: Math.ceil(total / limite) };
  });

  c.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return c.json(data);
});

/** GET /produtos/:slug — peça completa, com a ficha técnica dos materiais. */
produtosRoute.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  if (!temBaseDeDados()) return c.json({ erro: 'Peça não encontrada' }, 404);

  const data = await cached(`produtos:slug:${slug}`, 600, async () => {
    const [produto] = await db.select().from(produtos).where(eq(produtos.slug, slug)).limit(1);
    if (!produto) return null;

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
  });

  if (!data) return c.json({ erro: 'Peça não encontrada' }, 404);
  return c.json(data);
});

const upsert = z.object({
  slug: z.string().min(3).max(128),
  nome: z.string().min(2),
  colecao: z.string().min(2),
  resumo: z.string().max(280),
  descricao: z.string().min(10),
  precoCents: z.number().int().positive(),
  tamanhos: z.array(z.string()).default([]),
  destaque: z.boolean().default(false),
  estoque: z.number().int().min(0).default(0),
});

/** POST /produtos — área de gestão (protegida por sessão de admin). */
produtosRoute.post('/', zValidator('json', upsert), async (c) => {
  const body = c.req.valid('json');
  const [criado] = await db.insert(produtos).values(body).returning();
  await invalidate('produtos:*');
  return c.json(criado, 201);
});

produtosRoute.patch('/:id', zValidator('json', upsert.partial()), async (c) => {
  const [atualizado] = await db
    .update(produtos)
    .set({ ...c.req.valid('json'), atualizadoEm: new Date() })
    .where(eq(produtos.id, c.req.param('id')))
    .returning();
  await invalidate('produtos:*');
  return c.json(atualizado);
});
