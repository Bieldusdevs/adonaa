# A Dona Lingerie — Plano de Evolução

**Versão 1.0 · Julho de 2026**

Documento de planeamento para a segunda fase do projeto: redesenho da
homepage, painel de gestão privado e formalização do serviço de visita ao
domicílio.

> **Amostra visual:** abra `preview/paleta.html` para ver a paleta proposta,
> a comparação de botões e as verificações de contraste.

---

## Sumário

1. [Ponto de partida](#1-ponto-de-partida)
2. [Princípios que orientam as decisões](#2-princípios-que-orientam-as-decisões)
3. [Redesenho da homepage](#3-redesenho-da-homepage)
4. [Serviço de visita ao domicílio](#4-serviço-de-visita-ao-domicílio)
5. [Painel de gestão: segurança e acesso](#5-painel-de-gestão-segurança-e-acesso)
6. [Painel de gestão: funcionalidades](#6-painel-de-gestão-funcionalidades)
7. [Modelo de dados](#7-modelo-de-dados)
8. [Faseamento](#8-faseamento)
9. [Riscos e decisões em aberto](#9-riscos-e-decisões-em-aberto)

---

## 1. Ponto de partida

O que já existe e funciona:

| Área | Estado |
|---|---|
| Homepage | Hero com shader de seda, 3 peças em destaque, secção de materiais, secção do serviço |
| Página de peça | `/colecao/<slug>` com ficha técnica de materiais |
| Marcação | `/agendar` — formulário de 3 passos + atalho por WhatsApp |
| API | Hono em `/api` — produtos, agendamentos, consultas |
| Base de dados | 6 tabelas: `materiais`, `produtos`, `produto_materiais`, `clientes`, `consultas`, `agendamentos` |
| WhatsApp | Partilha de peças, marcação, dúvidas de tamanho |

O que falta, e é o objecto deste plano:

- A homepage está **elegante mas fria**. Comunica qualidade; comunica pouco
  acolhimento.
- O serviço de visita ao domicílio — a maior vantagem competitiva da casa —
  aparece a meio da página, sem destaque próprio.
- **Não existe painel de gestão.** Todos os pedidos chegam por e-mail ou
  WhatsApp e vivem na cabeça da vendedora.

---

## 2. Princípios que orientam as decisões

Antes das especificações, quatro princípios. São eles que resolvem as
dúvidas que este documento não anteciparu.

### 2.1 Calor não é saturação

O pedido é tornar o site mais acolhedor. A tentação óbvia é somar rosa e
curvas. Seria um erro: numa marca premium, cor a mais lê-se como *barato*.

O calor virá de quatro alavancas mais discretas:

- **Luz**, não pigmento — sombras quentes e âmbar em vez de cinzentos
- **Fotografia com contexto** — tecido sobre linho amarrotado, luz de manhã,
  em vez de fundo branco de catálogo
- **Voz humana** — a vendedora escreve na primeira pessoa
- **Espaço para respirar** — generosidade de margens comunica cuidado

### 2.2 O corpo da cliente nunca é o problema

Em lingerie, cada palavra sobre corpo é uma escolha ética. A regra da casa:
**falamos da peça, nunca do corpo**.

- ✅ "Esta modelagem acompanha o movimento"
- ❌ "Esta modelagem disfarça"

Vale para o site, para os e-mails e para as sugestões de marketing do painel.

### 2.3 Discrição é uma funcionalidade

Lingerie é compra íntima. A discrição já está no produto (embalagem sem
identificação, consultora sem marca visível) e tem de estar no software:

- O painel não mostra medidas na lista — só dentro da ficha, com um clique
- Nenhuma notificação do site revela o que foi comprado
- O painel não tem o nome da marca no `<title>` — quem olhar de lado não sabe

### 2.4 O painel serve o fluxo real, não o organograma

A vendedora não pensa "quero consultar a tabela de agendamentos". Pensa
*"o que tenho de fazer hoje?"*. O painel abre respondendo a isso.

---

## 3. Redesenho da homepage

### 3.1 Paleta — evolução, não rutura

A paleta actual é sólida. Falta-lhe **temperatura nas zonas de respiração** e
**um tom de acção mais convidativo**.

| Token | Actual | Proposto | Papel |
|---|---|---|---|
| `--marfim` | `#faf6f1` | `#fbf7f2` | Fundo base (+1% de amarelo) |
| `--linho` | `#f0e7dc` | `#f2e9dd` | Fundo de secção |
| `--nude` | `#e4cfc2` | mantém | Superfícies suaves |
| `--bordeaux` | `#5a1f2b` | mantém | Preço, ênfase |
| `--dourado` | `#b08d57` | mantém | Eyebrows, certificações |
| **`--terracota`** | — | **`#a85940`** | **Novo.** CTA principal |
| **`--pessego`** | — | **`#f7e3d8`** | **Novo.** Fundo de destaque |
| **`--sombra-quente`** | — | **`rgba(90,45,30,.14)`** | **Novo.** Substitui sombras cinzentas |

**A mudança de maior impacto:** o CTA principal passa de `--carvao`
(quase preto) para `--terracota`. Um botão preto é assertivo; um botão
terracota **convida**.

O tom foi escolhido por cálculo, não por gosto. O terracota mais quente que
se pediria à partida (`#c07456`) dá 3.35:1 sobre marfim — **reprova em WCAG
AA**, que exige 4.5:1. Escurecido para `#a85940`, obtém-se:

| Combinação | Rácio | WCAG AA |
|---|---|---|
| Texto branco sobre terracota | 5.04:1 | ✅ |
| Terracota sobre fundo marfim | 4.72:1 | ✅ |

Continua visivelmente quente e é legível para quem tem baixa visão ou está
ao sol num telemóvel. Vale a pena verificar qualquer cor nova com um
calculador de contraste antes de a adoptar — a diferença entre `#c07456` e
`#a85940` é quase impercetível a olho e decisiva em acessibilidade.

**Sombras.** Toda sombra cinzenta (`rgba(0,0,0,x)`) passa a
`--sombra-quente`. É uma alteração que ninguém nota conscientemente e que
muda a temperatura da página inteira.

### 3.2 Tipografia

Cormorant Garamond + Inter mantêm-se. Dois ajustes:

- **Itálico do Cormorant** em citações e no nome da vendedora — o itálico
  garaldino é a coisa mais próxima de caligrafia sem cair no decorativo
- **Altura de linha do corpo** de 1.6 → **1.75**. Textos íntimos pedem mais ar

### 3.3 Estrutura da nova homepage

```
┌────────────────────────────────────────────────────────┐
│  1. HERO                                    [mantém]   │
│     Shader de seda + "A peça certa não se compra"      │
│     ▸ CTA agora em terracota                           │
│     ▸ Sub-linha nova: "Ana atende em Lisboa,           │
│       Barreiro e Almada — e vai a sua casa."           │
├────────────────────────────────────────────────────────┤
│  2. ⭐ FAIXA DO SERVIÇO                       [NOVO]    │
│     Fundo pêssego, altura contida (~120px)             │
│     Foto redonda da vendedora · frase curta · CTA      │
│     "Não sabe o seu tamanho? Eu vou aí. 90 min,        │
│      sem compromisso."                    [Marcar →]   │
├────────────────────────────────────────────────────────┤
│  3. COLEÇÃO EM DESTAQUE                    [mantém]    │
│     3 peças, cartões com inclinação 3D                 │
├────────────────────────────────────────────────────────┤
│  4. ⭐ "COMO É UMA VISITA"                    [NOVO]    │
│     Secção dedicada, 4 passos ilustrados               │
│     Detalhe em 3.4                                     │
├────────────────────────────────────────────────────────┤
│  5. OS MATERIAIS                           [mantém]    │
│     Seda / renda / algodão com origem                  │
├────────────────────────────────────────────────────────┤
│  6. ⭐ VOZ DA CASA                            [NOVO]    │
│     Foto da vendedora + texto na 1.ª pessoa            │
│     Assinatura manuscrita                              │
├────────────────────────────────────────────────────────┤
│  7. ⭐ O QUE DIZEM AS CLIENTES                [NOVO]    │
│     3 testemunhos, primeiro nome + cidade              │
├────────────────────────────────────────────────────────┤
│  8. ⭐ DÚVIDAS FREQUENTES                     [NOVO]    │
│     Acordeão com as 5 perguntas que travam a compra    │
├────────────────────────────────────────────────────────┤
│  9. RODAPÉ                                 [mantém]    │
└────────────────────────────────────────────────────────┘
```

**Nota sobre ordem.** A faixa do serviço (2) vem **antes** da coleção. Quem
chega ao site sem saber o tamanho não compra — leva o serviço. Colocar a
oferta de ajuda antes do catálogo respeita a ordem real da hesitação.

### 3.4 Secção "Como é uma visita" — detalhe

O objectivo é remover o desconforto do desconhecido. Quem nunca teve uma
consultora em casa imagina o pior: pressão para comprar, estranho na sala,
constrangimento.

```
        COMO É UMA VISITA
        ─────────────────

   ①            ②            ③            ④
 Conversa    Ela chega    A prova     Sem pressa
 de 5 min    discreta     no seu       Se não levar
 por WhatsApp  Mala neutra, quarto      nada, leva
 antes        sem marca    à sua luz,   as medidas
                           seu espelho  certas
```

Cada passo com um ícone de linha fina (não emoji) e duas linhas de texto.
Abaixo, três garantias em texto pequeno:

- **Gratuito.** Não há taxa de deslocação nem mínimo de compra.
- **Discreto.** Chego sem nada que identifique a marca.
- **Seu ritmo.** 90 minutos reservados. Prove tudo, ou nada.

### 3.5 Secção "Voz da casa"

Duas colunas. À esquerda, fotografia da vendedora — **de trabalho, não de
estúdio**: a medir, a dobrar tecido, no ateliê. À direita, texto curto na
primeira pessoa:

> *"Comecei porque me fartei de ver mulheres a usar o tamanho errado e a
> acharem que o problema eram elas. Não é. É do provador com luz branca e da
> pressa. Por isso vou a sua casa: ao seu espelho, à sua luz, no seu tempo."*
>
> — **Ana**, fundadora

Assinatura em Cormorant itálico. Sem foto de banco de imagens: se não houver
fotografia real, a secção sai. Uma fundadora falsa destrói mais confiança do
que a ausência da secção.

### 3.6 Dúvidas frequentes

Acordeão. As cinco perguntas que travam a decisão:

1. **E se eu não souber o meu tamanho?** — É o mais comum. Não precisa de saber.
2. **A visita tem custo?** — Não. Nem taxa nem mínimo.
3. **Sou obrigada a comprar?** — Não. Cerca de um terço não leva nada na primeira visita.
4. **A embalagem identifica a marca?** — Não. Caixa neutra, sem nome no exterior.
5. **Posso trocar se não servir?** — 30 dias. Peças íntimas trocam-se fechadas.

Marcado com `FAQPage` em JSON-LD — o Google mostra estas respostas
directamente na pesquisa.

### 3.7 Microinterações

Contidas, como o resto. As animações actuais (revelação de texto, inclinação
de 6° nos cartões) mantêm-se. Acrescentam-se:

- **Botão terracota** — clareia 6% e sobe 1px no hover, 240ms (o estado
  hover pode ser mais claro: o mínimo de contraste aplica-se ao estado de
  repouso)
- **Acordeão** — abre com `height: auto` animado, 320ms, `ease-seda`
- **Foto da vendedora** — sem efeito. É a única imagem que não se mexe. A
  quietude comunica seriedade.

Tudo respeita `prefers-reduced-motion`, como já acontece.

---

## 4. Serviço de visita ao domicílio

### 4.1 Página dedicada `/visita-em-casa`

Hoje o serviço vive numa secção da homepage e na página `/agendar`. Merece
página própria: é o que a distingue de qualquer loja online.

```
/visita-em-casa
├── Hero          Foto de uma consulta real (mãos, fita métrica, tecido)
│                 "Noventa minutos. O seu espelho. O seu tempo."
├── Como funciona Os 4 passos, versão longa
├── Onde vou      Mapa simples: Lisboa · Barreiro · Almada · Setúbal ·
│                 Cascais · Porto (+ "não está na lista? pergunte")
├── O que levo    Fotografia da mala aberta — 20 a 30 peças, todos os
│                 tamanhos da grelha, fita métrica, espelho dobrável
├── Preço         Em destaque: GRATUITO. Sem asterisco.
├── Testemunhos   2 de clientes que usaram o serviço
├── FAQ           4 perguntas específicas da visita
└── Marcação      Formulário + WhatsApp (componentes já existentes)
```

**"O que levo" é a secção que mais converte.** Ver a mala aberta transforma
uma ideia abstracta em algo concreto. Reduz a ansiedade de não saber o que
esperar.

### 4.2 Melhorias no fluxo de marcação

O formulário de 3 passos funciona. Quatro acrescentos:

**a) Validação de área de serviço.** Ao escrever o código postal, verificar
se está numa zona atendida. Se não estiver, não bloquear — oferecer:

> *"Ainda não vou regularmente a Coimbra, mas se juntar duas ou três amigas,
> vale a viagem. Fale comigo."* [WhatsApp]

Um "não" que abre uma porta em vez de fechar.

**b) Visita de grupo.** Opção nova: *"Vou estar com amigas (2 a 5 pessoas)"*.
Aumenta o valor médio por deslocação e é a forma mais natural de crescer por
recomendação. Duração passa a 150 min.

**c) Lembrete honesto.** 24h antes, mensagem preparada no painel (envio
manual, ver 6.2): confirmação, morada, e *"se precisar de remarcar, diga —
sem problema nenhum"*.

**d) Seguimento pós-visita.** 48h depois, a vendedora vê no painel uma
sugestão de mensagem. Não automática: a decisão de contactar é dela.

### 4.3 Presença noutras páginas

| Página | Como aparece |
|---|---|
| Homepage | Faixa (secção 2) + secção completa (4) |
| Página de peça | "Não sabe o seu tamanho? Provo em sua casa" junto ao selector de tamanhos |
| Rodapé (todas) | Ligação permanente |
| Botão flutuante | Já existe — passa a ligar a `/visita-em-casa` |

---

## 5. Painel de gestão: segurança e acesso

### 5.1 A URL secreta — o que é e o que não é

O pedido é um painel acessível por URL secreta. Vamos fazê-lo, **com uma
ressalva importante e uma camada extra**.

**URL secreta não é segurança.** É ofuscação. URLs vazam por: histórico do
browser, cabeçalho `Referer`, extensões, logs de proxy, alguém a olhar para o
ecrã. Um painel protegido *apenas* por URL secreta é um painel público que
ainda ninguém encontrou.

**A abordagem:**

```
Camada 1  URL não-óbvia         /gestao-ad-2f9k          ← ofuscação
Camada 2  Bloqueio de robôs     noindex + robots.txt     ← invisibilidade
Camada 3  Login real            e-mail + palavra-passe   ← segurança
Camada 4  Sessão assinada       cookie httpOnly, 8h      ← persistência
Camada 5  Trava de tentativas   5 falhas → 15 min        ← anti-força-bruta
```

A URL secreta dá o que se pretende: ninguém tropeça no painel. O login é o
que o protege de facto.

### 5.2 Autenticação

**Tecnologia:** Auth.js v5 (NextAuth) com Credentials provider.

**Palavras-passe:** hash com **Argon2id** (`m=19456, t=2, p=1` — parâmetros
OWASP 2024). Não bcrypt: o Argon2id resiste melhor a ataques com GPU.

**Sessão:** JWT em cookie `httpOnly`, `secure`, `sameSite: lax`, 8 horas.
Oito horas cobre um dia de trabalho sem obrigar a repetir o login, e expira
antes de a máquina passar a noite ligada.

**Trava de tentativas:** 5 falhas no mesmo e-mail ou IP → 15 minutos de
bloqueio, contados no Redis. A mensagem de erro é **sempre igual** —
*"Credenciais inválidas"* — quer o e-mail exista ou não. Distinguir os casos
diria a um atacante quais os e-mails válidos.

**Rotação da URL.** A URL secreta vive numa variável de ambiente
(`ADMIN_PATH`). Trocá-la é editar a variável e fazer redeploy — 30 segundos,
sem alterar código.

### 5.3 Comportamento perante URL errada

Um `403 Proibido` confirma que ali existe algo. A resposta a qualquer
tentativa em `/gestao-*` errado é **404 idêntico ao de qualquer página
inexistente** — mesmo HTML, mesmo tempo de resposta.

### 5.4 Camadas adicionais recomendadas

| Medida | Porquê |
|---|---|
| `noindex, nofollow` + `Disallow` no robots.txt | O Google não indexa o que não deve |
| Registo de acessos (data, IP, resultado) | Detectar tentativas |
| Aviso de sessão nova por e-mail | A vendedora sabe se alguém entrou |
| 2FA por TOTP *(fase 2)* | Se o painel passar a gerir pagamentos |

**Sobre 2FA:** proposto para a fase 2, não a fase 1. Numa operação de uma
pessoa, o risco de ela perder o telemóvel e ficar fora do próprio negócio é
maior do que o risco de invasão. Quando houver segunda utilizadora, passa a
obrigatório.

---

## 6. Painel de gestão: funcionalidades

### 6.1 Estrutura

```
/gestao-ad-2f9k
├── /                    Hoje          ← ecrã inicial
├── /pedidos             Encomendas
├── /visitas             Agenda de visitas
├── /clientes            Ficha de clientes
├── /notas               Bloco de notas
├── /analise             Números
├── /crescer             Ideias e sugestões
└── /definicoes          Conta e preferências
```

**Layout:** barra lateral fixa (recolhida em ecrã pequeno), conteúdo à
direita. A mesma paleta do site, um pouco mais densa — é ferramenta de
trabalho, não montra.

### 6.2 Ecrã "Hoje" — o mais importante

Abre respondendo a *"o que tenho de fazer agora?"*.

```
┌──────────────────────────────────────────────────────────┐
│  Bom dia, Ana.                        terça, 29 de julho │
│                                                          │
│  ┌─ PRECISA DE SI ─────────────────────────────────────┐ │
│  │ ⚠ 2 marcações por confirmar    há 3h e há 5h        │ │
│  │ ⚠ 1 encomenda por enviar       desde ontem          │ │
│  │ ○ 3 mensagens sem resposta                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ HOJE ──────────────────────────────────────────────┐ │
│  │ 15:30  Marta Sousa · Barreiro · prova em casa       │ │
│  │        Rua X, 12 — 2.º Esq        [Ver] [WhatsApp]  │ │
│  │ 18:30  Rita Alves · vídeo                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Semana: 4 visitas · 7 encomendas · 1.240 €              │
└──────────────────────────────────────────────────────────┘
```

**"Precisa de si" ordena por urgência, não por data.** Uma marcação sem
resposta há 5 horas está acima de uma encomenda de ontem — a cliente está à
espera agora.

### 6.3 Gestão de encomendas

**Estados:** `nova` → `confirmada` → `preparada` → `enviada` → `entregue`
(+ `devolvida`, `cancelada`)

**Vista:** tabela com filtros rápidos por estado. Colunas: referência,
cliente, peças, valor, estado, data. Ordenável.

**Ficha de encomenda:**
- Dados da cliente e histórico
- Peças, tamanhos e cores
- Linha do tempo de estados, com autor e hora
- Notas internas (nunca visíveis para a cliente)
- Botão que abre o WhatsApp com mensagem apropriada ao estado

**Acções em massa:** marcar várias como enviadas, exportar CSV para
contabilidade.

**Ponto importante — mensagens não são automáticas.** O painel *prepara* a
mensagem e abre o WhatsApp; quem carrega em enviar é a vendedora. Numa marca
que vive de proximidade, uma mensagem automática detectável custa mais do que
poupa. Reduz-se o trabalho, não se remove a pessoa.

### 6.4 Agenda de visitas

Duas vistas: **calendário** (semana/mês) e **lista** (próximas primeiro).

Cada visita mostra: hora, duração, cliente, tipo, morada com ligação para o
mapa, observações, estado.

**Detalhes práticos:**
- **Gestão de disponibilidade** — bloquear dias e definir horário semanal
- **Agrupamento geográfico** — se houver duas visitas no mesmo dia e zona,
  sugere aproximá-las. Poupa uma hora de trânsito.
- **Preparação da mala** — a partir do que a cliente indicou, lista sugerida
  de peças e tamanhos a levar
- **Registo pós-visita** — o que provou, o que gostou, o que faltou. Alimenta
  a ficha e a próxima visita.

### 6.5 Bloco de notas

Simples de propósito. A vendedora precisa de escrever depressa, não de
organizar.

- Notas em cartões, com título opcional
- **Fixar** ao topo
- Etiquetas coloridas: *cliente*, *fornecedor*, *ideia*, *urgente*
- Pesquisa por texto
- Lista de tarefas dentro de cada nota (caixas de selecção)
- Ligar uma nota a uma cliente ou encomenda
- Guardar automático, 2 segundos após parar de escrever

**Sem editor rico.** Negritos e cores são fricção. Markdown leve
(`**negrito**`, `- lista`) para quem quiser.

### 6.6 Análise e números

Cinco números no topo, com comparação ao período anterior:

```
Receita        Encomendas     Ticket médio    Visitas    Conversão
2.480 €        14             177 €           6          67%
↑ 18%          ↑ 3            ↑ 5%            = 6        ↑ 4pp
```

**Gráficos** (Recharts, cores da marca):

| Gráfico | Responde a |
|---|---|
| Receita por semana (12 semanas) | Estou a crescer? |
| Peças mais vendidas | O que reponho? |
| Visitas → compras (funil) | O serviço compensa? |
| Mapa de calor por dia/hora | Quando marcam? |
| Origem das clientes | Onde investir? |
| Novas vs. recorrentes | Estou a fidelizar? |

**Uma métrica que quase ninguém acompanha e devia:** *taxa de recompra a 90
dias*. Em lingerie, quem volta é quem confia. É o melhor indicador de saúde
do negócio — melhor do que receita mensal, que oscila com sazonalidade.

**Exportação CSV** em todas as tabelas.

### 6.7 "Crescer" — ferramentas de marketing

A secção mais delicada. Sugestões genéricas — *"publique nas redes sociais"* —
são ruído. Só entram sugestões **derivadas dos dados reais**.

**a) Oportunidades detectadas automaticamente**

| Sinal nos dados | Sugestão |
|---|---|
| Cliente sem compra há 90 dias | *"A Marta comprou há 3 meses. As clientes costumam repor a esta altura."* [mensagem preparada] |
| Visita sem compra há 7 dias | *"A Rita provou o Aurora e não levou. Vale um seguimento discreto?"* |
| Peça com muitas visualizações e poucas vendas | *"O Noturno é o mais visto e o menos comprado. Preço? Fotografia? Tamanhos em falta?"* |
| Concentração geográfica | *"4 clientes no Barreiro. Vale um dia dedicado?"* |
| Aniversário de cliente | *"A Sofia faz anos na quinta."* |

**b) Programa de recomendação**

O canal natural desta marca. Quem tem boa experiência conta a uma amiga —
mas precisa de um empurrão e de uma razão.

- Código pessoal por cliente (`ANA-MARTA`)
- Quem recomenda e quem é recomendada ganham 15%
- Painel mostra quem recomendou quem — e quem são as embaixadoras reais

**c) Calendário editorial**

Não um gestor de redes sociais. Uma lista de datas com ideias concretas:

> **Outubro — Mês do cancro da mama.** Conteúdo sobre lingerie pós-cirúrgica,
> ou parceria com associação local. Sensível: tratar com cuidado ou não
> tratar de todo.

**d) Modelos de mensagem**

Escritos na voz da marca, editáveis, nunca enviados sem confirmação:
pós-visita, reposição, agradecimento pela primeira compra, aniversário,
pedido de testemunho.

**e) Aprender com o que já aconteceu**

