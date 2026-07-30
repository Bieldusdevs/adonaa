# Fase 1 — concluída

Redesenho da homepage e formalização do serviço de visita ao domicílio.
Build validado: `✓ Compiled successfully`, 7 rotas.

---

## O que mudou

### Paleta

Três tokens novos em `app/globals.css`:

| Token | Valor | Onde |
|---|---|---|
| `--color-terracota` | `#a85940` | Botões de ação |
| `--color-terracota-claro` | `#b5654a` | Estado hover |
| `--color-pessego` | `#f7e3d8` | Fundo da faixa do serviço |

Os fundos ganharam +1% de amarelo (`#faf6f1` → `#fbf7f2`,
`#f0e7dc` → `#f2e9dd`). Imperceptível isoladamente, decisivo na temperatura
da página inteira.

**Sombras.** Todas passaram de cinzento neutro para castanho avermelhado
muito diluído (`rgb(90 45 30 / …)`). Ninguém repara conscientemente; a
página deixa de parecer clínica.

**Altura de linha** do corpo: 1.6 → 1.75. Textos íntimos pedem mais ar.

### Contraste — verificado, não estimado

O terracota mais quente do instinto (`#c07456`) dá **3.35:1** sobre marfim e
reprova em WCAG AA. Escurecido para `#a85940`:

| Combinação | Rácio | AA |
|---|---|---|
| Branco sobre terracota | 5.04:1 | ✅ |
| Terracota sobre marfim | 4.72:1 | ✅ |

O estado *hover* usa o tom mais claro — o mínimo de contraste aplica-se ao
estado de repouso.

### Homepage — nova ordem

```
1. Hero                    CTA agora em terracota
2. Faixa do serviço        ← NOVO
3. Coleção em destaque
4. Como é uma visita       ← NOVO
5. Os materiais
6. Voz da casa             ← NOVO
7. Testemunhos             ← NOVO
8. Dúvidas frequentes      ← NOVO
9. Rodapé                  ligações reais
```

**A faixa vem antes da coleção**, e é deliberado: quem chega ao site sem
saber o tamanho não compra — leva o serviço. Oferecer ajuda antes do catálogo
respeita a ordem real da hesitação.

### Componentes novos

| Ficheiro | Papel |
|---|---|
| `FaixaServico.tsx` | Faixa pêssego com foto da Ana e CTA |
| `ComoEUmaVisita.tsx` | 4 passos + 3 garantias |
| `VozDaCasa.tsx` | Fundadora na primeira pessoa |
| `Testemunhos.tsx` | 3 testemunhos, primeiro nome + cidade |
| `Duvidas.tsx` | Acordeão com JSON-LD `FAQPage` |
| `app/visita-em-casa/page.tsx` | Página dedicada ao serviço |

### Detalhes que valem a pena conhecer

**O FAQ usa `<details>` nativo.** Funciona sem JavaScript, é acessível por
omissão e o browser trata da navegação por teclado. A animação vem do CSS.
O JSON-LD faz o Google mostrar as respostas diretamente na pesquisa.

**A foto da fundadora não tem animação.** É a única imagem estática do site.
A quietude comunica seriedade — e contrasta com o resto, que se move.

**Ícones desenhados à mão em SVG**, nunca emoji. Emoji quebraria o registo
da marca e renderiza de forma diferente em cada sistema.

**Nenhuma menção ao corpo da cliente.** Em todo o texto novo fala-se da peça,
da luz, do provador — nunca do corpo. É o princípio 2.2 do plano, e a secção
"Voz da casa" torna-o explícito: *"Não é o seu corpo que está errado."*

### Página `/visita-em-casa`

Hero, "como funciona", **"o que levo comigo"** (a secção que mais converte —
ver a mala aberta transforma uma ideia abstrata em algo concreto), área de
serviço com porta aberta para outras cidades, testemunhos e marcação dupla
(WhatsApp + formulário).

Marcada com JSON-LD `Service`, preço `0` — o Google percebe que é gratuito.

---

## Imagens

Duas geradas para esta fase:

- `vendedora.jpg` — retrato documental no ateliê, a medir renda
- `mala-provas.jpg` — mala aberta com peças, fita métrica e espelho

**Substituir por fotografia real antes de publicar.** A secção "Voz da casa"
depende de uma foto autêntica da fundadora; sem ela, a secção deve sair —
uma fundadora de banco de imagens destrói mais confiança do que a ausência
da secção.

---

## Antes de publicar

- [ ] Fotografia real da fundadora
- [ ] Fotografia real da mala de provas
- [ ] Testemunhos reais (os atuais são guias de tom)
- [ ] Confirmar a lista de 6 cidades
- [ ] Confirmar: visitas de grupo fazem sentido? (mencionadas em 150 min)

---

## Próxima fase

**Fase 2 — Painel de gestão, núcleo** (2 a 3 semanas): autenticação com
Argon2id, rota secreta, ecrã "Hoje", agenda de visitas e bloco de notas.

Ver `PLANO-EVOLUCAO.md`, secções 5 e 6.
