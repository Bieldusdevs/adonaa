import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Upstash Redis fala por HTTP/REST, portanto funciona em funções serverless
 * onde sockets TCP persistentes não existem.
 *
 * `Redis.fromEnv()` atira uma exceção quando as variáveis não estão definidas
 * — e como isso acontecia no topo do módulo, bastava importar este ficheiro
 * durante o build da Vercel para o deploy falhar. Agora a criação é preguiçosa
 * e, sem Redis configurado, o sistema continua a servir: perde-se a cache e o
 * rate limit, não o site.
 */

let _redis: Redis | null = null;
let _tentado = false;

export function obterRedis(): Redis | null {
  if (_tentado) return _redis;
  _tentado = true;
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      _redis = Redis.fromEnv();
    }
  } catch {
    _redis = null;
  }
  if (!_redis) console.warn('[cache] Redis não configurado — a seguir sem cache.');
  return _redis;
}

/** Fachada tolerante: se não houver Redis, cada operação é um no-op. */
export const redis = {
  async get<T>(k: string): Promise<T | null> {
    return (await obterRedis()?.get<T>(k)) ?? null;
  },
  async set(k: string, v: unknown, o?: { ex?: number; nx?: boolean }) {
    return obterRedis()?.set(k, v, o as never) ?? null;
  },
  async del(...k: string[]) {
    return k.length ? (obterRedis()?.del(...k) ?? 0) : 0;
  },
  async incr(k: string) {
    return obterRedis()?.incr(k) ?? 0;
  },
  async lpush(k: string, ...v: string[]) {
    return obterRedis()?.lpush(k, ...v) ?? 0;
  },
  async scan(cursor: number, opts: { match: string; count: number }) {
    return obterRedis()?.scan(cursor, opts) ?? ([0, []] as [number, string[]]);
  },
};

/** Cache-aside com proteção contra stampede. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const r = obterRedis();
  if (!r) return loader();

  const hit = await r.get<T>(key);
  if (hit !== null && hit !== undefined) return hit;

  const lockKey = `lock:${key}`;
  const gotLock = await r.set(lockKey, '1', { ex: 10, nx: true });

  if (!gotLock) {
    await new Promise((res) => setTimeout(res, 120));
    const retry = await r.get<T>(key);
    if (retry !== null && retry !== undefined) return retry;
  }

  try {
    const value = await loader();
    await r.set(key, value, { ex: ttlSeconds });
    return value;
  } finally {
    await r.del(lockKey);
  }
}

/** Invalidação por padrão, com SCAN para não bloquear a instância. */
export async function invalidate(pattern: string) {
  const r = obterRedis();
  if (!r) return;
  let cursor = 0;
  do {
    const [next, keys] = await r.scan(cursor, { match: pattern, count: 200 });
    cursor = Number(next);
    if (keys.length) await r.del(...keys);
  } while (cursor !== 0);
}

/* ------------------------------------------------------------------ *
 *  Rate limiting — criado à primeira utilização, pela mesma razão.
 * ------------------------------------------------------------------ */
const SEM_LIMITE = { limit: async () => ({ success: true, remaining: 99 }) };

function criarLimite(prefix: string, max: number) {
  let inst: Ratelimit | typeof SEM_LIMITE | null = null;
  return {
    limit(id: string) {
      if (!inst) {
        const r = obterRedis();
        inst = r
          ? new Ratelimit({
              redis: r,
              limiter: Ratelimit.slidingWindow(max, '1 h'),
              analytics: true,
              prefix,
            })
          : SEM_LIMITE;
      }
      return inst.limit(id);
    },
  };
}

export const limiteAgendamento = criarLimite('rl:agendar', 5);
export const limiteConsulta = criarLimite('rl:consulta', 8);

/** Sessões leves. */
export const sessions = {
  async create(userId: string, ttl = 60 * 60 * 24 * 7) {
    const sid = crypto.randomUUID();
    await redis.set(`sess:${sid}`, { userId, iat: Date.now() }, { ex: ttl });
    return sid;
  },
  get: (sid: string) => redis.get<{ userId: string; iat: number }>(`sess:${sid}`),
  destroy: (sid: string) => redis.del(`sess:${sid}`),
};