Após 30 visitas, o painel mostra o que os dados dizem:

> *"As suas visitas de sábado convertem 82%; as de terça, 41%. Vale a pena
> concentrar sábados?"*

Isto é análise, não conselho genérico. É o tipo de coisa que a vendedora
sente mas não consegue provar.

---

## 7. Modelo de dados

Tabelas novas a acrescentar ao schema Drizzle existente:

```
utilizadores          Acesso ao painel
├── id, email, nomeCompleto
├── palavraPasseHash  (Argon2id)
├── papel             admin | consultora
├── ultimoAcessoEm, ativo

sessoes_admin         Sessões e auditoria
├── id, utilizadorId, tokenHash
├── ip, userAgent, expiraEm, criadoEm

encomendas
├── id, referencia    (AD-XXXXXX)
├── clienteId, estado, subtotalCents, totalCents
├── moradaEnvio, metodoEnvio, codigoSeguimento
├── notasInternas, origemVenda   (site | visita | whatsapp)
├── criadoEm, atualizadoEm

encomenda_itens
├── encomendaId, produtoId
├── nomeProduto, tamanho, cor      (congelados no momento da compra)
├── quantidade, precoUnitarioCents

encomenda_eventos     Linha do tempo auditável
├── encomendaId, estadoAnterior, estadoNovo
├── autorId, nota, criadoEm

notas
├── id, autorId, titulo, conteudo
├── etiquetas[], fixada, arquivada
├── clienteId?, encomendaId?       (ligações opcionais)

visita_registos       Preenchido após a visita
├── agendamentoId, pecasProvadas[]
├── pecasCompradas[], observacoes
├── proximoContactoEm

recomendacoes
├── codigo, clienteOrigemId, clienteDestinoId?
├── estado, descontoAplicado, criadoEm

metricas_diarias      Pré-agregado para os gráficos
├── data, receitaCents, numEncomendas
├── numVisitas, numVisitasConvertidas
├── novasClientes, clientesRecorrentes
```

