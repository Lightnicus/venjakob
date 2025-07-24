import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  pgEnum,
  numeric,
  check,
  unique,
  jsonb,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';

// Enums
export const articleCalculationItemTypeEnum = pgEnum(
  'article_calculation_item_type',
  ['time', 'cost'],
);
export const auditActionEnum = pgEnum('audit_action', [
  'INSERT',
  'UPDATE',
  'DELETE',
]);
export const salesOpportunityStatusEnum = pgEnum('sales_opportunity_status', [
  'open',
  'in_progress',
  'won',
  'lost',
  'cancelled',
]);

// Example Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Language table
export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  value: text('value').notNull().unique(),
  label: text('label').notNull(),
  default: boolean('default').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Clients table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  foreignId: text('foreign_id').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  casLink: text('cas_link'),
  languageId: uuid('language_id')
    .notNull()
    .references(() => languages.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Blocks table
export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  standard: boolean('standard').notNull(),
  mandatory: boolean('mandatory').notNull(),
  position: integer('position'),
  hideTitle: boolean('hide_title').notNull(),
  pageBreakAbove: boolean('page_break_above').notNull(),
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: uuid('blocked_by').references(() => users.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Articles table
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: text('number').notNull(),
  price: numeric('price').notNull(),
  hideTitle: boolean('hide_title').notNull().default(false),
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: uuid('blocked_by').references(() => users.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Block Content table
export const blockContent = pgTable(
  'block_content',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    blockId: uuid('block_id').references(() => blocks.id, {
      onDelete: 'cascade',
    }),
    articleId: uuid('article_id').references(() => articles.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    languageId: uuid('language_id')
      .notNull()
      .references(() => languages.id),
    deleted: boolean('deleted').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => ({
    // Ensure either blockId or articleId is set, but not both
    blockOrArticleCheck: check(
      'block_or_article_check',
      sql`(${table.blockId} IS NOT NULL AND ${table.articleId} IS NULL) OR (${table.blockId} IS NULL AND ${table.articleId} IS NOT NULL)`,
    ),
  }),
);

// Article Calculation Item table
export const articleCalculationItem = pgTable('article_calculation_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: articleCalculationItemTypeEnum('type').notNull(),
  value: numeric('value').notNull(),
  articleId: uuid('article_id').references(() => articles.id, {
    onDelete: 'cascade',
  }),
  order: integer('order'),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Roles table
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  resource: text('resource').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// User Roles junction table
export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => ({
    // Ensure a user can only have each role once
    userRoleUnique: unique('user_role_unique').on(table.userId, table.roleId),
  }),
);

// Role Permissions junction table
export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => ({
    // Ensure a role can only have each permission once
    rolePermissionUnique: unique('role_permission_unique').on(
      table.roleId,
      table.permissionId,
    ),
  }),
);

// Change History / Audit Log table
export const changeHistory = pgTable(
  'change_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: text('entity_type').notNull(), // 'articles', 'blocks', 'users', etc.
    entityId: uuid('entity_id').notNull(), // ID of the changed record
    action: auditActionEnum('action').notNull(), // INSERT, UPDATE, DELETE
    changedFields: jsonb('changed_fields'), // For UPDATE: {field: {old: value, new: value}}, for INSERT/DELETE: full record
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    timestamp: timestamp('timestamp', { mode: 'string' })
      .defaultNow()
      .notNull(),
    metadata: jsonb('metadata'), // Optional: IP, user agent, reason, etc.
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => ({
    // Indexes for performance
    entityIdx: index('change_history_entity_idx').on(
      table.entityType,
      table.entityId,
    ),
    userIdx: index('change_history_user_idx').on(table.userId),
    timestampIdx: index('change_history_timestamp_idx').on(table.timestamp),
  }),
);

// Contact Persons table (Ansprechpartner)
export const contactPersons = pgTable('contact_persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  salutation: text('salutation'),
  name: text('name').notNull(),
  firstName: text('first_name'),
  email: text('email'),
  phone: text('phone'),
  position: text('position'),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Sales Opportunities table (Verkaufschance)
export const salesOpportunities = pgTable('sales_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  crmId: text('crm_id'),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  contactPersonId: uuid('contact_person_id').references(
    () => contactPersons.id,
  ),
  orderInventorySpecification: text('order_inventory_specification'),
  status: salesOpportunityStatusEnum('status').notNull().default('open'),
  businessArea: text('business_area'),
  salesRepresentative: uuid('sales_representative').references(() => users.id),
  keyword: text('keyword'),
  quoteVolume: numeric('quote_volume'),
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: uuid('blocked_by').references(() => users.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  modifiedBy: uuid('modified_by').references(() => users.id),
});

// Quotes table (Angebot)
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  salesOpportunityId: uuid('sales_opportunity_id')
    .notNull()
    .references(() => salesOpportunities.id, { onDelete: 'cascade' }),
  quoteNumber: text('quote_number').notNull().unique(),
  title: text('title'),
  validUntil: timestamp('valid_until', { mode: 'string' }),
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: uuid('blocked_by').references(() => users.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  modifiedBy: uuid('modified_by').references(() => users.id),
});

// Quote Variants table (Variante)
export const quoteVariants = pgTable('quote_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  variantDescriptor: text('variant_descriptor').notNull(),
  variantNumber: integer('variant_number').notNull(),
  languageId: uuid('language_id')
    .notNull()
    .references(() => languages.id),
  isDefault: boolean('is_default').notNull().default(false),
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: uuid('blocked_by').references(() => users.id),
  deleted: boolean('deleted').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  modifiedBy: uuid('modified_by').references(() => users.id),
});

// Quote Versions table (Version)
export const quoteVersions = pgTable(
  'quote_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => quoteVariants.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    accepted: boolean('accepted').notNull().default(false),
    calculationDataLive: boolean('calculation_data_live')
      .notNull()
      .default(false),
    totalPrice: numeric('total_price'),
    isLatest: boolean('is_latest').notNull().default(false),
    blocked: timestamp('blocked', { mode: 'string' }),
    blockedBy: uuid('blocked_by').references(() => users.id),
    deleted: boolean('deleted').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    modifiedBy: uuid('modified_by').references(() => users.id),
  },
  table => ({
    // Ensure version number is unique within a variant
    variantVersionUnique: unique('variant_version_unique').on(
      table.variantId,
      table.versionNumber,
    ),
  }),
);

