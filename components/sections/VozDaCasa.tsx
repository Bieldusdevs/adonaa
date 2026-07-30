import Image from 'next/image';

/**
 * "Voz da casa" — a fundadora fala na primeira pessoa.
 *
 * A fotografia é de trabalho, não de estúdio: a medir, no ateliê. Uma foto
 * posada de banco de imagens destruiria exatamente a confiança que esta
 * secção existe para construir. Se não houver fotografia real, a secção sai.
 *
 * É também a única imagem do site sem qualquer animação. A quietude
 * comunica seriedade.
 */
export function VozDaCasa() {
  return (
    <section className="bg-linho/60 py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-12">
        <div className="grao relative aspect-4/5 overflow-hidden">
          <Image
            src="/produtos/vendedora.jpg"
            alt="Ana, fundadora de A Dona Lingerie, a medir renda no ateliê"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="olho mb-3">Quem está do outro lado</p>
          <h2 className="display mb-10 text-[clamp(1.9rem,4vw,3rem)]">
            Não é o seu corpo que está errado.
          </h2>

          <blockquote className="space-y-6 text-lg leading-relaxed text-carvao/80">
            <p>
              Comecei porque me fartei de ver mulheres a usar o tamanho errado
              e a acharem que o problema eram elas.
            </p>
            <p>
              Não é. É do provador com luz branca, da pressa, da vergonha de
              pedir outro tamanho. Nada disso tem a ver com o corpo de ninguém.
            </p>
            <p>
              Por isso vou a sua casa: ao seu espelho, à sua luz, no seu tempo.
              Levo a mala, levo a fita métrica e levo paciência. O resto
              fazemos juntas.
            </p>
          </blockquote>

          <p className="display mt-10 text-2xl text-bordeaux italic">Ana</p>
          <p className="mt-1 text-xs tracking-wider text-carvao/50 uppercase">
            Fundadora · Ateliê no Príncipe Real, Lisboa
          </p>
        </div>
      </div>
    </section>
  );
}
