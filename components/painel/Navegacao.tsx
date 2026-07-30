'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const ITENS = [
  { href: '', rotulo: 'Hoje', icone: 'M3 11.5 12 4l9 7.5M5.5 9.8V20h13V9.8' },
  { href: '/pedidos', rotulo: 'Pedidos', icone: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9ZM3 7.5 12 12m0 0 9-4.5M12 12v9' },
  { href: '/visitas', rotulo: 'Visitas', icone: 'M8 2.5v4M16 2.5v4M3.5 9.5h17M4.5 5h15a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z' },
  { href: '/numeros', rotulo: 'Números', icone: 'M3 20h18M6.5 20V11M12 20V5M17.5 20v-6' },
  { href: '/crescer', rotulo: 'Crescer', icone: 'M3 17.5 9 11l4 4 8-8M15 6.5h6v6' },
  { href: '/notas', rotulo: 'Notas', icone: 'M8 3.5h8a2 2 0 0 1 2 2v15l-6-3-6 3v-15a2 2 0 0 1 2-2Z' },
  { href: '/clientes', rotulo: 'Clientes', icone: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.8' },
];

export function Navegacao({ base, nome }: { base: string; nome: string }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const ativo = (href: string) => {
    const alvo = `${base}${href}`;
    return href === '' ? pathname === base || pathname === `${base}/` : pathname.startsWith(alvo);
  };

  return (
    <>
      {/* barra superior — apenas em tela pequeno */}
      <div className="flex items-center justify-between border-b border-carvao/10 bg-marfim px-5 py-3 lg:hidden">
        <span className="display text-lg">Gestão</span>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-label="Menu"
          aria-expanded={aberto}
          className="p-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-5 w-5">
            {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <aside
        className={`${
          aberto ? 'block' : 'hidden'
        } shrink-0 border-carvao/10 bg-marfim lg:block lg:w-56 lg:border-r`}
      >
        <div className="sticky top-0 flex h-full flex-col p-5 lg:h-screen">
          <div className="mb-8 hidden lg:block">
            <p className="display text-xl">Gestão</p>
            <p className="mt-0.5 text-xs text-carvao/45">{nome}</p>
          </div>

          <nav className="space-y-1">
            {ITENS.map((i) => (
              <Link
                key={i.rotulo}
                href={`${base}${i.href}`}
                onClick={() => setAberto(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  ativo(i.href)
                    ? 'bg-terracota/10 text-terracota'
                    : 'text-carvao/70 hover:bg-linho/60 hover:text-carvao'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                >
                  <path d={i.icone} />
                </svg>
                {i.rotulo}
              </Link>
            ))}
          </nav>

          <form action={`${base}/sair`} method="post" className="mt-auto pt-6">
            <button
              type="submit"
              className="w-full px-3 py-2.5 text-left text-sm text-carvao/45 transition-colors hover:text-bordeaux"
            >
              Terminar sessão
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
