import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ------------------------------------------------------------------ *
 *  Enums de domínio
 * ------------------------------------------------------------------ */
export const statusAgendamento = pgEnum('status_agendamento', [
  'pendente',
  'confirmado',
  'realizado',
  'cancelado',
]);

export const tipoAtendimento = pgEnum('tipo_atendimento', [
  'domicilio', // prova e consultoria em casa
  'atelier',   // no ateliê
  'video',     // consulta por vídeo
]);

export const statusConsulta = pgEnum('status_consulta', [
  'nova',
  'em_atendimento',
  'respondida',
  'arquivada',
]);

/* ------------------------------------------------------------------ *
 *  Materiais — o coração da narrativa da marca
 * ------------------------------------------------------------------ */
export const materiais = pgTable(
  'materiais',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 96 }).notNull(),
    nome: varchar('nome', { length: 120 }).notNull(),          // "Seda Amoreira 19mm"
    familia: varchar('familia', { length: 64 }).notNull(),      // seda | renda | algodão | modal
    origem: varchar('origem', { length: 120 }),                 // "Como, Itália"
    composicao: text('composicao').notNull(),                   // "100% seda amoreira"
    gramatura: varchar('gramatura', { length: 32 }),            // "19 momme"
    respirabilidade: integer('respirabilidade').notNull().default(3), // 1-5
    toque: integer('toque').notNull().default(3),               // 1-5
    caimento: integer('caimento').notNull().default(3),         // 1-5
    cuidados: text('cuidados').notNull(),
    certificacoes: jsonb('certificacoes').$type<string[]>().default([]),
    descricao: text('descricao').notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ slugIdx: uniqueIndex('materiais_slug_idx').on(t.slug) }),
);

/* ------------------------------------------------------------------ *
 *  Produtos
 * ------------------------------------------------------------------ */
export const produtos = pgTable(
  'produtos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 128 }).notNull(),
    nome: varchar('nome', { length: 160 }).notNull(),
    colecao: varchar('colecao', { length: 96 }).notNull(),
    resumo: varchar('resumo', { length: 280 }).notNull(),
    descricao: text('descricao').notNull(),
    historia: text('historia'),                       // storytelling da peça
    precoCents: integer('preco_cents').notNull(),
    moeda: varchar('moeda', { length: 3 }).notNull().default('BRL'),
    cores: jsonb('cores').$type<{ nome: string; hex: string }[]>().default([]),
    tamanhos: jsonb('tamanhos').$type<string[]>().default([]),
    imagens: jsonb('imagens').$type<{ url: string; alt: string }[]>().default([]),
    destaque: boolean('destaque').notNull().default(false),
    ativo: boolean('ativo').notNull().default(true),
    estoque: integer('estoque').notNull().default(0),
    avaliacao: numeric('avaliacao', { precision: 2, scale: 1 }).default('5.0'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('produtos_slug_idx').on(t.slug),
    colecaoIdx: index('produtos_colecao_idx').on(t.colecao),
    destaqueIdx: index('produtos_destaque_idx').on(t.destaque),
  }),
);

/** N:N produto <-> material, com o percentual de composição da peça. */
export const produtoMateriais = pgTable(
  'produto_materiais',
  {
    produtoId: uuid('produto_id')
      .notNull()
      .references(() => produtos.id, { onDelete: 'cascade' }),
    materialId: uuid('material_id')
      .notNull()
      .references(() => materiais.id, { onDelete: 'restrict' }),
    percentual: integer('percentual').notNull().default(100),
    aplicacao: varchar('aplicacao', { length: 96 }),  // "corpo", "acabamento", "forro"
  },
  (t) => ({
    pk: uniqueIndex('produto_materiais_pk').on(t.produtoId, t.materialId, t.aplicacao),
  }),
);

/* ------------------------------------------------------------------ *
 *  Clientes, consultas e agendamentos
 * ------------------------------------------------------------------ */
export const clientes = pgTable(
  'clientes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: varchar('nome', { length: 160 }).notNull(),
    email: varchar('email', { length: 200 }).notNull(),
    telefone: varchar('telefone', { length: 40 }),
    // medidas ficam sob consentimento explícito (LGPD)
    medidas: jsonb('medidas').$type<Record<string, number>>(),
    consentimentoLgpd: boolean('consentimento_lgpd').notNull().default(false),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ emailIdx: uniqueIndex('clientes_email_idx').on(t.email) }),
);

export const consultas = pgTable('consultas', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').references(() => clientes.id, { onDelete: 'set null' }),
  assunto: varchar('assunto', { length: 160 }).notNull(),
  mensagem: text('mensagem').notNull(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'set null' }),
  status: statusConsulta('status').notNull().default('nova'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
});

