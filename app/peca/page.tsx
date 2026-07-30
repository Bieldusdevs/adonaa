import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { obterProduto } from '@/lib/api';
import { FichaMateriais } from '@/components/sections/FichaMateriais';
import { BotaoPartilhar, BotaoMarcarWhatsApp, WhatsAppFlutuante } from '@/components/ui/BotaoWhatsApp';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adonalingerie.pt';

export const revalidate = 600;

/**
 * A peça vem por query string (`?ref=slug`) em vez de segmento dinâmico.
 *
 * A pasta teria de se chamar `[slug]`, e o uploader web do GitHub recusa
 * parênteses retos nos nomes. O `next.config.ts` reescreve
 * `/colecao/aurora` para `/peca?ref=aurora`, por isso o endereço que a
 * cliente vê — e que partilha por WhatsApp — continua a ser o bonito.
 */
type Busca = { searchParams: Promise<{ ref?: string }> };

export async function generateMetadata({ searchParams }: Busca): Promise<Metadata> {
  const { ref: slug } = await searchParams;
  const produto = slug ? await obterProduto(slug) : null;
  if (!produto) return { title: 'Peça não encontrada' };

  return {
    title: produto.nome,
    description: produto.resumo,
    openGraph: {
      title: `${produto.nome} · A Dona Lingerie`,
      description: produto.resumo,
      images: produto.imagens?.map((i) => ({ url: i.url })),
    },
  };
}

const euros = (c: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(c / 100);

export default async function PaginaProduto({ searchParams }: Busca) {
  const { ref: slug } = await searchParams;
  const produto = slug ? await obterProduto(slug) : null;
  if (!produto) notFound();

  return (
    <main id="conteudo" className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
      <nav className="olho mb-12">
        <Link href="/colecao" className="sublinhado">Coleção</Link>
        <span className="mx-3 text-carvao/25">/</span>
        <span className="text-carvao/50">{produto.nome}</span>
      </nav>

      <div className="grid gap-16 lg:grid-cols-2">
        <div className="space-y-4">
          {produto.imagens?.map((img, i) => (
            <div key={img.url} className="grao relative aspect-[4/5] overflow-hidden bg-linho">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={92}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-16 lg:self-start">
          <p className="olho mb-3">{produto.colecao}</p>
          <h1 className="display text-[clamp(2.25rem,5vw,3.75rem)]">{produto.nome}</h1>
          <p className="display mt-4 text-2xl text-bordeaux">{euros(produto.precoCents)}</p>

          <p className="mt-8 leading-relaxed text-carvao/80">{produto.descricao}</p>

          {produto.historia && (
            <blockquote className="mt-8 border-l-2 border-dourado/40 py-1 pl-6 text-[15px] leading-relaxed text-carvao/60 italic">
              {produto.historia}
            </blockquote>
          )}

          <div className="mt-10">
            <p className="mb-4 text-xs tracking-wider text-carvao/55 uppercase">Cor</p>
            <div className="flex gap-4">
              {produto.cores?.map((c) => (
                <button
                  key={c.hex}
                  className="group flex flex-col items-center gap-2"
                  aria-label={c.nome}
                >
                  <span
                    className="h-9 w-9 rounded-full ring-1 ring-carvao/15 ring-offset-4 ring-offset-marfim transition-all group-hover:ring-bordeaux"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] text-carvao/50">{c.nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-xs tracking-wider text-carvao/55 uppercase">Tamanho</p>
              <Link href="/visita-em-casa" className="sublinhado text-xs text-terracota">
                Não sei o meu tamanho — provo em casa
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {produto.tamanhos?.map((t) => (
                <button
                  key={t}
                  className="min-w-14 border border-carvao/15 px-4 py-3 text-sm transition-all hover:border-bordeaux hover:text-bordeaux"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3">
            <button className="bg-carvao px-10 py-4 text-sm tracking-[0.18em] text-marfim uppercase transition-colors hover:bg-bordeaux">
              Adicionar ao cesto
            </button>
            <Link
              href="/agendar"
              className="btn-acao w-full"
            >
              Provar em casa, sem compromisso
            </Link>
            <BotaoMarcarWhatsApp
              produto={produto.nome}
              rotulo="Falar com uma consultora"
              variante="linha"
              className="w-full"
            />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-carvao/10 pt-6">
            <BotaoPartilhar
              titulo={produto.nome}
              descricao={produto.resumo}
              url={`${SITE}/colecao/${produto.slug}`}
              preco={euros(produto.precoCents)}
            />
            <span className="text-xs text-carvao/40">Ref. {produto.slug.slice(-8).toUpperCase()}</span>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-carvao/50">
            Envio gratuito em Portugal continental · Trocas em 30 dias ·
            Embalagem discreta, sem qualquer identificação exterior.
          </p>
        </div>
      </div>

      {!!produto.composicao?.length && <FichaMateriais composicao={produto.composicao} />}

      <WhatsAppFlutuante produto={produto.nome} />
    </main>
  );
}
