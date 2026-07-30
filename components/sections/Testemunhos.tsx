'use client';

import { motion } from 'motion/react';

/**
 * Testemunhos — primeiro nome e cidade, nunca apelido nem fotografia.
 *
 * Em lingerie a discrição faz parte do produto. Uma cliente que aceita dar
 * testemunho não aceita necessariamente aparecer. Pedir menos aumenta o
 * número de pessoas dispostas a dizer sim.
 *
 * NOTA: substituir por testemunhos reais antes de publicar. Os textos
 * abaixo servem de guia de tom — concretos, com uma objeção superada,
 * sem superlativos.
 */

const TESTEMUNHOS = [
  {
    texto:
      'Usei o mesmo tamanho durante doze anos. Estava errado. A Ana mediu-me em cinco minutos na minha própria sala e percebi porque é que nada me assentava bem.',
    nome: 'Marta',
    cidade: 'Barreiro',
    contexto: 'Prova em casa',
  },
  {
    texto:
      'Confesso que a ideia de receber alguém em casa para isto me deixava desconfortável. Passou nos primeiros dois minutos. Foi como estar com uma amiga que percebe muito de tecidos.',
    nome: 'Rita',
    cidade: 'Lisboa',
    contexto: 'Prova em casa',
  },
  {
    texto:
      'Não levei nada na primeira visita e ninguém me fez sentir mal por isso. Voltei duas semanas depois e comprei três conjuntos.',
    nome: 'Sofia',
    cidade: 'Almada',
    contexto: 'Cliente desde 2024',
  },
];

export function Testemunhos() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 lg:px-12">
      <p className="olho mb-3">O que dizem</p>
      <h2 className="display mb-16 max-w-xl text-[clamp(1.9rem,4vw,3rem)]">
        Palavras de quem já me recebeu em casa
      </h2>

      <div className="grid gap-10 md:grid-cols-3">
        {TESTEMUNHOS.map((t, i) => (
          <motion.figure
            key={t.nome}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-carvao/12 pt-8"
          >
            <span aria-hidden className="display block text-4xl leading-none text-nude">
              &ldquo;
            </span>
            <blockquote className="mt-3 text-[15px] leading-relaxed text-carvao/75">
              {t.texto}
            </blockquote>
            <figcaption className="mt-6">
              <span className="display text-lg">{t.nome}</span>
              <span className="mt-0.5 block text-xs tracking-wider text-carvao/45 uppercase">
                {t.cidade} · {t.contexto}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