export const agendamentos = pgTable(
  'agendamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clienteId: uuid('cliente_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'cascade' }),
    tipo: tipoAtendimento('tipo').notNull().default('domicilio'),
    status: statusAgendamento('status').notNull().default('pendente'),
    inicioEm: timestamp('inicio_em', { withTimezone: true }).notNull(),
    duracaoMin: integer('duracao_min').notNull().default(90),
    endereco: text('endereco'),
    cidade: varchar('cidade', { length: 96 }),
    cep: varchar('cep', { length: 16 }),
    observacoes: text('observacoes'),
    consultoraId: uuid('consultora_id'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    inicioIdx: index('agendamentos_inicio_idx').on(t.inicioEm),
    // impede overbooking do mesmo horário para a mesma consultora
    slotUnico: uniqueIndex('agendamentos_slot_unico').on(t.consultoraId, t.inicioEm),
  }),
);

/* ================================================================== *
 *  PAINEL DE GESTÃO
 * ================================================================== */

export const papelUsuario = pgEnum('papel_usuario', ['admin', 'consultora']);

export const etiquetaNota = pgEnum('etiqueta_nota', [
  'cliente',
  'fornecedor',
  'ideia',
  'urgente',
  'geral',
]);

/**
 * Usuárioes do painel.
 *
 * A senha é guardada como hash Argon2id — nunca em claro, nunca
 * reversível. Se esta tabela vazar, as palavras-passe continuam protegidas.
 */
export const usuarios = pgTable(
  'usuarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 200 }).notNull(),
    nomeCompleto: varchar('nome_completo', { length: 160 }).notNull(),
    senhaHash: text('senha_hash').notNull(),
    papel: papelUsuario('papel').notNull().default('consultora'),
    ativo: boolean('ativo').notNull().default(true),
    ultimoAcessoEm: timestamp('ultimo_acesso_em', { withTimezone: true }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ emailIdx: uniqueIndex('usuarios_email_idx').on(t.email) }),
);

/**
 * Registo de acessos ao painel — auditoria.
 *
 * Guarda tentativas falhadas também: é assim que se percebe se alguém anda
 * a tentar entrar. O token é guardado como hash, para que ler esta tabela
 * não permita roubar uma sessão ativa.
 */
export const sessoesAdmin = pgTable(
  'sessoes_admin',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id, {
      onDelete: 'cascade',
    }),
    emailTentado: varchar('email_tentado', { length: 200 }),
    sucesso: boolean('sucesso').notNull(),
    ip: varchar('ip', { length: 64 }),
    userAgent: text('user_agent'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ criadoIdx: index('sessoes_admin_criado_idx').on(t.criadoEm) }),
);

/**
 * Bloco de notas.
 *
 * Simples de propósito: a vendedora precisa de escrever depressa, não de
 * organizar. Sem editor rico — negritos e cores são fricção.
 */
export const notas = pgTable(
  'notas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    autorId: uuid('autor_id')
      .notNull()
      .references(() => usuarios.id, { onDelete: 'cascade' }),
    titulo: varchar('titulo', { length: 200 }),
    conteudo: text('conteudo').notNull().default(''),
    etiqueta: etiquetaNota('etiqueta').notNull().default('geral'),
    fixada: boolean('fixada').notNull().default(false),
    arquivada: boolean('arquivada').notNull().default(false),
    // links opcionais — uma nota pode pertencer a uma cliente
    clienteId: uuid('cliente_id').references(() => clientes.id, { onDelete: 'set null' }),
    agendamentoId: uuid('agendamento_id').references(() => agendamentos.id, {
      onDelete: 'set null',
    }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    autorIdx: index('notas_autor_idx').on(t.autorId),
    fixadaIdx: index('notas_fixada_idx').on(t.fixada, t.atualizadoEm),
  }),
);

/**
 * Registo do que aconteceu numa visita.
 *
 * Preenchido depois, pela vendedora. Alimenta a ficha da cliente e a
 * preparação da próxima mala — e é a base para medir a conversão real
 * do serviço.
 */
