# Fase 2 — concluída

Painel de gestão privado: autenticação, tela "Hoje", agenda de visitas,
bloco de notas e ficha de clientes.

Build validado: `✓ Compiled successfully`, 13 rotas, middleware ativo.

---

## Como entrar

**1. Variáveis de ambiente** (`.env.local` em local, painel da Vercel em produção):

```bash
ADMIN_PATH=gestao-ad-2f9k          # a URL secreta, sem barras
SESSION_SECRET=<64 caracteres>      # openssl rand -hex 32
```

**2. Criar o primeiro usuário:**

```bash
npm run criar-admin -- ana@adonalingerie.com.br "Ana Ribeiro" "uma-senha-longa"
```

**3. Entrar em** `https://o-site.pt/gestao-ad-2f9k`

> Apague o comando do histórico depois: `history -d $(history 1)`

---

## Segurança — cinco camadas

| Camada | Implementação | Testado |
|---|---|---|
| URL não-óbvia | `ADMIN_PATH` em variável de ambiente | ✅ |
| Invisível a robôs | `X-Robots-Tag: noindex, nofollow, noarchive` | ✅ |
| Login real | Argon2id, parâmetros OWASP 2024 | ✅ |
| Sessão | JWT em cookie httpOnly, 8 horas | ✅ |
| Trava de tentativas | 5 falhas → 15 min, por IP e por e-mail | ✅ |

### Resultados dos testes

```
/painel (rota interna)              404   ← não responde diretamente
/gestao-errada                      404   ← indistinguível de página inexistente
URL secreta sem sessão              307   ← redireciona para o login
/gestao-ad-2f9k/notas sem sessão    307   ← nenhuma sub-página escapa
login                               200
X-Robots-Tag                        noindex, nofollow, noarchive
```

O site público continua intacto: todas as rotas a 200.

### Uma falha real que os testes pegaram

O primeiro código usava um hash-manequim inválido para igualar o tempo de
resposta quando o e-mail não existe. Medindo:

```
e-mail existe:      29 ms
e-mail não existe:   0 ms   ← delatava quais os e-mails registados
```

Um atacante conseguiria descobrir os e-mails válidos um a um, só pelo tempo
de resposta. Substituí por um hash Argon2id **genuíno** de uma cadeia
aleatória:

```
e-mail existe:      29 ms
e-mail não existe:  27 ms   ← diferença de 2 ms, indistinguível
```

A mensagem de erro também é sempre a mesma — *"Credenciais inválidas"* —
exista o e-mail ou não.

### Sobre a URL secreta

Vale repetir o que o plano dizia: **URL secreta é ofuscação, não segurança**.
URLs vazam por histórico, cabeçalho `Referer`, extensões e logs de proxy. Ela
garante que ninguém tropeça no painel; o que o protege é o login.

Trocar a URL: editar `ADMIN_PATH` e fazer redeploy. Trinta segundos.

---

## O que o painel faz

### Hoje — o tela inicial

Abre respondendo a *"o que tenho de fazer agora?"*, não a *"que dados
existem?"*.

- **Precisa de si** — ordenado por **urgência, não por data**. Uma agendamento
  sem resposta há cinco horas fica acima de uma de ontem: a cliente está à
  espera agora.
- **Hoje** — visitas do dia com hora, endereço, link para o mapa e botão de
  WhatsApp
- **Últimos 7 dias** — visitas, novas clientes, mensagens

### Visitas

Agrupadas por dia (*Hoje*, *Amanhã*, depois a data por extenso). Confirmar e
marcar como realizada em um clique, via Server Actions — sem API intermédia.

### Notas

Simples de propósito: escrever depressa é mais importante do que organizar.
Cinco etiquetas, fixar ao topo, arquivar. **Sem editor rico** — negritos e
cores são fricção.

### Clientes

Lista com contatos, número de visitas e atalho para WhatsApp.

**As medidas não aparecem aqui.** São dados íntimos e não há razão para
estarem num tela que pode ser consultado com alguém por perto. Ficarão dentro
da ficha individual, a um clique.

---

## Decisões técnicas

**`@node-rs/argon2` em vez de `argon2`.** O segundo é módulo nativo compilado
em C; funciona localmente mas é frágil no bundle serverless da Vercel. A
versão em Rust tem binários pré-compilados e a mesma API.

**Server Actions em vez de rotas de API.** Confirmar uma visita ou guardar
uma nota não precisa de endpoint próprio. Menos código, menos superfície.

**Dupla verificação de sessão.** O middleware corre no Edge e só valida a
assinatura do JWT — não alcança o Postgres. O layout do painel confirma
depois que o usuário continua ativo. Sem isso, desativar alguém não teria
efeito durante oito horas.

**Sair só por POST.** Um GET permitiria terminar a sessão através de um link
ou de uma imagem incorporada noutra página.

**Tudo degrada sem base de dados.** O painel abre e mostra vazio em vez de
rebentar. Uma vendedora que não consegue ver a agenda porque o Postgres está
lento perdeu a manhã.

---

## Tabelas novas

| Tabela | Papel |
|---|---|
| `usuários` | Acesso ao painel, hash Argon2id |
| `sessoes_admin` | Auditoria — regista tentativas falhadas também |
| `notas` | Bloco de notas, com links opcionais a clientes |
| `visita_registos` | O que aconteceu na visita (para a Fase 4) |

Aplicar:

```bash
npm run db:generate
npm run db:migrate
```

---

## Antes de publicar

- [ ] `SESSION_SECRET` na Vercel (`openssl rand -hex 32`)
- [ ] `ADMIN_PATH` na Vercel — **mude o valor por omissão**
- [ ] Correr as migrações
- [ ] Criar o usuário com `npm run criar-admin`
- [ ] Confirmar que `/gestao-<o-seu-valor>` pede login

---

## Próxima fase

**Fase 3 — Pedidos** (2 semanas): tabelas `pedidos`,
`pedido_itens` e `pedido_eventos`, sete estados com linha do tempo
auditável, mensagens de WhatsApp por estado e exportação CSV.

Ver `PLANO-EVOLUCAO.md`, secção 6.3.
