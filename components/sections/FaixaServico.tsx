import Image from 'next/image';
import Link from 'next/link';

/**
 * Faixa do serviço — entra logo abaixo do hero, ANTES da coleção.
 *
 * A ordem é deliberada: quem chega ao site sem saber o tamanho não compra.
 * Oferecer ajuda antes do catálogo respeita a ordem real da hesitação.
 * Altura contida para não competir com o hero.
 */
export function FaixaServico() {
  return (
    <section className="bg-pessego" aria-labelledby="faixa-servico">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:gap-8 lg:px-12">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-marfim/70">
          <Image
            src="/produtos/vendedora.jpg"
            alt="Ana, fundadora de A Dona Lingerie"
            fill
            sizes="64px"
            className="object-cover object-top"
          />
        </div>

        <p id="faixa-servico" className="flex-1 text-center sm:text-left">
          <span className="display block text-xl text-carvao sm:text-2xl">
            Não sabe o seu tamanho? Eu vou aí.
          </span>
          <span className="mt-1 block text-sm text-carvao/65">
            90 minutos, sem compromisso. Belo Horizonte, Nova Lima, Contagem, Betim, Sabará e Santa Luzia.
          </span>
        </p>

        <Link href="/visita-em-casa" className="btn-acao shrink-0">
          Marcar visita
        </Link>
      </div>
    </section>
  );
}
