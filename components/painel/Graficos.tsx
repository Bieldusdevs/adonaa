import type { PontoSerie } from '@/lib/painel/analise';

/**
 * Gráficos em SVG puro.
 *
 * Recharts traria ~90 kB de JavaScript para o cliente e obrigaria a tornar
 * estas páginas Client Components. Para barras e uma linha simples, SVG
 * renderizado no servidor chega — a página fica com zero JS de gráficos e
 * carrega instantaneamente, que é o que importa num painel consultado
 * várias vezes por dia.
 */

const reais = (cents: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(cents / 100);

/* ------------------------------------------------------------------ *
 *  Barras horizontais — para nomes longos (peças, origens)
 * ------------------------------------------------------------------ */
export function BarrasHorizontais({
  dados,
  titulo,
  nota,
  formatar = (v: number) => String(v),
}: {
  dados: PontoSerie[];
  titulo: string;
  nota?: string;
  formatar?: (v: number) => string;
}) {
  const max = Math.max(...dados.map((d) => d.valor), 1);

  return (
    <section className="border border-carvao/10 bg-marfim p-5">
      <h3 className="olho mb-1">{titulo}</h3>
      {nota && <p className="mb-4 text-xs text-carvao/45">{nota}</p>}

      {dados.length === 0 ? (
        <p className="py-6 text-sm text-carvao/40">Ainda sem dados.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {dados.map((d) => (
            <li key={d.rotulo}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm">{d.rotulo}</span>
                <span className="shrink-0 text-sm text-carvao/60">{formatar(d.valor)}</span>
              </div>
              <div className="h-1.5 w-full bg-carvao/8">
                <div
                  className="h-full bg-terracota"
                  style={{ width: `${Math.max(2, (d.valor / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Barras verticais — séries temporais curtas
 * ------------------------------------------------------------------ */
export function BarrasVerticais({
  dados,
  titulo,
  nota,
  moeda = false,
}: {
  dados: PontoSerie[];
  titulo: string;
  nota?: string;
  moeda?: boolean;
}) {
  const max = Math.max(...dados.map((d) => d.valor), 1);
  const total = dados.reduce((s, d) => s + d.valor, 0);

  return (
    <section className="border border-carvao/10 bg-marfim p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="olho mb-1">{titulo}</h3>
          {nota && <p className="text-xs text-carvao/45">{nota}</p>}
        </div>
        {total > 0 && (
          <span className="display text-xl text-bordeaux">
            {moeda ? reais(total) : total}
          </span>
        )}
      </div>

      {dados.length === 0 ? (
        <p className="py-6 text-sm text-carvao/40">Ainda sem dados.</p>
      ) : (
        <div className="flex h-32 items-end gap-1.5">
          {dados.map((d) => (
            <div key={d.rotulo} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] text-carvao/0 transition-colors group-hover:text-carvao/60">
                {moeda ? reais(d.valor) : d.valor}
              </span>
              <div
                className="w-full bg-terracota/80 transition-colors group-hover:bg-terracota"
                style={{ height: `${Math.max(2, (d.valor / max) * 100)}%` }}
                title={`${d.rotulo}: ${moeda ? reais(d.valor) : d.valor}`}
              />
              <span className="text-[10px] whitespace-nowrap text-carvao/40">{d.rotulo}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 *  Anel de proporção — duas fatias
 * ------------------------------------------------------------------ */
export function Anel({
  titulo,
  nota,
  a,
  b,
}: {
  titulo: string;
  nota?: string;
  a: { rotulo: string; valor: number };
  b: { rotulo: string; valor: number };
}) {
  const total = a.valor + b.valor;
  const pct = total ? a.valor / total : 0;
  const R = 42;
  const C = 2 * Math.PI * R;

  return (
    <section className="border border-carvao/10 bg-marfim p-5">
      <h3 className="olho mb-1">{titulo}</h3>
      {nota && <p className="mb-4 text-xs text-carvao/45">{nota}</p>}

      {total === 0 ? (
        <p className="py-6 text-sm text-carvao/40">Ainda sem dados.</p>
      ) : (
        <div className="mt-4 flex items-center gap-6">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={R} fill="none" stroke="#e4cfc2" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#a85940"
              strokeWidth="10"
              strokeDasharray={`${C * pct} ${C}`}
            />
          </svg>

          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 bg-terracota" aria-hidden />
              <dt className="text-carvao/60">{a.rotulo}</dt>
              <dd className="ml-auto">{a.valor}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 bg-nude" aria-hidden />
              <dt className="text-carvao/60">{b.rotulo}</dt>
              <dd className="ml-auto">{b.valor}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
