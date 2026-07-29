import { db, materiais, produtos, produtoMateriais } from './index';

/**
 * Seed com o catálogo inaugural de "A Dona Lingerie".
 * Rode com: bun run db:seed
 */
async function main() {
  console.log('🕊️  Semeando o ateliê…');

  const [seda, renda, algodao, modal] = await db
    .insert(materiais)
    .values([
      {
        slug: 'seda-amoreira-19mm',
        nome: 'Seda Amoreira 19 momme',
        familia: 'seda',
        origem: 'Como, Itália',
        composicao: '100% seda amoreira grade 6A',
        gramatura: '19 momme',
        respirabilidade: 5,
        toque: 5,
        caimento: 5,
        cuidados: 'Lavar à mão em água fria com sabão neutro. Secar à sombra, sem torcer.',
        certificacoes: ['OEKO-TEX® Standard 100', 'Seda tingida sem metais pesados'],
        descricao:
          'Fio longo, contínuo e uniforme. Termorreguladora por natureza: refresca no verão e conserva o calor no inverno. O brilho é suave, nunca brilhante em excesso — é a luz que se assenta sobre a pele.',
      },
      {
        slug: 'renda-chantilly',
        nome: 'Renda Chantilly francesa',
        familia: 'renda',
        origem: 'Caudry, França',
        composicao: '82% poliamida, 18% elastano',
        gramatura: '32 g/m²',
        respirabilidade: 4,
        toque: 4,
        caimento: 4,
        cuidados: 'Lavar à mão dentro de saco de malha. Não usar amaciante.',
        certificacoes: ['OEKO-TEX® Standard 100'],
        descricao:
          'Tecida em teares Leavers centenários. O desenho floral tem borda festonada que dispensa costura aparente — a renda termina onde a pele começa, sem marca nenhuma.',
      },
      {
        slug: 'algodao-pima',
        nome: 'Algodão Pima peruano',
        familia: 'algodão',
        origem: 'Vale de Piura, Peru',
        composicao: '95% algodão Pima, 5% elastano',
        gramatura: '140 g/m²',
        respirabilidade: 5,
        toque: 4,
        caimento: 3,
        cuidados: 'Máquina a 30 °C, ciclo delicado. Secagem natural.',
        certificacoes: ['GOTS', 'OEKO-TEX® Standard 100'],
        descricao:
          'Fibra extralonga, colhida à mão. Resulta num tecido que não borbota e fica mais macio a cada lavagem. A escolha certa para o uso diário e para peles reativas.',
      },
      {
        slug: 'micromodal-air',
        nome: 'MicroModal® AIR',
        familia: 'modal',
        origem: 'Lenzing, Áustria',
        composicao: '90% MicroModal®, 10% elastano',
        gramatura: '120 g/m²',
        respirabilidade: 5,
        toque: 5,
        caimento: 4,
        cuidados: 'Máquina a 30 °C. Não passar a ferro sobre os elásticos.',
        certificacoes: ['FSC®', 'OEKO-TEX® Standard 100'],
        descricao:
          'Celulose de faia europeia em circuito fechado. Absorve 50% mais humidade do que o algodão e mantém-se fresco por horas — é o segredo das nossas peças de segunda pele.',
      },
    ])
    .returning();

  const catalogo = await db
    .insert(produtos)
    .values([
      {
        slug: 'conjunto-aurora-seda',
        nome: 'Conjunto Aurora',
        colecao: 'Alvorada',
        resumo: 'Soutien sem aro e caleçon em seda amoreira com acabamento em renda Chantilly.',
        descricao:
          'Cortado em viés para acompanhar o movimento do corpo. O soutien dispensa aro: a sustentação vem da modelagem em três painéis e de uma faixa inferior larga e macia. Sem etiquetas — a numeração é impressa a laser no interior.',
        historia:
          'Nasceu de um pedido: uma cliente queria uma peça que pudesse usar sob um vestido de casamento e continuar a usar dez anos depois.',
        precoCents: 24900,
        cores: [
          { nome: 'Marfim', hex: '#F3EAE0' },
          { nome: 'Pérola nua', hex: '#E4CFC2' },
        ],
        tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
        imagens: [{ url: '/produtos/produto-seda.jpg', alt: 'Conjunto Aurora em seda marfim' }],
        destaque: true,
        estoque: 18,
        avaliacao: '5.0',
      },
      {
        slug: 'conjunto-noturno-renda',
        nome: 'Conjunto Noturno',
        colecao: 'Meia-noite',
        resumo: 'Renda Chantilly francesa sobre tule invisível. Estrutura discreta, presença total.',
        descricao:
          'A renda é aplicada sobre tule de 8 g/m², quase impercetível ao toque. O decote é desenhado peça a peça para que o festonado caia exatamente no lugar certo em cada tamanho.',
        historia: 'Uma homenagem aos teares Leavers de Caudry, onde cada metro leva cerca de uma hora a nascer.',
        precoCents: 28900,
        cores: [
          { nome: 'Preto tinta', hex: '#14110F' },
          { nome: 'Bordeaux', hex: '#5A1F2B' },
        ],
        tamanhos: ['P', 'M', 'G', 'GG'],
        imagens: [{ url: '/produtos/produto-renda.jpg', alt: 'Conjunto Noturno em renda preta' }],
        destaque: true,
        estoque: 12,
        avaliacao: '4.9',
      },
      {
        slug: 'conjunto-quotidiano-pima',
        nome: 'Conjunto Quotidiano',
        colecao: 'Segunda Pele',
        resumo: 'Algodão Pima e MicroModal®: respirável, invisível sob a roupa, feito para durar.',
        descricao:
          'Costuras planas, elásticos revestidos e zero aro. Testado em uso contínuo de 14 horas por um painel de 40 clientes antes de entrar em produção.',
        historia: 'A peça que as nossas clientes recompram mais vezes — normalmente em três cores de uma vez.',
        precoCents: 15900,
        cores: [
          { nome: 'Rosa areia', hex: '#E8C7BE' },
          { nome: 'Areia', hex: '#D8C3AE' },
          { nome: 'Carvão', hex: '#3A3736' },
        ],
        tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
        imagens: [{ url: '/produtos/produto-algodao.jpg', alt: 'Conjunto Quotidiano em algodão Pima' }],
        destaque: true,
        estoque: 46,
        avaliacao: '4.8',
      },
    ])
    .returning();

  await db.insert(produtoMateriais).values([
    { produtoId: catalogo[0].id, materialId: seda.id, percentual: 85, aplicacao: 'corpo' },
    { produtoId: catalogo[0].id, materialId: renda.id, percentual: 15, aplicacao: 'acabamento' },
    { produtoId: catalogo[1].id, materialId: renda.id, percentual: 100, aplicacao: 'corpo' },
    { produtoId: catalogo[2].id, materialId: algodao.id, percentual: 60, aplicacao: 'corpo' },
    { produtoId: catalogo[2].id, materialId: modal.id, percentual: 40, aplicacao: 'forro' },
  ]);

  console.log(`✅ ${catalogo.length} peças e 4 materiais registados.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
