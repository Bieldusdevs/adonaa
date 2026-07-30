# Fases 5 e 6 — concluídas

Motor de oportunidades, programa de indicação, modelos de mensagem,
calendário editorial, acessibilidade e SEO.

Build validado: `✓ Compiled successfully`, **20 rotas**.

---

## Correção antes de começar

O script de localização da fase anterior tinha renomeado a tabela
`utilizadores` para **`usuários` — com acento**. Nome de tabela e de coluna
com acento quebra migrações SQL e é frágil entre drivers.

Corrigido para `usuarios` / `usuario_id` / `papel_usuario` em 4 arquivos.
Um erro que só apareceria na primeira migração em produção.

---

## Fase 5 — Crescer

Nova rota `/crescer` no painel, com quatro blocos.

### 1. Motor de oportunidades

Sugestões **derivadas dos dados reais**, nunca genéricas:

| Sinal nos dados | Sugestão gerada |
|---|---|
| Cliente sem comprar há 90+ dias | Mensagem de reposição pronta |
| Visita realizada sem pedido (2 a 14 dias) | Seguimento discreto |
| 3+ atendimentos na mesma cidade em 60 dias | Concentrar visitas e poupar trânsito |
| Cliente com 2+ compras e sem código | Criar código de indicação |

**A regra que orienta tudo:** *"publique nas redes sociais"* é ruído — a
vendedora já sabe. Só entra o que os dados dela dizem e que ela não veria
sem abrir o Postgres.

Se não houver histórico, a lista fica **vazia com uma explicação**. Uma
lista de banalidades ensinaria a ignorar a página inteira.

### Dispensar sem reaparecer

Cada sugestão tem uma chave estável, guardada em `oportunidades_tratadas`
quando dispensada. As chaves incorporam a janela de tempo:

```
reposicao:<clienteId>:<meses>    → 95 e 100 dias = mesma chave ✓
                                   125 dias      = chave nova  ✓
zona:<cidade>:<semana>           → reaparece na semana seguinte
```

Sem isto, uma sugestão dispensada voltaria amanhã e a lista perderia
credibilidade. **4/4 testes de estabilidade passaram.**

### 2. Programa de indicação

Código pessoal legível: `ADONA-MARTA47`. Quem indica e quem é indicada
ganham a mesma percentagem (10, 15 ou 20%).

Testado com acentuação brasileira:

```
Conceição Silva → ADONA-CONCEICAO47   ✓
Mônica Alves    → ADONA-MONICA23      ✓
Maria D'Ávila   → ADONA-MARIA88       ✓
```

O painel mostra quem indicou quem — e revela as embaixadoras **reais**,
não as que dizem que indicam.

### 3. Modelos de mensagem

Seis modelos na voz da casa: pós-visita, reposição, primeira compra,
aniversário, pedido de depoimento e convite para indicar.

**Nenhum é enviado automaticamente.** O que faz este canal funcionar é ser
uma pessoa do outro lado — uma mensagem automática detectável custa mais
do que poupa.

### 4. Calendário editorial

Nove datas com ideias concretas, ordenadas **circularmente** a partir do mês
atual (em novembro mostra nov → dez → jan). Testado nos três casos de
virada de ano.

Duas entradas com opinião, não só data:

> **Outubro Rosa** — lingerie pós-cirúrgica ou parceria local. Assunto
> sensível: tratar com cuidado real ou não tratar.

> **Black Friday** — decidir se participa. Uma marca premium pode ganhar
> mais **não** participando, e dizendo porquê.

---

## Fase 6 — Polimento

### Um erro de segurança que corrigi a meio

Escrevi o `robots.ts` a bloquear `/gestao-ad-2f9k`. Parece correto — e é
exatamente o oposto.

**O robots.txt é público.** Escrever `Disallow: /gestao-ad-2f9k` publica a
URL secreta para qualquer pessoa que abra o arquivo. É o primeiro lugar
onde se procura painéis escondidos.

Removido. O painel fica fora dos motores pelo cabeçalho
`X-Robots-Tag: noindex, nofollow` que o middleware já enviava — invisível
aos robôs, sem revelar o caminho.

Verificado em produção:

```
$ curl /robots.txt | grep -c "gestao-ad-2f9k"
0
```

### Acessibilidade

Anel de foco visível e consistente em tudo o que é interativo. O anel
padrão do navegador desaparece sobre fundos claros; este usa terracota com
3 px de deslocamento e cumpre o mínimo de 3:1 para indicadores.

### SEO

- `sitemap.xml` gerado dinamicamente
- `robots.txt` sem expor o painel
- Página 404 na voz da marca, com caminho de volta e convite a agendar

---

## Testes

```
CÓDIGO DE INDICAÇÃO            4/4  ✓
CHAVES DE OPORTUNIDADE         4/4  ✓
CALENDÁRIO CIRCULAR            3/3  ✓
ROTAS PÚBLICAS                 8/8  ✓  (inclui 404)
PAINEL PROTEGIDO               8/8  ✓  (307 login · 404 interno)
ROBOTS SEM SEGREDO             1/1  ✓
```

---

## O painel completo

```
/gestao-<secreto>
├── Hoje         O que precisa de si agora
├── Pedidos      7 estados, histórico auditável, CSV
├── Visitas      Agenda agrupada por dia
├── Números      5 indicadores, 5 gráficos, recompra 90 dias
├── Crescer      Oportunidades, indicações, modelos, calendário
├── Notas        Etiquetas, fixar, arquivar
└── Clientes     Contatos e histórico
```

---

## Tabelas novas

| Tabela | Papel |
|---|---|
| `indicacoes` | Códigos pessoais, estado, desconto |
| `oportunidades_tratadas` | Sugestões dispensadas |

```bash
npm run db:generate && npm run db:migrate
```

---

## Antes de publicar

- [ ] `SESSION_SECRET` e `ADMIN_PATH` na Vercel — **mude o valor padrão**
- [ ] `NEXT_PUBLIC_WHATSAPP` com o número real de BH
- [ ] Rodar as migrações e criar o usuário admin
- [ ] Conferir os preços do catálogo (ainda são valores pensados em euros)
- [ ] Substituir as fotos geradas por IA — sobretudo a da fundadora
- [ ] Trocar os depoimentos por reais
- [ ] Definir a percentagem de indicação sustentável na sua margem
