import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq, gte, lte } from 'drizzle-orm';
import { db, temBaseDeDados, clientes, agendamentos } from '@/lib/db';
import { redis, limiteAgendamento, invalidate } from '@/lib/cache';
import { linkMarcacao, gerarReferencia } from '@/lib/whatsapp';

export const agendamentosRoute = new Hono();

const DURACAO_MIN = 90;
const HORARIOS = ['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];
const CIDADES = ['Lisboa', 'Barreiro', 'Almada', 'Setúbal', 'Cascais', 'Porto'];

/* --------------------------- disponibilidade --------------------------- */
agendamentosRoute.get('/disponibilidade', async (c) => {
  const data = c.req.query('data');
  if (!data) return c.json({ erro: 'Informe a data' }, 400);

  const chave = `disp:${data}`;
  const hit = await redis.get(chave);
  if (hit) return c.json(hit);

  /**
   * Sem base de dados, mostramos a agenda toda livre em vez de falhar.
   * A confirmação humana acontece sempre a seguir — por e-mail ou WhatsApp —
   * portanto um horário mostrado a mais custa muito menos do que um
   * formulário de marcação que não abre.
   */
  let tomados = new Set<string>();

  if (temBaseDeDados()) {
    try {
      const ocupados = await db
        .select({ inicioEm: agendamentos.inicioEm })
        .from(agendamentos)
        .where(
          and(
            gte(agendamentos.inicioEm, new Date(`${data}T00:00:00Z`)),
            lte(agendamentos.inicioEm, new Date(`${data}T23:59:59Z`)),
            eq(agendamentos.status, 'confirmado'),
          ),
        );
      tomados = new Set(ocupados.map((o) => o.inicioEm.toISOString().slice(11, 16)));
    } catch (e) {
      console.warn('[agenda] a mostrar todos os horários livres:', (e as Error).message);
    }
  }
  const payload = {
    data,
    duracaoMin: DURACAO_MIN,
    cidadesAtendidas: CIDADES,
    horarios: HORARIOS.map((h) => ({ hora: h, disponivel: !tomados.has(h) })),
  };

  await redis.set(chave, payload, { ex: 60 });
  return c.json(payload);
});

/* ------------------------------ marcação ------------------------------- */
const agendarSchema = z
  .object({
    nome: z.string().min(2, 'Diga-nos como a devemos tratar'),
    email: z.string().email('E-mail inválido'),
    telefone: z.string().min(9).max(20),
    tipo: z.enum(['domicilio', 'atelier', 'video']).default('domicilio'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora: z.enum(HORARIOS as [string, ...string[]]),
    endereco: z.string().min(5).optional(),
    cidade: z.string().optional(),
    codigoPostal: z.string().optional(),
    observacoes: z.string().max(1000).optional(),
    /** Canal preferido para a confirmação. */
    canal: z.enum(['email', 'whatsapp']).default('email'),
    consentimentoLgpd: z.literal(true, {
      errorMap: () => ({ message: 'É necessário aceitar a política de privacidade' }),
    }),
  })
  .refine((d) => d.tipo !== 'domicilio' || (!!d.endereco && !!d.cidade), {
    message: 'Para a prova em casa precisamos da morada e da cidade',
    path: ['endereco'],
  });

agendamentosRoute.post('/', zValidator('json', agendarSchema), async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0] ?? 'anon';
  const { success } = await limiteAgendamento.limit(ip);
  if (!success) return c.json({ erro: 'Muitos pedidos. Tente novamente mais tarde.' }, 429);

  const d = c.req.valid('json');
  const inicioEm = new Date(`${d.data}T${d.hora}:00Z`);

  if (inicioEm.getTime() < Date.now() + 24 * 3600 * 1000) {
    return c.json({ erro: 'As marcações exigem 24 horas de antecedência.' }, 422);
  }

  const referencia = gerarReferencia();

  /**
   * Sem base de dados configurada, a marcação não se perde: devolvemos a
   * referência e a conversa de WhatsApp pronta. A cliente conclui por lá.
   */
  if (!temBaseDeDados()) {
    return c.json(
      {
        ok: true,
        referencia,
        whatsapp: linkMarcacao({
          nome: d.nome, tipo: d.tipo, data: d.data, hora: d.hora,
          cidade: d.cidade, referencia,
        }),
        mensagem: 'Recebemos o seu pedido. Confirme os detalhes com a sua consultora por WhatsApp.',
      },
      201,
    );
  }

  try {
    const [cliente] = await db
      .insert(clientes)
      .values({
        nome: d.nome,
        email: d.email,
        telefone: d.telefone,
        consentimentoLgpd: true,
      })
      .onConflictDoUpdate({ target: clientes.email, set: { nome: d.nome, telefone: d.telefone } })
      .returning();

    const [agendamento] = await db
      .insert(agendamentos)
      .values({
        clienteId: cliente.id,
        tipo: d.tipo,
        inicioEm,
        duracaoMin: DURACAO_MIN,
        endereco: d.endereco,
        cidade: d.cidade,
        codigoPostal: d.codigoPostal,
        observacoes: d.observacoes
          ? `${d.observacoes}\n\n[ref ${referencia} · canal ${d.canal}]`
          : `[ref ${referencia} · canal ${d.canal}]`,
        status: 'pendente',
      })
      .returning();

    await invalidate(`disp:${d.data}`);
    await redis.lpush(
      'fila:notificacoes',
      JSON.stringify({ tipo: 'confirmacao_agendamento', agendamentoId: agendamento.id, canal: d.canal }),
    );

    /**
     * Devolvemos também o link de WhatsApp já preenchido com a referência.
     * Quem escolheu esse canal salta direto para a conversa — a marcação
     * já ficou registada, o WhatsApp é só a confirmação humana.
     */
    return c.json(
      {
        ok: true,
        agendamento,
        referencia,
        whatsapp: linkMarcacao({
          nome: d.nome,
          tipo: d.tipo,
          data: d.data,
          hora: d.hora,
          cidade: d.cidade,
          referencia,
        }),
        mensagem:
          d.canal === 'whatsapp'
            ? 'Pedido registado. Abra a conversa para falar já com a sua consultora.'
            : 'Recebemos o seu pedido. A sua consultora entrará em contacto em até 4 horas para confirmar.',
      },
      201,
    );
  } catch (err: any) {
    if (err?.code === '23505') {
      return c.json({ erro: 'Este horário acabou de ser reservado. Escolha outro, por favor.' }, 409);
    }
    throw err;
  }
});