**Nota sobre `encomenda_itens`:** o nome, tamanho, cor e preço ficam
**congelados** no momento da compra. Se a peça mudar de preço ou for
descontinuada, a encomenda antiga continua a mostrar o que foi realmente
vendido. Encomendas são registo histórico, não vista sobre o catálogo.

**Nota sobre `metricas_diarias`:** calcular receita de 12 semanas somando
encomendas a cada carregamento fica lento depressa. Um trabalho nocturno
pré-agrega. Os gráficos lêem daqui.

---

## 8. Faseamento

### Fase 1 — Fundações (1 a 2 semanas)

1. Tokens de cor novos (terracota, pêssego, sombra quente)
2. CTA principal em terracota em todo o site
3. Faixa do serviço na homepage
4. Secção "Como é uma visita"
5. FAQ com JSON-LD
6. Página `/visita-em-casa`

**Porquê primeiro:** são as alterações que geram receita mais depressa e não
dependem de nada.

### Fase 2 — Painel, núcleo (2 a 3 semanas)

7. Tabelas `utilizadores` e `sessoes_admin` + Auth.js
8. Rota secreta, middleware, 404 para URL errada
9. Ecrã "Hoje"
10. Agenda de visitas
11. Bloco de notas

**Porquê antes das encomendas:** as visitas já existem e são hoje geridas de
cabeça. É onde o painel alivia mais depressa.