export const visitaRegistos = pgTable('visita_registos', {
  id: uuid('id').primaryKey().defaultRandom(),
  agendamentoId: uuid('agendamento_id')
    .notNull()
    .references(() => agendamentos.id, { onDelete: 'cascade' }),
  pecasProvadas: jsonb('pecas_provadas').$type<string[]>().default([]),
  pecasCompradas: jsonb('pecas_compradas').$type<string[]>().default([]),
  valorCents: integer('valor_cents').notNull().default(0),
  observacoes: text('observacoes'),
  proximoContatoEm: timestamp('proximo_contato_em', { withTimezone: true }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
});

/* ================================================================== *
 *  ENCOMENDAS
 * ================================================================== */

export const estadoPedido = pgEnum('estado_pedido', [
  'novo',
  'confirmado',
  'preparado',
  'enviado',
  'entregue',
  'devolvido',
  'cancelado',
]);

export const origemVenda = pgEnum('origem_venda', ['site', 'visita', 'whatsapp', 'atelier']);

export const pedidos = pgTable(
  'pedidos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referencia: varchar('referencia', { length: 16 }).notNull(),
    clienteId: uuid('cliente_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'restrict' }),
    estado: estadoPedido('estado').notNull().default('novo'),
    origem: origemVenda('origem').notNull().default('site'),

    subtotalCents: integer('subtotal_cents').notNull().default(0),
    portesCents: integer('portes_cents').notNull().default(0),
    descontoCents: integer('desconto_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull().default(0),
    moeda: varchar('moeda', { length: 3 }).notNull().default('BRL'),

    endereçoEnvio: text('endereço_envio'),
    cidadeEnvio: varchar('cidade_envio', { length: 96 }),
    cepEnvio: varchar('cep_envio', { length: 16 }),
    metodoEnvio: varchar('metodo_envio', { length: 64 }),
    codigoSeguimento: varchar('codigo_seguimento', { length: 96 }),

    /** Nunca visível para a cliente. */
    notasInternas: text('notas_internas'),

    /** Se a venda nasceu de uma visita, fica o rasto — alimenta a Fase 4. */
    agendamentoId: uuid('agendamento_id').references(() => agendamentos.id, {
      onDelete: 'set null',
    }),

    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    refIdx: uniqueIndex('pedidos_referencia_idx').on(t.referencia),
    estadoIdx: index('pedidos_estado_idx').on(t.estado, t.criadoEm),
    clienteIdx: index('pedidos_cliente_idx').on(t.clienteId),
  }),
);

/**
 * Linhas da pedido.
 *
 * O nome, tamanho, cor e preço ficam CONGELADOS no momento da compra. Se a
 * peça mudar de preço ou for descontinuada, a pedido antiga continua a
 * mostrar o que foi realmente vendido — uma pedido é registo histórico,
 * não uma vista sobre o catálogo atual.
 */
export const pedidoItens = pgTable(
  'pedido_itens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pedidoId: uuid('pedido_id')
      .notNull()
      .references(() => pedidos.id, { onDelete: 'cascade' }),
    produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'set null' }),

    nomeProduto: varchar('nome_produto', { length: 200 }).notNull(),
    tamanho: varchar('tamanho', { length: 16 }),
    cor: varchar('cor', { length: 64 }),
    quantidade: integer('quantidade').notNull().default(1),
    precoUnitarioCents: integer('preco_unitario_cents').notNull(),
  },
  (t) => ({ pedidoIdx: index('pedido_itens_pedido_idx').on(t.pedidoId) }),
);

/**
 * Linha do tempo auditável.
 *
 * Cada mudança de estado fica registada com autor e hora. Numa devolução ou
 * numa reclamação, é isto que permite reconstruir o que aconteceu — e não
 * depender da memória de ninguém.
 */
export const pedidoEventos = pgTable(
  'pedido_eventos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pedidoId: uuid('pedido_id')
      .notNull()
      .references(() => pedidos.id, { onDelete: 'cascade' }),
    estadoAnterior: estadoPedido('estado_anterior'),
    estadoNovo: estadoPedido('estado_novo').notNull(),
    autorId: uuid('autor_id').references(() => usuarios.id, { onDelete: 'set null' }),
    autorNome: varchar('autor_nome', { length: 160 }),
    nota: text('nota'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pedidoIdx: index('pedido_eventos_pedido_idx').on(t.pedidoId, t.criadoEm) }),
);

/**
 * Métricas pré-agregadas, uma linha por dia.
 *
 * Calcular a receita de 12 semanas somando pedidos a cada carregamento fica
 * lento depressa. Um job noturno grava aqui o resumo do dia; os gráficos
 * leem só desta tabela — uma consulta a 84 linhas em vez de milhares.
 */
export const metricasDiarias = pgTable(
  'metricas_diarias',
  {
    data: varchar('data', { length: 10 }).primaryKey(), // YYYY-MM-DD
    receitaCents: integer('receita_cents').notNull().default(0),
    numPedidos: integer('num_pedidos').notNull().default(0),
    numVisitas: integer('num_visitas').notNull().default(0),
    numVisitasConvertidas: integer('num_visitas_convertidas').notNull().default(0),
    novasClientes: integer('novas_clientes').notNull().default(0),
    clientesRecorrentes: integer('clientes_recorrentes').notNull().default(0),
    calculadoEm: timestamp('calculado_em', { withTimezone: true }).defaultNow().notNull(),
  },
);

