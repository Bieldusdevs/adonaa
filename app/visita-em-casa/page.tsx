import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { ComoEUmaVisita } from '@/components/sections/ComoEUmaVisita';
import { Testemunhos } from '@/components/sections/Testemunhos';
import { FormularioAgendamento } from '@/components/sections/FormularioAgendamento';
import { MarcacaoRapidaWhatsApp } from '@/components/sections/MarcacaoRapidaWhatsApp';
import { WhatsAppFlutuante } from '@/components/ui/BotaoWhatsApp';

export const metadata: Metadata = {
  title: 'Prova de lingerie em casa · 90 minutos, sem compromisso',
  description:
    'Consultoria e prova de lingerie ao domicílio, gratuita e sem compromisso. Levo a mala com todos os tamanhos a Lisboa, Barreiro, Almada, Setúbal, Cascais e Porto.',
  openGraph: {
    title: 'Prova de lingerie em casa · A Dona Lingerie',
    description: 'Noventa minutos. O seu espelho. O seu tempo.',
    images: [{ url: '/produtos/mala-provas.jpg' }],
  },
};

const CIDADES = ['Lisboa', 'Barreiro', 'Almada', 'Setúbal', 'Cascais', 'Porto'];

export default function PaginaVisita() {
  return (
    <main id="conteudo">
      {/* ------------------------------- hero -------------------------------- */}
      <section className="bg-pessego/60">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-12">
          <div>
            <p className="olho mb-4">Serviço exclusivo · Gratuito</p>
            <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)]">
              Noventa minutos.
              <br />
              O seu espelho.
              <br />
              <span className="text-bordeaux italic">O seu tempo.</span>
            </h1>
            <p className="mt-8 max-w-lg leading-relaxed text-carvao/75">
              Levo a mala até si — todos os tamanhos da grelha, fita métrica e
              tempo que chegue. Sem custo, sem valor mínimo e sem obrigação
              nenhuma de comprar.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="#marcar" className="btn-acao">
                Marcar a minha visita
              </Link>
              <Link href="#como-funciona" className="btn-linha">
                Ver como funciona
              </Link>
            </div>
          </div>

          <div className="grao relative aspect-4/5 overflow-hidden lg:aspect-square">
            <Image
              src="/produtos/atelier.jpg"
              alt="Consulta de lingerie: fita métrica e amostras de tecido sobre mesa de mármore"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* --------------------------- como funciona --------------------------- */}
      <div id="como-funciona">
        <ComoEUmaVisita />
      </div>

      {/* ------------------------------ o que levo --------------------------- */}
      <section className="bg-linho/60 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-12">
          <div className="grao relative aspect-4/3 overflow-hidden lg:order-2">
            <Image
              src="/produtos/mala-provas.jpg"
              alt="Mala aberta com peças de lingerie dobradas, fita métrica e espelho de viagem"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="lg:order-1">
            <p className="olho mb-3">Sem surpresas</p>
            <h2 className="display mb-8 text-[clamp(1.9rem,4vw,3rem)]">O que levo comigo</h2>
            <p className="mb-8 max-w-lg leading-relaxed text-carvao/75">
              Ver a mala aberta tira a estranheza da coisa. É isto que entra em
              sua casa — nada mais, e sempre numa mala comum, sem qualquer
              identificação da marca.
            </p>

            <ul className="space-y-5">
              {[
                ['20 a 30 peças', 'Selecionadas a partir da nossa conversa antes da visita.'],
                ['Toda a grelha de tamanhos', 'Do PP ao XG, para provar sem constrangimento.'],
                ['Fita métrica e espelho dobrável', 'Caso prefira não usar o seu.'],
                ['Amostras de tecido', 'Para sentir a seda, a renda e o algodão antes de escolher.'],
              ].map(([titulo, texto]) => (
                <li key={titulo} className="flex gap-4 border-t border-carvao/12 pt-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    className="mt-1 h-4 w-4 shrink-0 text-terracota"
                    aria-hidden
                  >
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  <div>
                    <p className="text-[15px]">{titulo}</p>
                    <p className="mt-0.5 text-sm text-carvao/60">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------- onde vou --------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="olho mb-3">Área de serviço</p>
            <h2 className="display text-[clamp(1.9rem,4vw,3rem)]">Onde vou</h2>
          </div>

          <div>
            <ul className="flex flex-wrap gap-3">
              {CIDADES.map((c) => (
                <li
                  key={c}
                  className="border border-carvao/15 px-5 py-2.5 text-sm tracking-wide"
                >
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-l-2 border-terracota/40 pl-6">
              <p className="text-[15px] leading-relaxed text-carvao/75">
                <span className="text-carvao">A sua cidade não está na lista?</span>{' '}
                Não quer dizer que não. Se juntar duas ou três amigas, a viagem
                compensa quase sempre — fale comigo e vemos.
              </p>
              <Link href="/agendar" className="sublinhado mt-4 inline-block text-sm text-terracota">
                Perguntar sobre a minha zona →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 border-t border-carvao/12 pt-8 sm:grid-cols-3">
              {[
                ['Duração', '90 minutos (150 se for em grupo)'],
                ['Custo', 'Gratuito, sem mínimo de compra'],
                ['Horários', 'Das 10h às 20h, incluindo sábados'],
              ].map(([t, d]) => (
                <div key={t}>
                  <p className="text-xs tracking-wider text-carvao/45 uppercase">{t}</p>
                  <p className="mt-1.5 text-sm text-carvao/80">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Testemunhos />

      {/* -------------------------------- marcar ----------------------------- */}
      <section id="marcar" className="bg-linho/50 py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-16 max-w-2xl">
            <p className="olho mb-3">Vamos a isto</p>
            <h2 className="display text-[clamp(2rem,4.5vw,3.5rem)]">Marcar a minha visita</h2>
            <p className="mt-6 leading-relaxed text-carvao/70">
              Escolha o caminho que lhe der mais jeito. Se preferir falar antes
              de marcar, o WhatsApp é o mais rápido.
            </p>
          </div>

          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <MarcacaoRapidaWhatsApp />
            <Suspense fallback={<div className="h-96 animate-pulse bg-nude/30" />}>
              <FormularioAgendamento />
            </Suspense>
          </div>
        </div>
      </section>

      <WhatsAppFlutuante />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Prova de lingerie ao domicílio',
            serviceType: 'Consultoria e prova de lingerie em casa',
            provider: { '@type': 'ClothingStore', name: 'A Dona Lingerie' },
            areaServed: CIDADES.map((c) => ({ '@type': 'City', name: c })),
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              description: 'Consulta gratuita de 90 minutos, sem obrigação de compra.',
            },
          }),
        }}
      />
    </main>
  );
}
