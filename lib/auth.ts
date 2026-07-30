import 'server-only';
import { hash, verify } from '@node-rs/argon2';
import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db, usuarios, sessoesAdmin, type Usuario } from '@/lib/db';
import { redis } from '@/lib/cache';

/* ------------------------------------------------------------------ *
 *  Constantes
 * ------------------------------------------------------------------ */

/**
 * A URL do painel vive numa variável de ambiente. Trocá-la é editar a
 * variável e fazer redeploy — 30 segundos, sem tocar em código.
 *
 * Importante: isto é ofuscação, não segurança. URLs vazam por histórico,
 * cabeçalho Referer, extensões e logs de proxy. O que protege o painel é
 * o login abaixo; a URL secreta apenas garante que ninguém tropeça nele.
 */
export const ADMIN_PATH = process.env.ADMIN_PATH ?? 'gestao-ad-2f9k';

const COOKIE = 'adona_sessao';
const DURACAO_H = 8; // um dia de trabalho, sem sobreviver à noite

/** Parâmetros OWASP 2024 para Argon2id. */
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

/**
 * Hash Argon2id genuíno de uma cadeia aleatória, usado para igualar o
 * tempo de resposta quando o e-mail não existe. Ver `entrar()` abaixo.
 */
const HASH_MANEQUIM =
  '$argon2id$v=19$m=19456,t=2,p=1$JjmW+L72Dh7FggCgKfTTOA$snKw6cteIXr0GJrk4i4JUtoI41QX8K5xYEyJaSeG1dM';

/** Trava de tentativas. */
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MIN = 15;

function segredo() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      'SESSION_SECRET em falta ou demasiado curta (mínimo 32 caracteres). Gere com: openssl rand -hex 32',
    );
  }
  return new TextEncoder().encode(s);
}

/* ------------------------------------------------------------------ *
 *  Palavras-passe
 * ------------------------------------------------------------------ */

export const criarHash = (senha: string) => hash(senha, ARGON);

export async function verificarHash(hashGuardado: string, senha: string) {
  try {
    return await verify(hashGuardado, senha, ARGON);
  } catch {
    return false;
  }
}

/** Regras mínimas. 12 caracteres é o consenso atual — não 8. */
export function validarSenha(p: string): string | null {
  if (p.length < 12) return 'A senha precisa de pelo menos 12 caracteres.';
  const comuns = ['password', 'palavrapasse', '123456', 'qwerty', 'adona', 'lingerie'];
  if (comuns.some((c) => p.toLowerCase().includes(c))) {
    return 'Essa senha é demasiado previsível. Escolha outra.';
  }
  return null;
}

/* ------------------------------------------------------------------ *
 *  Trava de tentativas
 * ------------------------------------------------------------------ */

export async function estaBloqueado(chave: string) {
  const n = await redis.get<number>(`login:falhas:${chave}`);
  return (n ?? 0) >= MAX_TENTATIVAS;
}

async function registarFalha(chave: string) {
  const k = `login:falhas:${chave}`;
  const n = (await redis.get<number>(k)) ?? 0;
  await redis.set(k, n + 1, { ex: BLOQUEIO_MIN * 60 });
}

const limparFalhas = (chave: string) => redis.del(`login:falhas:${chave}`);

/* ------------------------------------------------------------------ *
 *  Sessão
 * ------------------------------------------------------------------ */

export type Sessao = { uid: string; email: string; nome: string; papel: string };

async function criarSessao(u: Usuario) {
  const token = await new SignJWT({ uid: u.id, email: u.email, nome: u.nomeCompleto, papel: u.papel })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_H}h`)
    .sign(segredo());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DURACAO_H * 3600,
    path: '/',
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return payload as unknown as Sessao;
  } catch {
    return null;
  }
}

export async function terminarSessao() {
  (await cookies()).delete(COOKIE);
}

/* ------------------------------------------------------------------ *
 *  Entrada
 * ------------------------------------------------------------------ */

type Resultado = { ok: true } | { ok: false; erro: string };

export async function entrar(email: string, senha: string): Promise<Resultado> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido';
  const userAgent = h.get('user-agent') ?? '';
  const emailNorm = email.toLowerCase().trim();

  /**
   * A mensagem de erro é sempre a mesma, exista o e-mail ou não.
   * Distinguir os casos diria a um atacante quais os e-mails válidos.
   */
  const GENERICO = 'Credenciais inválidas.';

  if ((await estaBloqueado(ip)) || (await estaBloqueado(emailNorm))) {
    return {
      ok: false,
      erro: `Demasiadas tentativas. Aguarde ${BLOQUEIO_MIN} minutos e tente de novo.`,
    };
  }

  const registar = (usuarioId: string | null, sucesso: boolean) =>
    db
      .insert(sessoesAdmin)
      .values({ usuarioId, emailTentado: emailNorm, sucesso, ip, userAgent })
      .catch(() => {}); // a auditoria nunca deve impedir o login

  const [u] = await db.select().from(usuarios).where(eq(usuarios.email, emailNorm)).limit(1);

  if (!u || !u.ativo) {
    /**
     * Verificação em vazio contra um hash real, mesmo sem usuário.
     *
     * Sem isto, responder "não existe" seria instantâneo enquanto
     * "senha errada" levaria ~28ms — e essa diferença permitiria
     * descobrir quais os e-mails registados, um de cada vez.
     *
     * O hash abaixo é Argon2id genuíno, de uma cadeia aleatória que
     * nenhuma senha corresponde. Verificá-lo custa exatamente o
     * mesmo que verificar um hash real.
     */
    await verify(HASH_MANEQUIM, senha, ARGON).catch(() => false);
    await Promise.all([registarFalha(ip), registarFalha(emailNorm), registar(null, false)]);
    return { ok: false, erro: GENERICO };
  }

  if (!(await verificarHash(u.senhaHash, senha))) {
    await Promise.all([registarFalha(ip), registarFalha(emailNorm), registar(u.id, false)]);
    return { ok: false, erro: GENERICO };
  }

  await Promise.all([
    limparFalhas(ip),
    limparFalhas(emailNorm),
    registar(u.id, true),
    db.update(usuarios).set({ ultimoAcessoEm: new Date() }).where(eq(usuarios.id, u.id)),
  ]);

  await criarSessao(u);
  return { ok: true };
}

/** Usar no topo de cada página do painel. */
export async function exigirSessao(): Promise<Sessao> {
  const s = await lerSessao();
  if (!s) throw new Error('SEM_SESSAO');
  return s;
}
