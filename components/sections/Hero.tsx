'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useRevelacaoTexto } from '@/lib/gsap';

// O 3D entra por import dinâmico: zero JS de Three.js no bundle inicial.
const CenaHero = dynamic(() => import('@/components/three/CenaHero').then((m) => m.CenaHero), {
  ssr: false,
});

export function Hero() {
  const tituloRef = useRevelacaoTexto<HTMLHeadingElement>(0.15);

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <CenaHero />

      <div className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="olho mb-8"
        >
          Ateliê de lingerie · Desde 2018
        </motion.p>

        <h1 ref={tituloRef} className="display max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)]">
          <span className="reveal-linha"><span>A peça certa</span></span>
          <span className="reveal-linha"><span>não se compra.</span></span>
          <span className="reveal-linha">
            <span className="italic text-bordeaux">Encontra-se.</span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-10 max-w-lg text-lg leading-relaxed text-carvao/75"
        >
          Seda italiana, renda de Caudry e algodão Pima — escolhidos um a um.
          E a Ana, que vai a sua casa com as provas na mala, para que nunca
          mais tenha de adivinhar o seu tamanho.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Link
            href="/agendar"
            className="btn-acao group relative overflow-hidden"
          >
            <span className="relative z-10">Marcar prova em casa</span>
          </Link>

          <Link
            href="/colecao"
            className="sublinhado inline-flex items-center gap-3 px-2 py-4 text-sm tracking-[0.18em] uppercase text-carvao"
          >
            Ver a coleção
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.3 }}
          className="mt-20 flex flex-wrap gap-x-14 gap-y-6 border-t border-carvao/10 pt-8"
        >
          {[
            ['90 min', 'de consulta, sem compromisso'],
            ['1 200+', 'clientes vestidas à medida'],
            ['6 cidades', 'com prova ao domicílio'],
          ].map(([n, t]) => (
            <div key={n}>
              <dt className="display text-3xl text-bordeaux">{n}</dt>
              <dd className="mt-1 text-xs tracking-wider text-carvao/55 uppercase">{t}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
