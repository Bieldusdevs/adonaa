# Fase 3 — concluída

Gestão de pedidos: sete estados com transições validadas, linha do tempo
auditável, mensagens de WhatsApp por estado e exportação CSV.

Build validado: `✓ Compiled successfully`, 16 rotas. **26 testes de lógica
passaram.**

---

## Os sete estados

```
nova ──→ confirmada ──→ preparada ──→ enviada ──→ entregue
  │           │             │            │           │
  └───────────┴─────────────┴─→ cancelada│           │
                                          └──→ devolvida ←┘
```

| Estado | Significado |
|---|---|
| `nova` | Recebida, por confirmar |
| `confirmada` | Pagamento acertado, por preparar |
| `preparada` | Embalada, pronta a seguir |
| `enviada` | A caminho |
| `entregue` | Concluída |
| `devolvida` | Devolvida pela cliente |
| `cancelada` | Cancelada |

### As transições são validadas no servidor

Uma pedido **não salta** de `nova` para `entregue`. Cada passo tem de
acontecer, e a validação está na Server Action — não apenas nos botões.
Um POST forjado é rejeitado.

Testado: 10 verificações, incluindo saltos, retrocessos, auto-loops e
estados terminais.

---

## Linha do tempo auditável

Cada mudança de estado grava um evento com **estado anterior, estado novo,
autor, hora e nota opcional**.

Duas decisões:

**Transação atómica.** A mudança de estado e o registo do evento acontecem
na mesma transação. Se o registo falhar, o estado também não muda — uma
linha do tempo com buracos é pior do que não ter linha do tempo, porque dá
a ilusão de estar completa.

**Nome do autor congelado.** Guarda-se `autorNome` além do `autorId`. Se o
usuário for apagado, o histórico continua a dizer quem fez o quê.

---

## Mensagens de WhatsApp por estado

Cada estado tem a sua mensagem, escrita na voz da casa:

> **Confirmada:** *"Confirmei seu pedido AD-K7M2PQ no valor de 249,00 €.
> Vou preparar tudo com cuidado e te aviso assim que seguir."*

> **Enviada:** *"A sua pedido já seguiu. Código de seguimento: Correios123…
> A caixa é neutra, sem qualquer identificação no exterior."*

> **Entregue:** *"Espero que você goste. Se o tamanho não estiver perfeito,
> me diga — trocamos sem complicação nenhuma nos próximos 30 dias."*

**Nada é enviado automaticamente.** O painel prepara a mensagem e abre o
WhatsApp; quem clica em enviar é sempre a vendedora. Numa marca que vive
de proximidade, uma mensagem automática detectável custa mais do que poupa.

---

## Exportação CSV — e uma vulnerabilidade evitada

O arquivo sai com separador `;` e BOM UTF-8, que é o que o Excel em
português espera. Sem o BOM os acentos aparecem trocados; com vírgula, tudo
cai numa coluna só.

**Injeção de fórmulas.** Um campo que comece por `=`, `+`, `-` ou `@` é
interpretado como fórmula pelo Excel. Um nome de cliente como
`=HYPERLINK("http://sitio-mau","Clique")` executaria ao abrir o arquivo.

A função de escape antepõe um apóstrofo a esses valores. Testado com
`=HYPERLINK`, `=1+1`, `+CMD|calc`, `-2+3` e `@SUM(A1)` — todos neutralizados,
e nomes normais ficam intactos.

---

## Referência da pedido

Formato `AD-XXXXXX`, num alfabeto **sem `0`, `O`, `1` nem `I`** — porque
alguém vai ditá-la ao telefone e esses caracteres confundem-se.

Testado com 3000 gerações: zero colisões, zero caracteres ambíguos.

---

## Preços congelados

Em `pedido_itens` guardam-se o **nome, tamanho, cor e preço** do momento
da compra, não uma referência viva ao catálogo.

Se a peça mudar de preço ou for descontinuada, a pedido antiga continua a
mostrar o que foi realmente vendido. Uma pedido é registo histórico, não
uma vista sobre o catálogo atual — e numa devolução seis meses depois, é
essa a diferença entre saber e adivinhar.

---

## Tela "Hoje" atualizado

- **Precisa de si** passa a incluir pedidos por confirmar, preparar ou
  enviar. A urgência sobe a cada 12 horas paradas.
- **Últimos 7 dias** mostra agora **receita**, pedidos e visitas.

---

## Sobre as pastas sem parênteses retos

A ficha de pedido ficaria naturalmente em `app/painel/pedidos/[id]/`.
Como o uploader web do GitHub recusa pastas com `[` e `]`, está em
`pedidos/ficha/` e recebe o identificador por query string. O
`next.config.ts` reescreve `/pedidos/<id>` para lá.

**O projeto continua com zero nomes problemáticos** — verificado.

---

## Testes

```
MÁQUINA DE ESTADOS                    10/10 ✓
CSV — INJEÇÃO DE FÓRMULAS              7/7  ✓
REFERÊNCIA                             3/3  ✓
RUNTIME (rotas protegidas)             6/6  ✓
```

Rotas do painel devolvem 307 (login) sem sessão; rotas internas `/painel/*`
devolvem 404; site público intacto.

---

## Tabelas novas

| Tabela | Papel |
|---|---|
| `pedidos` | Cabeçalho, totais, endereço, seguimento, notas internas |
| `pedido_itens` | Linhas com preços congelados |
| `pedido_eventos` | Linha do tempo auditável |

Aplicar:

```bash
npm run db:generate
npm run db:migrate
```

---

## Próxima fase

**Fase 4 — Análise** (1 a 2 semanas): tabela `metricas_diarias` com
pré-agregação nocturna, cinco indicadores com comparação ao período
anterior, seis gráficos e a **taxa de recompra a 90 dias** — o melhor
indicador de saúde do negócio, melhor do que receita mensal.

Ver `PLANO-EVOLUCAO.md`, secção 6.6.
