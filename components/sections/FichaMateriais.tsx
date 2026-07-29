'use client';

import { motion } from 'motion/react';
import type { Material } from '@/lib/db';

type Composicao = { percentual: number; aplicacao: string | null; material: Material };

/** Barra de 1 a 5 desenhada com traços — mais discreta do que uma barra cheia. */
function Escala({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5">
      <span className="text-xs tracking-wider text-carvao/60 uppercase">{rotulo}</span>
      <span className="flex gap-1.5" aria-label={`${valor} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className={`h-px w-7 origin-left ${i < valor ? 'bg-bordeaux' : 'bg-carvao/15'}`}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * Ficha técnica dos materiais — o argumento de venda mais forte da casa.
 * Cada material conta de onde vem, como se comporta e como se cuida dele.
 */
export function FichaMateriais({ composicao }: { composicao: Composicao[] }) {
  return (
    <section className="border-t border-carvao/10 py-20">
      <p className="olho mb-3">Ficha técnica</p>
      <h2 className="display mb-14 text-4xl md:text-5xl">
        O que está, exatamente, contra a sua pele
      </h2>

      <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
        {composicao.map(({ material, percentual, aplicacao }, i) => (
          <motion.article
            key={material.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-baseline justify-between border-b border-carvao/10 pb-4">
              <div>
                <h3 className="display text-2xl">{material.nome}</h3>
                <p className="mt-1 text-xs tracking-wider text-carvao/50 uppercase">
                  {aplicacao} · {percentual}% da peça
                </p>
              </div>
              {material.origem && (
                <p className="shrink-0 text-right text-xs text-dourado">{material.origem}</p>
              )}
            </header>

            <p className="mt-5 text-[15px] leading-relaxed text-carvao/75">{material.descricao}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-8 text-sm">
              <div className="border-t border-carvao/8 py-2">
                <dt className="text-xs text-carvao/45 uppercase">Composição</dt>
                <dd className="mt-1">{material.composicao}</dd>
              </div>
              {material.gramatura && (
                <div className="border-t border-carvao/8 py-2">
                  <dt className="text-xs text-carvao/45 uppercase">Gramatura</dt>
                  <dd className="mt-1">{material.gramatura}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 border-t border-carvao/8 pt-2">
              <Escala rotulo="Respirabilidade" valor={material.respirabilidade} />
              <Escala rotulo="Toque" valor={material.toque} />
              <Escala rotulo="Caimento" valor={material.caimento} />
            </div>

            {!!material.certificacoes?.length && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {material.certificacoes.map((cert) => (
                  <li
                    key={cert}
                    className="border border-dourado/30 px-3 py-1 text-[10px] tracking-[0.14em] text-dourado uppercase"
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-5 text-xs leading-relaxed text-carvao/50">
              <span className="text-carvao/70">Como cuidar · </span>
              {material.cuidados}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