### Fase 3 — Encomendas (2 semanas)

12. Tabelas de encomendas e eventos
13. Lista, ficha e mudança de estado
14. Mensagens de WhatsApp preparadas por estado
15. Exportação CSV

### Fase 4 — Análise (1 a 2 semanas)

16. `metricas_diarias` + trabalho nocturno
17. Cartões de resumo
18. Gráficos
19. Taxa de recompra a 90 dias

### Fase 5 — Crescimento (2 semanas)

20. Motor de oportunidades
21. Programa de recomendação
22. Modelos de mensagem
23. Calendário editorial

### Fase 6 — Polimento (1 semana)

24. Secção "Voz da casa" (depende de fotografia real)
25. Testemunhos
26. Auditoria de acessibilidade (WCAG AA)
27. Revisão de desempenho

**Total: 9 a 13 semanas.** As fases 1 e 2 entregam a maior parte do valor.

---

## 9. Riscos e decisões em aberto

### Riscos

| Risco | Mitigação |
|---|---|
| **URL secreta partilhada por engano** | O login é a defesa real. Rotação em 30 segundos. |
| **Palavra-passe fraca** | Mínimo 12 caracteres, verificação contra lista de senhas comuns |
| **Painel lento com o crescimento** | Paginação desde o início; métricas pré-agregadas |
| **Sugestões de marketing irrelevantes** | Nenhuma sugestão genérica; só derivadas de dados. Se não há dados, não há sugestão. |
| **Excesso de automatismo** | Nada é enviado sem confirmação humana |
| **Fotografia da fundadora indisponível** | A secção sai. Não se usa banco de imagens. |

