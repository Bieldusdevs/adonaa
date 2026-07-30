# A Dona Lingerie

> A peça certa não se compra. Encontra-se.

Loja online e serviço de atendimento em domicílio de **A Dona Lingerie**.

**Ver o design agora:** abra `preview/index.html` — é o site completo numa página autónoma (hero com tecido animado, catálogo, ficha de materiais e formulário de agendamento em 3 passos), sem precisar de instalar nada.

---

## Publicar

```bash
./limpar-e-publicar.sh https://github.com/SEU-USER/SEU-REPO.git
```

Ou arraste os arquivos para o site do GitHub — já não há nomes de pasta com
parênteses retos, por isso o uploader web funciona. Depois importe o
repositório em [vercel.com/new](https://vercel.com/new) e clique Deploy, sem
configuração nenhuma. Guia completo em `GITHUB.md`.

As rotas dinâmicas são declaradas em `next.config.ts` (rewrites) em vez de no
nome das pastas: `app/peca/` serve `/colecao/<slug>` e `app/api/hono/` serve
`/api/*`. Os endereços públicos são os mesmos de sempre.

## Estrutura

```
a-dona-lingerie/
├── package.json          Aplicação Next.js única — a Vercel deteta sozinha
├── app/                  App Router
│   ├── page.tsx          Homepage
│   ├── agendar/          Agendamento (formulário + WhatsApp)
│   ├── peca/             Página de produto → URL /colecao/<slug>
│   └── api/hono/         API Hono → URLs /api/produtos, /api/agendamentos…
├── components/
│   ├── three/            React Three Fiber + shaders de seda
│   ├── sections/         Hero, produtos, materiais, agendamento
│   └── ui/               Botões de WhatsApp e partilha
├── lib/
│   ├── db/               Drizzle ORM + schema + seed
│   ├── routes/           Rotas da API (produtos, agendamentos, consultas)
│   ├── whatsapp.ts       Links de partilha e agendamento
│   └── cache.ts          Redis (Upstash) e rate limiting
├── shaders/              GLSL (WebGL2) + WGSL (WebGPU)
└── infra/                Docker e Kubernetes (autoalojamento opcional)
```

## Arrancar

```bash
npm install
npm run dev
```

| Serviço | Endereço |
|---|---|
| Site | http://localhost:3000 |
| API | http://localhost:3000/api |
| Grafana *(autoalojado)* | http://localhost:3001 · `admin` / `adona` |

## Decisões que vale a pena conhecer

**O 3D nunca atrasa a primeira pintura.** `CenaHero` entra por `next/dynamic` com `ssr: false` e só monta após o primeiro frame. Quem tem `prefers-reduced-motion` ativo recebe um gradiente de seda estático — bonito e a custo zero. No celular a malha cai de 144² para 64² segmentos e o DPR fica limitado a 1.5.

**O tecido do hero é um shader, não um vídeo.** `seda.vert.glsl` desloca os vértices com ruído simplex em duas camadas (a onda ampla do pano e a vibração fina da fibra) e o cursor "levanta" o tecido com atraso, por interpolação. O `seda.frag.glsl` faz brilho anisotrópico — a seda brilha ao longo da trama, não num ponto — com 1% de iridescência. Existe também `seda.wgsl`, um compute shader que faz o mesmo trabalho fora do pipeline gráfico quando `navigator.gpu` está disponível.

**As animações são contidas de propósito.** A inclinação dos cartões vai no máximo a 6°, a revelação de texto usa `expo.out` com stagger de 90 ms. É o suficiente para dar vida, pouco o bastante para nunca parecer um brinquedo — o que importa numa marca premium.

**Cache em duas camadas.** O Next serve HTML estático com ISR (`revalidate: 300`); a API serve JSON quente do Redis com proteção contra *cache stampede* (só uma requisição vai à base de dados quando o cache expira). Uma alteração no painel invalida os dois por tag.

**Agendamento à prova de corrida.** Há um índice único em `(consultora_id, inicio_em)`: se duas clientes pedirem o mesmo horário no mesmo instante, o Postgres devolve `23505` e a segunda recebe *"este horário acabou de ser reservado"* em vez de um duplo agendamento. Agendamentos exigem 24 h de antecedência e há rate-limit de 5/hora por IP.

**Privacidade levada a sério.** Medidas corporais só são guardadas com consentimento explícito (`consentimento_lgpd`), a embalagem não tem identificação exterior e a consultora chega sem marca visível — detalhes que constam do próprio schema e do copy.

## Métricas de negócio no Grafana

Além do habitual (p95, taxa de erro, memória), o dashboard mostra `adona_agendamentos_criados_total` por formato e dispara o alerta `SemAgendamentos` se passarem 6 horas sem nenhuma agendamento — normalmente o primeiro sinal de que o formulário partiu silenciosamente.

## WhatsApp

Partilha e agendamento por `wa.me` — o deep link oficial, sem SDK e sem peso no
bundle. Botão flutuante em todo o site, partilha em cada peça, e um bloco de
agendamento rápida (nome + cidade) na página `/agendar`.

Quem marca por WhatsApp **continua a entrar na base de dados**, com uma
referência curta tipo `AD-K7M2PQ`. O canal muda a confirmação, não o registo.
Detalhes em `DEPLOY.md`.

Defina `NEXT_PUBLIC_WHATSAPP` com o número real (indicativo incluído, sem `+`).

## Próximos passos sugeridos

- Checkout com Stripe e webhook de confirmação
- Painel `/admin` para gerir catálogo, consultas e agenda das consultoras
- Indexação automática do catálogo no Qdrant após cada deploy (`indexarCatalogo`)
- Testes E2E com Playwright nos três passos da agendamento