/* ================================================================== *
 *  CRESCIMENTO — indicações
 * ================================================================== */

export const estadoIndicacao = pgEnum('estado_indicacao', [
  'ativo',
  'usado',
  'expirado',
]);

/**
 * Programa de indicação.
 *
 * O canal natural desta marca: quem tem boa experiência conta para uma
 * amiga. O código pessoal (ANA-MARTA) dá o empurrão e permite saber quem
 * são as embaixadoras reais — não as que dizem que indicam, as que indicam.
 */
export const indicacoes = pgTable(
  'indicacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 32 }).notNull(),
    clienteOrigemId: uuid('cliente_origem_id')
      .notNull()
      .references(() => clientes.id, { onDelete: 'cascade' }),
    clienteDestinoId: uuid('cliente_destino_id').references(() => clientes.id, {
      onDelete: 'set null',
    }),
    estado: estadoIndicacao('estado').notNull().default('ativo'),
    descontoPercent: integer('desconto_percent').notNull().default(15),
    pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'set null' }),
    usadoEm: timestamp('usado_em', { withTimezone: true }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    codigoIdx: uniqueIndex('indicacoes_codigo_idx').on(t.codigo),
    origemIdx: index('indicacoes_origem_idx').on(t.clienteOrigemId),
  }),
);

/**
 * Oportunidades já tratadas.
 *
 * O motor de sugestões recalcula tudo a cada visita à página. Sem isto, uma
 * sugestão dispensada voltaria a aparecer no dia seguinte — e a lista
 * deixaria de ser levada a sério.
 */
export const oportunidadesTratadas = pgTable(
  'oportunidades_tratadas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    chave: varchar('chave', { length: 200 }).notNull(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id, { onDelete: 'cascade' }),
    dispensadaEm: timestamp('dispensada_em', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ chaveIdx: uniqueIndex('oportunidades_chave_idx').on(t.chave) }),
);

/* ------------------------------------------------------------------ *
 *  Relations (Drizzle Query API)
 * ------------------------------------------------------------------ */
export const produtosRelations = relations(produtos, ({ many }) => ({
  materiais: many(produtoMateriais),
}));

export const produtoMateriaisRelations = relations(produtoMateriais, ({ one }) => ({
  produto: one(produtos, { fields: [produtoMateriais.produtoId], references: [produtos.id] }),
  material: one(materiais, { fields: [produtoMateriais.materialId], references: [materiais.id] }),
}));

export const clientesRelations = relations(clientes, ({ many }) => ({
  agendamentos: many(agendamentos),
  consultas: many(consultas),
}));

export const agendamentosRelations = relations(agendamentos, ({ one }) => ({
  cliente: one(clientes, { fields: [agendamentos.clienteId], references: [clientes.id] }),
}));

export const notasRelations = relations(notas, ({ one }) => ({
  autor: one(usuarios, { fields: [notas.autorId], references: [usuarios.id] }),
  cliente: one(clientes, { fields: [notas.clienteId], references: [clientes.id] }),
}));

export const visitaRegistosRelations = relations(visitaRegistos, ({ one }) => ({
  agendamento: one(agendamentos, {
    fields: [visitaRegistos.agendamentoId],
    references: [agendamentos.id],
  }),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  cliente: one(clientes, { fields: [pedidos.clienteId], references: [clientes.id] }),
  itens: many(pedidoItens),
  eventos: many(pedidoEventos),
}));

export const pedidoItensRelations = relations(pedidoItens, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [pedidoItens.pedidoId],
    references: [pedidos.id],
  }),
}));

export const pedidoEventosRelations = relations(pedidoEventos, ({ one }) => ({
  pedido: one(pedidos, {
    fields: [pedidoEventos.pedidoId],
    references: [pedidos.id],
  }),
}));

export type Produto = typeof produtos.$inferSelect;
export type NovoProduto = typeof produtos.$inferInsert;
export type Material = typeof materiais.$inferSelect;
export type Agendamento = typeof agendamentos.$inferSelect;
export type NovoAgendamento = typeof agendamentos.$inferInsert;
export type Cliente = typeof clientes.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type Nota = typeof notas.$inferSelect;
export type NovaNota = typeof notas.$inferInsert;
export type VisitaRegisto = typeof visitaRegistos.$inferSelect;
export type Pedido = typeof pedidos.$inferSelect;
export type NovaPedido = typeof pedidos.$inferInsert;
export type PedidoItem = typeof pedidoItens.$inferSelect;
export type PedidoEvento = typeof pedidoEventos.$inferSelect;
export type EstadoPedido = Pedido['estado'];
export type MetricaDiaria = typeof metricasDiarias.$inferSelect;
export type Indicacao = typeof indicacoes.$inferSelect;
