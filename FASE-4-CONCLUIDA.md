# Fase 4 — concluída

Localização completa para o Brasil (Belo Horizonte / MG) e página de
análise com indicadores, gráficos e taxa de recompra.

Build validado: `✓ Compiled successfully`, 17 rotas.

---

## Parte 1 — Localização para Belo Horizonte

O projeto tinha sido construído para Portugal. Corrigi **54 arquivos**.

### Moeda, locale e fuso

| Antes | Agora |
|---|---|
| `pt-PT` | `pt-BR` |
| `EUR` / `€ 249,00` | `BRL` / `R$ 249,00` |
| `Europe/Lisbon` | `America/Sao_Paulo` |
| `priceRange: €€€` | `priceRange: R$$$` |

### Cidades atendidas

Grande Lisboa → **Região Metropolitana de BH**:

**Belo Horizonte · Nova Lima · Contagem · Betim · Sabará · Santa Luzia**

O ateliê passou do Príncipe Real para a **Savassi**.

### Telefone brasileiro

A normalização aceita todos os formatos que as clientes realmente escrevem:

```
(31) 98888-7777  → 5531988887777  ✓
31988887777      → 5531988887777  ✓
988887777        → 5531988887777  ✓   (usa DDD padrão)
+55 31 98888-7777→ 5531988887777  ✓
(31) 3333-4444   → 553133334444   ✓   (fixo, 8 dígitos)
```

**7/7 formatos testados.** O DDD padrão (31) fica em `NEXT_PUBLIC_DDD`, para
quem informar só o número local.

### Vocabulário pt-PT → pt-BR

| Antes | Agora |
|---|---|
| telemóvel | celular |
| palavra-passe | senha |
| morada / código postal | endereço / CEP |
| encomenda | pedido |
| ecrã | tela |
| utilizador | usuário |
| ficheiro | arquivo |
| contacto | contato |
| cesto | sacola |
| soutien / caleçon | sutiã / calcinha |
| RGPD | LGPD |
| CTT | Correios |
| marcação | agendamento |

Também converti o **gerúndio**: *"está a carregar"* → *"está carregando"*,
por expressão regular em todas as variações.

### Um erro que a tipagem apanhou

Ao renomear *encomenda* → *pedido*, o enum de estados ficou no feminino
(`confirmada`, `preparada`) enquanto "pedido" é masculino. O TypeScript
recusou compilar e obrigou a corrigir para `confirmado`, `preparado`,
`enviado`, `devolvido`, `cancelado`.

O mesmo script tinha alterado por engano o enum `statusConsulta`, onde
`'nova'` está **correto** (consulta é feminino). Revertido.

### Verificação final

Homepage servida em produção:

```
Lisboa      0      Belo Horizonte   ✓
Portugal    0      Minas Gerais     ✓
€           0      pt-BR            ✓
telemóvel   0      R$ 249,00        ✓
encomenda   0      5531988887777    ✓
```

---

## Parte 2 — Página de Números

Nova rota `/numeros` no painel.

### Cinco indicadores

Receita · Pedidos · Ticket médio · Visitas · Conversão

Cada um comparado com os **30 dias anteriores**, com seta de variação. Onde
não há base de comparação, mostra `—` em vez de inventar um número.

### Taxa de recompra em 90 dias — em destaque

Ganhou um bloco próprio, com explicação:

> De cada 10 clientes que compraram pela primeira vez, quantas voltaram nos
> 3 meses seguintes.

**Porque este número.** Em lingerie, quem volta é quem confia — no tamanho,
no atendimento e na discrição. É melhor indicador de saúde do que receita
mensal, que oscila com sazonalidade e com uma única venda grande. Uma taxa
em queda avisa de um problema meses antes de a receita cair.

**Só aparece com pelo menos 10 clientes elegíveis.** Abaixo disso a
percentagem é ruído, não sinal — e um número enganoso é pior do que
nenhum. O SQL considera apenas quem já teve 90 dias para voltar.

### Cinco gráficos

| Gráfico | Responde a |
|---|---|
| Receita por semana (12 sem.) | Estou crescendo? |
| Peças mais vendidas | O que repor primeiro? |
| De onde vêm os pedidos | Onde investir? |
| Quando agendam (dia da semana) | Como organizar a agenda? |
| Novas vs. recorrentes | Estou fidelizando? |

### Gráficos em SVG puro — decisão deliberada

O plano previa Recharts. Não usei: traria ~90 kB de JavaScript e obrigaria
a tornar a página um Client Component.

Para barras e um anel de proporção, **SVG renderizado no servidor chega**.
A página fica com zero JS de gráficos e carrega instantaneamente — o que
importa num painel consultado várias vezes por dia, muitas vezes no celular
entre uma visita e outra.

### Compatibilidade entre drivers

`db.execute()` devolve formatos diferentes: array simples no `postgres-js`
(local) e `{ rows: [...] }` no driver HTTP da Neon (produção). Escrevi um
helper `primeiraLinha()` que esconde a diferença — sem ele, as consultas de
recompra funcionariam em desenvolvimento e falhariam em produção.

---

## Tabela nova

`metricas_diarias` — pré-agregação para quando o volume crescer. Hoje as
consultas são calculadas ao vivo (rápido com poucos dados); a tabela está
pronta para o job noturno quando for necessário.

---

## Antes de publicar

- [ ] `NEXT_PUBLIC_WHATSAPP` com o número real de BH (`55` + DDD + número)
- [ ] `NEXT_PUBLIC_DDD` se não for 31
- [ ] Confirmar as 6 cidades atendidas
- [ ] Rodar `npm run db:generate && npm run db:migrate`
- [ ] Conferir os preços do catálogo — o seed ainda tem valores pensados em
      euros (R$ 249, R$ 289, R$ 159)

---

## Próxima fase

**Fase 5 — Crescimento** (2 semanas): motor de oportunidades sobre dados
reais, programa de indicação com código pessoal, modelos de mensagem e
calendário editorial.

Ver `PLANO-EVOLUCAO.md`, secção 6.7.
