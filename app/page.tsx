import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { CartaoProduto } from '@/components/sections/CartaoProduto';
import { WhatsAppFlutuante, BotaoMarcarWhatsApp } from '@/components/ui/BotaoWhatsApp';
import { obterDestaques } from '@/lib/api';

/** ISR: a homepage é estática e revalida a cada 5 minutos. */
export const revalidate = 300;

export default async function Homepage() {
  const destaques = await obterDestaques();

  return (
    <main id="conteudo">
      <Hero />

      {/* ------------------------- coleção em destaque ------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-12">
        <header className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="olho mb-3">A coleção</p>
            <h2 className="display max-w-xl text-[clamp(2rem,4.5vw,3.5rem)]">
              Poucas peças. Todas pensadas para durar anos.
            </h2>
          </div>
          <Link href="/colecao" className="sublinhado shrink-0 text-sm tracking-[0.18em] uppercase">
            Ver tudo →
          </Link>
        </header>

        <div className="grid gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
          {destaques.map((p, i) => (
            <CartaoProduto key={p.id} produto={p} prioridade={i < 2} />
          ))}
        </div>
      </section>

      {/* ---------------------------- os materiais ---------------------------- */}
      <section className="bg-linho/60 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-12">
          <div className="grao relative aspect-[4/5] overflow-hidden">
            <Image
              src="/produtos/hero-silk.jpg"
              alt="Seda amoreira italiana em close"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="olho mb-3">A matéria-prima</p>
            <h2 className="display mb-8 text-[clamp(2rem,4vw,3.25rem)]">
              Escolhemos o tecido antes de desenhar a peça.
            </h2>
            <p className="mb-10 max-w-lg leading-relaxed text-carvao/75">
              É ao contrário do habitual, e é de propósito. Um bom molde numa
              fibra medíocre continua a ser desconfortável às três da tarde.
              Por isso começamos pelo fio.
            </p>

            <dl className="space-y-8">
              {[
                ['Seda amoreira, 19 momme', 'Como, Itália', 'Termorreguladora: refresca no verão, aquece no inverno. Grade 6A, o fio mais longo e uniforme que existe.'],
                ['Renda Chantilly', 'Caudry, França', 'Teares Leavers centenários. Borda festonada que não precisa de costura — não marca sob a roupa.'],
                ['Algodão Pima e MicroModal®', 'Peru · Áustria', 'Fibra extralonga colhida à mão, forrada a celulose de faia. Absorve 50% mais humidade do que o algodão comum.'],
              ].map(([nome, origem, texto]) => (
                <div key={nome} className="border-t border-carvao/12 pt-5">
                  <dt className="flex items-baseline justify-between gap-4">
                    <span className="display text-xl">{nome}</span>
                    <span className="shrink-0 text-xs text-dourado">{origem}</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-carvao/65">{texto}</dd>
                </div>
              ))}
            </dl>

            <Link href="/materiais" className="sublinhado mt-10 self-start text-sm tracking-[0.18em] uppercase">
              Conhecer todos os materiais →
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------ o serviço exclusivo ------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="olho mb-3">O serviço da casa</p>
            <h2 className="display mb-8 text-[clamp(2rem,4.5vw,3.5rem)]">
              A prova acontece onde você se sente em casa.
            </h2>
            <p className="mb-10 max-w-lg leading-relaxed text-carvao/75">
              Oito em cada dez mulheres usam o tamanho errado. Quase nunca é
              culpa delas — é do provador frio, da pressa, do espelho de corpo
              inteiro sob luz branca. Nós fazemos ao contrário: a consultora vai
              a sua casa, leva as peças, e o tempo é seu.
            </p>

            <ol className="space-y-7">
              {[
                ['01', 'Antes', 'Uma conversa curta por telefone ou vídeo. Percebemos o que procura e o que já não funciona.'],
                ['02', 'A visita', '90 minutos. Medição rigorosa, provas de vários modelos e a explicação de cada material.'],
                ['03', 'Depois', 'Ajustes no ateliê quando necessário, sem custo. E a sua ficha de medidas guardada — a próxima escolha leva dois minutos.'],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-6 border-t border-carvao/12 pt-5">
                  <span className="display shrink-0 text-lg text-dourado">{n}</span>
                  <div>
                    <h3 className="mb-1.5 text-lg">{t}</h3>
                    <p className="text-sm leading-relaxed text-carvao/65">{d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agendar"
                className="inline-block bg-carvao px-10 py-4 text-center text-sm tracking-[0.18em] text-marfim uppercase transition-colors hover:bg-bordeaux"
              >
                Marcar a minha consulta
              </Link>
              <BotaoMarcarWhatsApp variante="linha" rotulo="Marcar por WhatsApp" />
            </div>
          </div>

          <div className="grao relative aspect-[3/4] overflow-hidden lg:aspect-[4/5]">
            <Image
              src="/produtos/atelier.jpg"
              alt="Sala de consulta do ateliê A Dona Lingerie"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* -------------------------------- rodapé ------------------------------ */}
      <footer className="bg-carvao py-20 text-marfim/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="display mb-4 text-3xl text-marfim">A Dona Lingerie</p>
              <p className="max-w-sm text-sm leading-relaxed">
                Ateliê em Lisboa, Príncipe Real. Prova ao domicílio em Lisboa,
                Barreiro, Almada, Setúbal, Cascais e Porto.
              </p>
            </div>
            {[
              ['Casa', ['Coleção', 'Materiais', 'O ateliê', 'Prova em casa']],
              ['Apoio', ['Guia de tamanhos', 'Cuidados', 'Trocas', 'Privacidade']],
            ].map(([titulo, itens]) => (
              <nav key={titulo as string}>
                <p className="olho mb-5">{titulo}</p>
                <ul className="space-y-3 text-sm">
                  {(itens as string[]).map((i) => (
                    <li key={i}>
                      <Link href="#" className="sublinhado">{i}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <p className="mt-16 border-t border-marfim/10 pt-8 text-xs text-marfim/45">
            © {new Date().getFullYear()} A Dona Lingerie. Feito com cuidado em Portugal.
          </p>
        </div>
      </footer>

      <WhatsAppFlutuante />
    </main>
  );
}
