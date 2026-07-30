'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

/**
 * "Como é uma visita" — remove o desconforto do desconhecido.
 *
 * Quem nunca teve uma consultora em casa imagina o pior: pressão para
 * comprar, um estranho na sala, constrangimento. Cada passo aqui responde
 * a um desses receios antes que ele se forme.
 *
 * Ícones de linha fina desenhados à mão — nunca emoji, que quebrariam
 * o registo da marca.
 */

const PASSOS = [
  {
    n: '01',
    titulo: 'Conversa antes',
    texto: 'Cinco minutos por WhatsApp. Percebo o que procura e o que já não funciona.',
    icone: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 20.5l1.6-4.8A8.4 8.4 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4Z" />
      </>
    ),
  },
  {
    n: '02',
    titulo: 'Chego discreta',
    texto: 'Mala neutra, sem nada que identifique a marca. Ninguém no prédio precisa de saber.',
    icone: (
      <>
        <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
        <path d="M8.5 7.5V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7v2.3" />
      </>
    ),
  },
  {
    n: '03',
    titulo: 'A prova é sua',
    texto: 'No seu quarto, no seu espelho, com a sua luz. Não num provador frio de luz branca.',
    icone: (
      <>
        <rect x="6" y="2.5" width="12" height="15" rx="6" />
        <path d="M12 17.5v4M9 21.5h6" />
      </>
    ),
  },
  {
    n: '04',
    titulo: 'Sem pressa nenhuma',
    texto: 'Se não levar nada, leva as suas medidas certas. E isso já é muito.',
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.2 2" />
      </>
    ),
  },
];

const GARANTIAS = [
  ['Gratuito', 'Não há taxa de deslocação nem valor mínimo de compra.'],
  ['Discreto', 'Chego sem nada que identifique a marca — mala neutra.'],
  ['Ao seu ritmo', '90 minutos reservados só para si. Prove tudo, ou nada.'],
];

export function ComoEUmaVisita() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 lg:px-12">
      <header className="mb-16 max-w-2xl">
        <p className="olho mb-3">O serviço da casa</p>
        <h2 className="display text-[clamp(2rem,4.5vw,3.5rem)]">Como é uma visita</h2>
        <p className="mt-6 leading-relaxed text-carvao/70">
          É mais simples do que parece — e não tem nada de constrangedor.
          Aqui fica exatamente o que acontece, do primeiro contato ao fim.
        </p>
      </header>

      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map((p, i) => (
          <motion.li
            key={p.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-carvao/12 pt-6"
          >
            <div className="mb-5 flex items-baseline justify-between">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-terracota"
                aria-hidden
              >
                {p.icone}
              </svg>
              <span className="display text-sm text-dourado">{p.n}</span>
            </div>
            <h3 className="display mb-2 text-xl">{p.titulo}</h3>
            <p className="text-sm leading-relaxed text-carvao/65">{p.texto}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-16 grid gap-8 border-t border-carvao/12 pt-10 sm:grid-cols-3">
        {GARANTIAS.map(([titulo, texto]) => (
          <div key={titulo}>
            <p className="olho mb-2">{titulo}</p>
            <p className="text-sm leading-relaxed text-carvao/65">{texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <Link href="/visita-em-casa" className="btn-acao">
          Saber mais sobre a visita
        </Link>
        <Link href="/agendar" className="btn-linha">
          Marcar agora
        </Link>
      </div>
    </section>
  );
}
