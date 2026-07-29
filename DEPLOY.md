# Publicar na Vercel

## Não é preciso configurar nada

O projeto é uma aplicação Next.js única, com o `package.json` na raiz.
A Vercel deteta-a automaticamente:

1. [vercel.com/new](https://vercel.com/new) → importar o repositório
2. **Deploy**

**Deixe a Root Directory vazia.** Foi a tentativa de a definir como
`apps/web` que causava o erro *"No Next.js version detected"* — esse problema
desapareceu com a reestruturação.

## Variáveis de ambiente

Nenhuma é obrigatória para o primeiro deploy: sem base de dados o site mostra
um catálogo de demonstração, sem Redis funciona sem cache. Isto é deliberado —
um deploy não deve ficar em branco por causa de uma variável em falta.

Quando estiver pronta, em **Settings → Environment Variables**:

```
NEXT_PUBLIC_WHATSAPP=351912345678   ← o mais importante: o número real
NEXT_PUBLIC_SITE_URL=https://o-seu-dominio.vercel.app
DATABASE_URL=postgres://…           ← Neon
DB_DRIVER=neon
UPSTASH_REDIS_REST_URL=https://…    ← Upstash
UPSTASH_REDIS_REST_TOKEN=…
CRON_SECRET=                        ← openssl rand -hex 32
```

## Serviços externos

A Vercel corre funções sem estado, por isso a base de dados e o Redis têm de
falar por HTTP — ligações TCP persistentes não sobrevivem entre invocações.

| Serviço | Onde | Variáveis |
|---|---|---|
| PostgreSQL | [Neon](https://neon.tech) | `DATABASE_URL`, `DB_DRIVER=neon` |
| Redis | [Upstash](https://upstash.com) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |

Ambos têm plano gratuito suficiente para arrancar.

## Migrações e seed

```bash
DATABASE_URL="a-sua-url" npm run db:migrate
DATABASE_URL="a-sua-url" npm run db:seed
```

---

## Notas de arquitetura

**Os Server Components vão direto à base de dados.** Antes faziam `fetch` à
própria API, o que funciona em dev mas parte no build: durante a geração
estática não há servidor a ouvir. RSC e Route Handler correm no mesmo
processo — pedir por HTTP a nós próprios só somava latência e um ponto de
falha. A API em `/api` continua a servir o browser e terceiros.

**A ligação à base de dados é preguiçosa.** Só se abre na primeira query;
importar o módulo durante o build não exige `DATABASE_URL`.

**Prometheus e Grafana não se aplicam na Vercel** — `/metrics` pressupõe um
processo de longa duração que acumula contadores, o que não existe em funções
efémeras. Use Vercel Analytics e Speed Insights. Os manifestos em `infra/`
continuam válidos para autoalojamento.

---

# WhatsApp

## Como funciona

Usamos apenas `wa.me`, o deep link oficial: abre a app no telemóvel e o
WhatsApp Web no desktop. **Sem SDK, sem cookies de terceiros, zero bytes
extra no bundle.** A mensagem vai pré-escrita — a cliente carrega em enviar.
Nunca enviamos nada em nome dela.

## Onde aparece

**Partilha**
- Botão discreto no canto de cada cartão de produto (visível no hover, sempre
  visível no toque)
- Botão completo na página de produto, com menu de "copiar ligação"
- No telemóvel usa `navigator.share` — a folha nativa do sistema, que é
  sempre melhor do que um menu nosso

**Marcação**
- Botão flutuante em todas as páginas, a partir de 600 px de scroll
- CTA secundário no hero e na secção do serviço
- Bloco "caminho mais curto" na página `/agendar`: nome + cidade + formato
- Opção de canal no passo 3 do formulário completo
- `/whatsapp` redireciona para `/agendar?canal=whatsapp`

## A decisão que importa

O WhatsApp **não é um atalho que salta o registo**. Mesmo quem escolhe esse
canal fica na base de dados com uma referência curta (`AD-K7M2PQ`). O que
muda é o fim do fluxo: em vez de esperar por um e-mail, a conversa abre já.

O bloco rápido faz o mesmo com menos atrito — grava a intenção no Redis com
TTL de 7 dias e devolve a conversa pronta. Se a pré-reserva falhar por
alguma razão, **a conversa abre na mesma**: nunca bloqueamos um contacto por
causa de um erro nosso.

## O tom das mensagens

A partilha é escrita na primeira pessoa de quem partilha:

> Encontrei esta peça e lembrei-me de ti: *Conjunto Aurora*

Não *"descubra a nossa coleção"*. Ninguém reencaminha anúncios para amigas.

A marcação é estruturada para a consultora responder numa só mensagem, sem
cinco perguntas de seguimento:

> Olá! Gostaria de marcar uma consulta.
>
> Chamo-me *Marta*.
> Prefiro: prova em minha casa.
> Dia pretendido: sexta-feira, 14 de agosto, às 15:30.
> Cidade: Barreiro.
>
> Referência da pré-reserva: *AD-K7M2PQ*

A referência usa um alfabeto sem `0/O` nem `1/I` — porque alguém vai ditá-la
ao telefone.

## Lembretes

O cron diário das 09:00 (`/api/cron/lembretes`) prepara os links das consultas
do dia seguinte, mas **não envia nada automaticamente**: a consultora carrega
em enviar. Numa marca que vive de proximidade, um lembrete robotizado às 9h
da manhã custa mais do que rende.

## Antes de ir para produção

- [ ] Trocar `NEXT_PUBLIC_WHATSAPP` pelo número real (com indicativo, sem `+`)
- [ ] Usar uma conta **WhatsApp Business** — traz horário de atendimento,
      mensagem de ausência e etiquetas para organizar as conversas
- [ ] Configurar a saudação automática fora das 10h–19h
- [ ] Se o volume crescer, considerar a Cloud API oficial para respostas
      automáticas e múltiplas consultoras na mesma linha
