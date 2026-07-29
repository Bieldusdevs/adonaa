import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { FormularioAgendamento } from '@/components/sections/FormularioAgendamento';
import { MarcacaoRapidaWhatsApp } from '@/components/sections/MarcacaoRapidaWhatsApp';
import { WhatsAppFlutuante } from '@/components/ui/BotaoWhatsApp';

export const metadata: Metadata = {
  title: 'Marcar prova em casa',
  description:
    'Consultoria e prova de lingerie ao domicílio: 90 minutos, sem compromisso, em Lisboa, Barreiro, Almada, Setúbal, Cascais e Porto.',
};

export default function PaginaAgendar() {
  return (
    <main id="conteudo">
      <section className="relative overflow-hidden bg-linho/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="olho mb-4">Serviço exclusivo</p>
          <h1 className="display max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)]">
            Noventa minutos que mudam a forma como se veste.
          </h1>
          <p className="mt-8 max-w-xl leading-relaxed text-carvao/75">
            Sem custo e sem obrigação de compra. Se no fim não levar nada,
            leva pelo menos as suas medidas certas — e isso já é muito.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="grid gap-20 lg:grid-cols-[1fr_1.15fr]">
          <aside>
            <div className="grao relative mb-10 aspect-[4/5] overflow-hidden">
              <Image
                src="/produtos/atelier.jpg"
                alt="Ateliê de consulta"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <dl className="space-y-6 text-sm">
              {[
                ['Duração', '90 minutos, só para si'],
                ['Onde', 'Em sua casa, no ateliê ou por vídeo'],
                ['Cidades', 'Lisboa · Barreiro · Almada · Setúbal · Cascais · Porto'],
                ['Custo', 'Gratuito, sem compromisso'],
                ['Discrição', 'A consultora chega sem identificação da marca'],
              ].map(([t, d]) => (
                <div key={t} className="border-t border-carvao/12 pt-4">
                  <dt className="text-xs tracking-wider text-carvao/45 uppercase">{t}</dt>
                  <dd className="mt-1.5 text-carvao/80">{d}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12">
              <MarcacaoRapidaWhatsApp />
            </div>
          </aside>

          <div>
            <p className="olho mb-8">Ou marque com todos os detalhes</p>
            <Suspense fallback={<div className="h-96 animate-pulse bg-linho/50" />}>
              <FormularioAgendamento />
            </Suspense>
          </div>
        </div>
      </section>

      <WhatsAppFlutuante />
    </main>
  );
}
