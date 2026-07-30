import type { Produto } from '@/lib/db';

/**
 * Catálogo de demonstração.
 *
 * Serve dois momentos concretos:
 *  1. O primeiro deploy na Vercel, antes de a base de dados estar semeada —
 *     o site sobe apresentável em vez de rebentar com uma página de erro.
 *  2. `bun dev` sem Postgres a correr, para quem só quer mexer no design.
 *
 * Assim que houver dados reais na base, estes deixam de ser usados.
 */
export const CATALOGO_EXEMPLO: Produto[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    slug: 'conjunto-aurora-seda',
    nome: 'Conjunto Aurora',
    colecao: 'Alvorada',
    resumo: 'Sutiã sem aro e calcinha em seda amoreira com acabamento em renda Chantilly.',
    descricao:
      'Cortado em viés para acompanhar o movimento do corpo. O sutiã dispensa aro: a sustentação vem da modelagem em três painéis e de uma faixa inferior larga e macia. Sem etiquetas — a numeração é impressa a laser no interior.',
    historia:
      'Nasceu de um pedido: uma cliente queria uma peça que pudesse usar sob um vestido de casamento e continuar a usar dez anos depois.',
    precoCents: 24900,
    moeda: 'BRL',
    cores: [
      { nome: 'Marfim', hex: '#F3EAE0' },
      { nome: 'Pérola nua', hex: '#E4CFC2' },
    ],
    tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
    imagens: [{ url: '/produtos/produto-seda.jpg', alt: 'Conjunto Aurora em seda marfim' }],
    destaque: true,
    ativo: true,
    estoque: 18,
    avaliacao: '5.0',
    criadoEm: new Date('2026-01-15'),
    atualizadoEm: new Date('2026-01-15'),
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    slug: 'conjunto-noturno-renda',
    nome: 'Conjunto Noturno',
    colecao: 'Meia-noite',
    resumo: 'Renda Chantilly francesa sobre tule invisível. Estrutura discreta, presença total.',
    descricao:
      'A renda é aplicada sobre tule de 8 g/m², quase impercetível ao toque. O decote é desenhado peça a peça para que o festonado caia exatamente no lugar certo em cada tamanho.',
    historia:
      'Uma homenagem aos teares Leavers de Caudry, onde cada metro leva cerca de uma hora a nascer.',
    precoCents: 28900,
    moeda: 'BRL',
    cores: [
      { nome: 'Preto tinta', hex: '#14110F' },
      { nome: 'Bordeaux', hex: '#5A1F2B' },
    ],
    tamanhos: ['P', 'M', 'G', 'GG'],
    imagens: [{ url: '/produtos/produto-renda.jpg', alt: 'Conjunto Noturno em renda preta' }],
    destaque: true,
    ativo: true,
    estoque: 12,
    avaliacao: '4.9',
    criadoEm: new Date('2026-01-10'),
    atualizadoEm: new Date('2026-01-10'),
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    slug: 'conjunto-quotidiano-pima',
    nome: 'Conjunto Quotidiano',
    colecao: 'Segunda Pele',
    resumo: 'Algodão Pima e MicroModal®: respirável, invisível sob a roupa, feito para durar.',
    descricao:
      'Costuras planas, elásticos revestidos e zero aro. Testado em uso contínuo de 14 horas por um painel de 40 clientes antes de entrar em produção.',
    historia:
      'A peça que as nossas clientes recompram mais vezes — normalmente em três cores de uma vez.',
    precoCents: 15900,
    moeda: 'BRL',
    cores: [
      { nome: 'Rosa areia', hex: '#E8C7BE' },
      { nome: 'Areia', hex: '#D8C3AE' },
      { nome: 'Carvão', hex: '#3A3736' },
    ],
    tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
    imagens: [{ url: '/produtos/produto-algodao.jpg', alt: 'Conjunto Quotidiano em algodão Pima' }],
    destaque: true,
    ativo: true,
    estoque: 46,
    avaliacao: '4.8',
    criadoEm: new Date('2026-01-05'),
    atualizadoEm: new Date('2026-01-05'),
  },
];