### Decisões que precisam da vendedora

1. **Fotografia própria** — a secção "Voz da casa" depende disto. Sem foto
   real, corta-se.
2. **Testemunhos** — há clientes dispostas? Com que nome aparecem?
3. **Área de serviço** — a lista de 6 cidades está certa? Há zonas a evitar?
4. **Visitas de grupo** — faz sentido no modelo de trabalho actual?
5. **Percentagem de recomendação** — 15% é sustentável na margem?
6. **Envio de e-mail** — Resend, Postmark ou continuar só por WhatsApp?

### O que este plano deliberadamente não inclui

- **Pagamentos online.** Merece decisão própria (Stripe vs. MB Way vs.
  transferência). Muitas clientes desta faixa preferem pagar na visita.
- **App móvel.** O site responsivo chega. Uma app seria custo sem retorno.
- **Chatbot com IA.** A marca vende proximidade humana. Um bot contradiz a
  promessa.
- **Programa de fidelidade com pontos.** Complexo de gerir para uma pessoa.
  O programa de recomendação dá mais retorno por menos esforço.

---

## Anexo — Resumo executivo

| Requisito pedido | Como é resolvido |
|---|---|
| Homepage acolhedora | Terracota e pêssego, sombras quentes, voz na 1.ª pessoa, testemunhos, FAQ |
| Painel oculto por URL secreta | `ADMIN_PATH` em variável de ambiente + 404 para URL errada |
| Login e-mail/palavra-passe | Auth.js + Argon2id + trava de tentativas + sessão de 8h |
| Notas do vendedor | Cartões, etiquetas, fixar, tarefas, guardar automático |
| Gestão de pedidos | 7 estados, linha do tempo auditável, WhatsApp por estado, CSV |
| Gráficos e estatísticas | 5 indicadores + 6 gráficos + recompra a 90 dias |
| Sugestões de crescimento | Motor de oportunidades sobre dados reais + recomendações + modelos |
| Serviço ao domicílio | Página própria, faixa na homepage, "como é uma visita", grupo, registo pós-visita |
| Facilidade de uso | "Hoje" como ecrã inicial, urgência antes de cronologia, nada automático sem confirmação |
