import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';
import { produtosRoute } from '@/lib/routes/produtos';
import { agendamentosRoute } from '@/lib/routes/agendamentos';
import { consultasRoute } from '@/lib/routes/consultas';

/**
 * A API Hono servida pelo Next como Route Handler.
 *
 * Vive em `app/api/hono/` — uma pasta de nome simples, de propósito. A rota
 * catch-all do Next chamar-se-ia `[[...route]]`, e o uploader web do GitHub
 * recusa pastas com parênteses retos. O `next.config.ts` reescreve
 * `/api/<qualquer-coisa>` para aqui, por isso os endereços públicos
 * mantêm-se: /api/produtos, /api/agendamentos, e por aí adiante.
 *
 * O Hono lê o caminho original do pedido, não o do ficheiro, portanto o
 * encaminhamento interno funciona exatamente como antes.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const app = new Hono().basePath('/api');

app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').split(','),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.get('/health', (c) =>
  c.json({ ok: true, servico: 'adona-api', regiao: process.env.VERCEL_REGION }),
);

app.route('/produtos', produtosRoute);
app.route('/agendamentos', agendamentosRoute);
app.route('/consultas', consultasRoute);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error('[erro]', err);
  return c.json({ erro: 'Algo correu mal. A nossa equipa já foi notificada.' }, 500);
});

app.notFound((c) => c.json({ erro: 'Rota não encontrada' }, 404));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
