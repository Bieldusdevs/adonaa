import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Duas estratégias, escolhidas pelo ambiente:
 *
 *  · Vercel (serverless) → driver HTTP da Neon. Sem pool a manter vivo entre
 *    invocações, que é o que evita esgotar as ligações do Postgres quando a
 *    função escala.
 *  · Local / Docker / Kubernetes → postgres-js com pool tradicional.
 *
 * A ligação é preguiçosa (lazy): só se abre no primeiro acesso a `db`. Sem
 * isto, o simples facto de importar este módulo durante o build da Vercel
 * bastava para rebentar quando `DATABASE_URL` ainda não está definida.
 */

type Cliente = ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;

let _db: Cliente | null = null;

function criar(): Cliente {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL não está definida. Configure-a em .env (local) ou nas Environment Variables da Vercel.',
    );
  }

  const ehServerless = !!process.env.VERCEL || process.env.DB_DRIVER === 'neon';

  return ehServerless
    ? drizzle(neon(url), { schema })
    : drizzlePg(
        postgres(url, {
          max: Number(process.env.PG_POOL_MAX ?? 10),
          idle_timeout: 20,
          connect_timeout: 10,
          prepare: false,
        }),
        { schema, logger: process.env.NODE_ENV === 'development' },
      );
}

/** Proxy que adia a ligação até à primeira query. */
export const db = new Proxy({} as Cliente, {
  get(_alvo, prop) {
    _db ??= criar();
    const valor = Reflect.get(_db as object, prop);
    return typeof valor === 'function' ? valor.bind(_db) : valor;
  },
});

/** Há configuração de base de dados neste ambiente? */
export const temBaseDeDados = () => !!process.env.DATABASE_URL;

export { schema };
export * from './schema';
export type DB = Cliente;