/* --------------------------- pré-reserva WhatsApp ---------------------- *
 * Fluxo curto: a cliente só dá o nome (ou nem isso) e segue para a conversa.
 * Guardamos a intenção para a equipa saber de onde veio o contacto e para
 * medir a conversão do canal — sem obrigar ninguém a preencher um formulário.
 * ----------------------------------------------------------------------- */
const preReservaSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  tipo: z.enum(['domicilio', 'atelier', 'video']).default('domicilio'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hora: z.string().optional(),
  cidade: z.string().max(96).optional(),
  produto: z.string().max(160).optional(),
  origem: z.string().max(64).default('site'),
});

agendamentosRoute.post('/pre-reserva', zValidator('json', preReservaSchema), async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0] ?? 'anon';
  const { success } = await limiteAgendamento.limit(`pre:${ip}`);
  if (!success) return c.json({ erro: 'Muitos pedidos.' }, 429);

  const d = c.req.valid('json');
  const referencia = gerarReferencia();

  // TTL de 7 dias: se a conversa não acontecer, a intenção expira sozinha.
  await redis.set(
    `prereserva:${referencia}`,
    { ...d, ip, criadoEm: new Date().toISOString() },
    { ex: 60 * 60 * 24 * 7 },
  );
  await redis.incr(`stats:prereserva:${new Date().toISOString().slice(0, 10)}`);

  return c.json({
    ok: true,
    referencia,
    whatsapp: linkMarcacao({ ...d, referencia }),
  });
});
