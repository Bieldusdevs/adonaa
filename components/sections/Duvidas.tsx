/**
 * Dúvidas frequentes — as cinco perguntas que travam a decisão.
 *
 * Usa <details>/<summary> nativos: funcionam sem JavaScript, são
 * acessíveis por omissão e o browser trata da navegação por teclado.
 * A animação vem do CSS em globals.css.
 *
 * O JSON-LD faz o Google mostrar estas respostas diretamente na pesquisa —
 * e as perguntas são exatamente as que alguém escreve no Google antes de
 * marcar uma visita.
 */

const PERGUNTAS = [
  {
    p: 'E se eu não souber o meu tamanho?',
    r: 'É a dúvida mais comum, e não precisa de saber. A medição faz parte da visita: meço, explico o que encontrei e provamos vários modelos. A maioria das clientes descobre que usava o tamanho errado há anos.',
  },
  {
    p: 'A visita tem algum custo?',
    r: 'Não. Não há taxa de deslocação nem valor mínimo de compra. A consulta é gratuita mesmo que não leve nada.',
  },
  {
    p: 'Sou obrigada a comprar alguma coisa?',
    r: 'De maneira nenhuma. Cerca de um terço das clientes não leva nada na primeira visita — e muitas voltam a marcar depois. Fica pelo menos com as suas medidas certas.',
  },
  {
    p: 'A embalagem identifica a marca?',
    r: 'Não. A caixa é neutra, sem nome nem logótipo no exterior. Na visita, chego com uma mala comum — ninguém no prédio precisa de saber o motivo.',
  },
  {
    p: 'Posso trocar se não servir?',
    r: 'Sim, em 30 dias. Por questões de higiene, peças íntimas só se trocam fechadas e com etiqueta. Se comprou depois de uma prova em casa, o tamanho raramente falha.',
  },
];

export function Duvidas() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 lg:px-12">
      <p className="olho mb-3">Antes de decidir</p>
      <h2 className="display mb-12 text-[clamp(1.9rem,4vw,3rem)]">Dúvidas frequentes</h2>

      <div className="divide-y divide-carvao/12 border-y border-carvao/12">
        {PERGUNTAS.map(({ p, r }) => (
          <details key={p} className="faq-item group py-6">
            <summary className="flex items-start justify-between gap-6 text-left">
              <span className="display text-xl transition-colors group-hover:text-terracota">
                {p}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="faq-sinal mt-1.5 h-4 w-4 shrink-0 text-terracota"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="faq-resposta mt-4 max-w-2xl pr-10 text-[15px] leading-relaxed text-carvao/70">
              {r}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-carvao/60">
        Ficou alguma por responder?{' '}
        <a href="/agendar" className="sublinhado text-terracota">
          Pergunte-me diretamente
        </a>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: PERGUNTAS.map(({ p, r }) => ({
              '@type': 'Question',
              name: p,
              acceptedAnswer: { '@type': 'Answer', text: r },
            })),
          }),
        }}
      />
    </section>
  );
}
