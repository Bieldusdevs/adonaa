# Enviar para o GitHub

> **Já tem o repositório criado e o deploy falhou?**
> Veja `RESOLVER-VERCEL.md` — o repositório provavelmente ficou com restos
> da estrutura antiga, porque o upload web do GitHub acrescenta ficheiros
> mas nunca apaga os que lá estavam.

## O que causava o "Something went really wrong"

Não era o tamanho nem a ligação. O projeto tinha duas pastas cujos nomes o
uploader web do GitHub **recusa processar**:

```
app/api/[[...route]]/
app/colecao/[slug]/
```

São a forma normal do Next.js declarar rotas dinâmicas, mas os parênteses
retos partem o uploader — daí a mensagem genérica de erro.

**Resolvido: já não existe nenhuma pasta com `[` ou `]` no projeto.**

As rotas dinâmicas continuam a funcionar, só que declaradas em código
(`next.config.ts`) em vez de no nome das pastas:

| Pasta no disco | Endereço público |
|---|---|
| `app/peca/` | `/colecao/conjunto-aurora-seda` |
| `app/api/hono/` | `/api/produtos`, `/api/agendamentos`, … |

Para a visitante nada muda — os endereços partilhados por WhatsApp continuam
bonitos. Muda apenas o nome da pasta, que o GitHub agora aceita.

---

## Agora pode usar qualquer método

### A) Arrastar para o site do GitHub

1. Crie um repositório em [github.com/new](https://github.com/new)
2. Clique em **uploading an existing file**
3. Arraste **o conteúdo** da pasta `a-dona-lingerie`
   (as pastas `app`, `components`, `lib`, `public`, `shaders`, `types`,
   `infra` e os ficheiros soltos como `package.json`)
4. **Commit changes**

> Não arraste `node_modules` nem `.next` — se existirem localmente, apague-os
> antes. São gerados por `npm install` e `npm run build`.

### B) O script (mais rápido e seguro)

```bash
cd a-dona-lingerie
./limpar-e-publicar.sh https://github.com/SEU-USER/SEU-REPO.git
```

Substitui todo o conteúdo do repositório por esta pasta — é o que garante
que não sobram ficheiros antigos. Verifica tudo antes de enviar e nunca
inclui `node_modules`.

### C) GitHub Desktop, sem terminal

**File → Add local repository** → escolher a pasta → **Publish repository**.

### Se pedir palavra-passe

O GitHub já não a aceita. Crie um token em
[github.com/settings/tokens](https://github.com/settings/tokens) →
**Generate new token (classic)** → marque **`repo`** → use-o no lugar da
palavra-passe.

---

## Publicar na Vercel

1. [vercel.com/new](https://vercel.com/new) → importar o repositório
2. **Deploy** — sem mexer em nada

Deixe a **Root Directory vazia**: o `package.json` está na raiz e a Vercel
deteta o Next sozinha.

### O site funciona logo no primeiro deploy

Sem base de dados configurada, nada rebenta:

- a homepage e as peças mostram o catálogo de demonstração
- o formulário de marcação abre e aceita pedidos
- a marcação devolve a referência e a conversa de WhatsApp pronta

Isto é deliberado. Um site de marca não deve mostrar um erro só porque falta
uma variável de ambiente.

### Depois, o número de WhatsApp

**Settings → Environment Variables:**

```
NEXT_PUBLIC_WHATSAPP = 351912345678
```

Só dígitos, com indicativo, sem `+`. Depois faça **Redeploy**.

### Base de dados, quando quiser

| Variável | Onde |
|---|---|
| `DATABASE_URL` | [Neon](https://neon.tech), plano gratuito |
| `DB_DRIVER` | escreva `neon` |
| `UPSTASH_REDIS_REST_URL` e `..._TOKEN` | [Upstash](https://upstash.com) |
| `CRON_SECRET` | `openssl rand -hex 32` |

```bash
DATABASE_URL="a-sua-url" npm run db:migrate
DATABASE_URL="a-sua-url" npm run db:seed
```

---

## Confirmar que ficou bem

No repositório deve ver, na raiz: `package.json`, `next.config.ts`,
`tsconfig.json` e as pastas `app/`, `components/`, `lib/`, `public/`.

Total: **64 ficheiros**. Se forem milhares, o `node_modules` entrou por
engano.

## Correr localmente

```bash
npm install
npm run dev
```
