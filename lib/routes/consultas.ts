import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { db, temBaseDeDados, clientes, consultas } from '@/lib/db';
import { limiteConsulta, redis } from '@/lib/cache';

export const consultasRoute = new Hono();

const novaConsulta = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  assunto: z.string().min(3).max(160),
  mensagem: z.string().min(10).max(2000),
  produtoId: z.string().uuid().optional(),
  consentimentoLgpd: z.literal(true),
});

/** POST /consultas — dúvidas sobre tamanho, materiais ou pedidos especiais. */
consultasRoute.post('/', zValidator('json', novaConsulta), async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0] ?? 'anon';
  const { success } = await limiteConsulta.limit(ip);
  if (!success) return c.json({ erro: 'Muitos pedidos.' }, 429);

  const d = c.req.valid('json');

  if (!temBaseDeDados()) {
    return c.json(
      { ok: true, mensagem: 'Obrigada. Respondemos em até 24 horas úteis.' },
      201,
    );
  }

  const [cliente] = await db
    .insert(clientes)
    .values({ nome: d.nome, email: d.email, consentimentoLgpd: true })
    .onConflictDoUpdate({ target: clientes.email, set: { nome: d.nome } })
    .returning();

  const [consulta] = await db
    .insert(consultas)
    .values({
      clienteId: cliente.id,
      assunto: d.assunto,
      mensagem: d.mensagem,
      produtoId: d.produtoId,
    })
    .returning();

  await redis.lpush('fila:notificacoes', JSON.stringify({ tipo: 'nova_consulta', consultaId: consulta.id }));

  return c.json({ ok: true, consulta, mensagem: 'Obrigada. Respondemos em até 24 horas úteis.' }, 201);
});

/** GET /consultas — painel interno. */
consultasRoute.get('/', async (c) => {
  const status = c.req.query('status');
  const lista = await db
    .select()
    .from(consultas)
    .where(status ? eq(consultas.status, status as any) : undefined)
    .orderBy(desc(consultas.criadoEm))
    .limit(100);
  return c.json({ itens: lista });
});
