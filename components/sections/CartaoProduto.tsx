'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { Produto } from '@/lib/db';
import { BotaoPartilhar } from '@/components/ui/BotaoWhatsApp';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adonalingerie.pt';

const euros = (cents: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100);

/**
 * Cartão com inclinação 3D muito contida (máx. 6°).
 * O objetivo é dar profundidade à fotografia, não fazer o cartão "dançar".
 */
export function CartaoProduto({ produto, prioridade = false }: { produto: Produto; prioridade?: boolean }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const mola = { stiffness: 140, damping: 18, mass: 0.4 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], ['6deg', '-6deg']), mola);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], ['-6deg', '6deg']), mola);
  const brilhoX = useTransform(mx, [-0.5, 0.5], ['20%', '80%']);

  function aoMover(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  const imagem = produto.imagens?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1100 }}
      className="group"
    >
      <motion.div
        onMouseMove={aoMover}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      >
        <Link href={`/colecao/${produto.slug}`} className="block">
          <div className="grao relative aspect-[4/5] overflow-hidden bg-linho">
            {imagem && (
              <Image
                src={imagem.url}
                alt={imagem.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                priority={prioridade}
                quality={90}
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
              />
            )}

            {/* reflexo que segue o cursor */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: useTransform(
                  brilhoX,
                  (x) => `radial-gradient(60% 50% at ${x} 30%, rgba(255,246,234,0.32), transparent 70%)`,
                ),
              }}
            />

            {produto.destaque && (
              <span className="absolute top-5 left-5 bg-marfim/92 px-4 py-1.5 text-[10px] tracking-[0.22em] uppercase text-bordeaux backdrop-blur-sm">
                Favorita da casa
              </span>
            )}

            {/* partilha rápida — aparece no hover, sempre visível no toque */}
            <div
              className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <BotaoPartilhar
                compacto
                titulo={produto.nome}
                descricao={produto.resumo}
                preco={euros(produto.precoCents)}
                url={`${SITE}/colecao/${produto.slug}`}
              />
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between gap-6" style={{ transform: 'translateZ(30px)' }}>
            <div>
              <p className="olho mb-2">{produto.colecao}</p>
              <h3 className="display text-2xl">{produto.nome}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-carvao/65">{produto.resumo}</p>
            </div>
            <p className="display shrink-0 text-xl text-bordeaux">{euros(produto.precoCents)}</p>
          </div>

          <div className="mt-4 flex items-center gap-2" style={{ transform: 'translateZ(20px)' }}>
            {produto.cores?.map((c) => (
              <span
                key={c.hex}
                title={c.nome}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-carvao/15 ring-offset-2 ring-offset-marfim"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="ml-3 text-xs text-carvao/45">
              {produto.tamanhos?.join(' · ')}
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}
