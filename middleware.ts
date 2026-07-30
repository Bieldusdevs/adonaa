import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Guarda do painel.
 *
 * Corre no Edge, antes de qualquer página renderizar. Faz três coisas:
 *
 *  1. Traduz a URL secreta pública para a rota interna `/painel`.
 *  2. Devolve 404 a quem tentar `/painel` diretamente — a rota interna
 *     não deve ser acessível por outro caminho.
 *  3. Redireciona para o login quem não tiver sessão válida.
 *
 * Sobre o 404: um 403 confirmaria que ali existe alguma coisa. A resposta
 * a uma URL errada é indistinguível de qualquer página inexistente.
 *
 * Nota: o middleware corre no runtime Edge, onde não há acesso à base de
 * dados. Por isso só valida a assinatura do JWT — a verificação de que o
 * usuário continua ativo acontece nas próprias páginas.
 */

const ADMIN_PATH = process.env.ADMIN_PATH ?? 'gestao-ad-2f9k';
const COOKIE = 'adona_sessao';

function segredo() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? '');
}

async function temSessaoValida(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, segredo());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // A rota interna nunca responde diretamente.
  if (pathname === '/painel' || pathname.startsWith('/painel/')) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname !== `/${ADMIN_PATH}` && !pathname.startsWith(`/${ADMIN_PATH}/`)) {
    return NextResponse.next();
  }

  const resto = pathname.slice(ADMIN_PATH.length + 1) || '/';
  const ehLogin = resto === '/entrar';
  const autenticado = await temSessaoValida(req);

  // Quem já entrou não precisa de ver o formulário outra vez.
  if (ehLogin && autenticado) {
    return NextResponse.redirect(new URL(`/${ADMIN_PATH}`, req.url));
  }

  if (!ehLogin && !autenticado) {
    return NextResponse.redirect(new URL(`/${ADMIN_PATH}/entrar`, req.url));
  }

  const url = req.nextUrl.clone();
  url.pathname = `/painel${resto === '/' ? '' : resto}`;

  const res = NextResponse.rewrite(url);
  // Nem que o painel apareça algures, os motores de busca não o indexam.
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return res;
}

export const config = {
  matcher: ['/painel/:path*', '/painel', '/((?!api|_next/static|_next/image|favicon.ico|produtos).*)'],
};
