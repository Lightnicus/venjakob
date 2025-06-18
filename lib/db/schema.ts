import { pgTable, serial, text, timestamp, uuid, boolean, integer, pgEnum, numeric, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const articleCalculationItemTypeEnum = pgEnum('article_calculation_item_type', ['time', 'cost']);

// Example Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Language table
export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  value: text('value').notNull().unique(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  foreignId: text('foreign_id').notNull().unique(),
  name: text('name').notNull(),
  languageId: uuid('language_id').notNull().references(() => languages.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  blocked: timestamp('blocked'),
  blockedBy: uuid('blocked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Articles table
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  number: text('number').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  hideTitle: boolean('hide_title').notNull().default(false),
  blocked: timestamp('blocked'),
  blockedBy: uuid('blocked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Block Content table
export const blockContent = pgTable('block_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockId: uuid('block_id').references(() => blocks.id),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  languageId: uuid('language_id').notNull().references(() => languages.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Ensure either blockId or articleId is set, but not both
  blockOrArticleCheck: check('block_or_article_check', 
    sql`(${table.blockId} IS NOT NULL AND ${table.articleId} IS NULL) OR (${table.blockId} IS NULL AND ${table.articleId} IS NOT NULL)`
  ),
}));

// Article Calculation Item table
export const articleCalculationItem = pgTable('article_calculation_item', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: articleCalculationItemTypeEnum('type').notNull(),
  value: numeric('value').notNull(),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  order: integer('order'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert; 

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;

export type BlockContent = typeof blockContent.$inferSelect;
export type InsertBlockContent = typeof blockContent.$inferInsert;

export type ArticleCalculationItem = typeof articleCalculationItem.$inferSelect;
export type InsertArticleCalculationItem = typeof articleCalculationItem.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert; 