# Resolver o erro do deploy

## O que está a acontecer

```
npm error Unsupported URL Type "workspace:": workspace:*
```

`workspace:*` é sintaxe de monorepo (Bun/pnpm). O npm não a entende.

**Esse texto não existe em nenhum ficheiro do projeto atual** — verifiquei.
Ele está no `package.json` **antigo**, que continua no seu repositório do
GitHub.

A causa é sempre a mesma: **o upload web do GitHub acrescenta e substitui
ficheiros, mas nunca apaga os que já lá estavam.** O repositório tem a
estrutura nova por cima e os restos da antiga por baixo.

Houve progresso, note-se: o `npm install` do `vercel.json` foi lido, o
`turbo` já não é invocado. Falta só limpar os ficheiros velhos.

---

## A solução: apagar o repositório e criar um novo

É mais rápido e mais fiável do que caçar ficheiros antigos um a um.

### 1. Apagar o repositório atual

GitHub → o seu repositório → **Settings** → descer até ao fim →
**Danger Zone** → **Delete this repository**

### 2. Criar um novo, vazio

[github.com/new](https://github.com/new)

- Dê-lhe um nome (pode ser o mesmo)
- **Não** marque *Add a README*
- **Não** adicione .gitignore nem licença

### 3. Enviar os ficheiros

Use a pasta **`enviar-para-github`** que preparei — contém exatamente o que
deve ir, e nada mais.

No repositório vazio, clique em **uploading an existing file** e arraste
**tudo o que está dentro** dessa pasta:

```
app/  components/  lib/  public/  shaders/  types/  infra/
package.json  package-lock.json  next.config.ts  tsconfig.json
postcss.config.mjs  vercel.json  drizzle.config.ts  .gitignore
README.md  DEPLOY.md  GITHUB.md  RESOLVER-VERCEL.md
```

> Arraste o **conteúdo** da pasta, não a pasta em si.

São 54 ficheiros. Não há `node_modules`, `.next`, `apps/`, `packages/` nem
`turbo.json` — foi por isso que preparei essa pasta em separado.

### 4. Na Vercel

Se o projeto antigo ainda existir, apague-o também:
**Settings → Advanced → Delete Project** *(apaga só o projeto na Vercel)*.

Depois: [vercel.com/new](https://vercel.com/new) → importar o repositório
novo → **Deploy**. Sem tocar em mais nada.

---

## Alternativa por terminal

Se tiver Git instalado, um comando faz tudo — e substitui o conteúdo remoto
sem precisar de apagar o repositório:

```bash
cd a-dona-lingerie
./limpar-e-publicar.sh https://github.com/SEU-USER/SEU-REPO.git
```

Cria um histórico novo e faz `push --force`. Os ficheiros antigos
desaparecem porque o histórico inteiro é substituído.

---

## Confirmar que ficou bem

Abra o `package.json` no GitHub. A primeira dependência deve ser:

```json
"dependencies": {
  "next": "15.5.22",
```

Se vir `"workspace:*"` ou `"@adona/db"`, é o ficheiro antigo — o upload não
o substituiu.

No log do deploy deve aparecer:

```
Running "install" command: `npm install`...
▲ Next.js 15.5.22
✓ Compiled successfully
```

E **não** deve aparecer: `Detected Turbo`, `workspace:`, `--prefix=../..`.

---

## Depois do deploy

**Settings → Environment Variables:**

```
NEXT_PUBLIC_WHATSAPP = 351912345678
```

Só dígitos, com indicativo, sem `+`. Depois **Redeploy**.

O site funciona mesmo sem base de dados: mostra o catálogo de demonstração e
o formulário de marcação encaminha para o WhatsApp. Configure Neon e Upstash
quando quiser — ver `DEPLOY.md`.
