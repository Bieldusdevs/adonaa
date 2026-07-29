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
    moeda: varchar('moeda', { length: 3 }).notNull().default('EUR'),
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
    // medidas ficam sob consentimento explícito (RGPD)
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
    codigoPostal: varchar('codigo_postal', { length: 16 }),
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

export type Produto = typeof produtos.$inferSelect;
export type NovoProduto = typeof produtos.$inferInsert;
export type Material = typeof materiais.$inferSelect;
export type Agendamento = typeof agendamentos.$inferSelect;
export type NovoAgendamento = typeof agendamentos.$inferInsert;