// Quote Positions table (Position)
export const quotePositions = pgTable(
  'quote_positions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    versionId: uuid('version_id')
      .notNull()
      .references(() => quoteVersions.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id').references(() => articles.id),
    blockId: uuid('block_id').references(() => blocks.id),
    quotePositionParentId: uuid('quote_position_parent_id'),
    positionNumber: integer('position_number').notNull(),
    quantity: numeric('quantity').notNull().default('1'),
    unitPrice: numeric('unit_price'),
    totalPrice: numeric('total_price'),
    articleCost: numeric('article_cost'),
    description: text('description'),
    title: text('title'),
    deleted: boolean('deleted').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => ({
    // Ensure either articleId or blockId is set, but not both
    articleOrBlockCheck: check(
      'article_or_block_check',
      sql`(${table.articleId} IS NOT NULL AND ${table.blockId} IS NULL) OR (${table.articleId} IS NULL AND ${table.blockId} IS NOT NULL)`,
    ),
    // Ensure position number is unique within a variant and parent level
    versionPositionUnique: unique('version_position_unique').on(
      table.versionId,
      table.quotePositionParentId,
      table.positionNumber,
    ),
    // Self-reference foreign key constraint
    quotePositionParentFK: foreignKey({
      columns: [table.quotePositionParentId],
      foreignColumns: [table.id],
      name: 'quote_position_parent_fk',
    }).onDelete('cascade'),
  }),
);

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type ContactPerson = typeof contactPersons.$inferSelect;
export type InsertContactPerson = typeof contactPersons.$inferInsert;

export type SalesOpportunity = typeof salesOpportunities.$inferSelect;
export type InsertSalesOpportunity = typeof salesOpportunities.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

export type QuoteVariant = typeof quoteVariants.$inferSelect;
export type InsertQuoteVariant = typeof quoteVariants.$inferInsert;

export type QuoteVersion = typeof quoteVersions.$inferSelect;
export type InsertQuoteVersion = typeof quoteVersions.$inferInsert;

export type QuotePosition = typeof quotePositions.$inferSelect;
export type InsertQuotePosition = typeof quotePositions.$inferInsert;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;

export type BlockContent = typeof blockContent.$inferSelect;
export type InsertBlockContent = typeof blockContent.$inferInsert;

export type ArticleCalculationItem = typeof articleCalculationItem.$inferSelect;
export type InsertArticleCalculationItem =
  typeof articleCalculationItem.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type ChangeHistory = typeof changeHistory.$inferSelect;
export type InsertChangeHistory = typeof changeHistory.$inferInsert;
