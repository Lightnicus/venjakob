import { pgTable, serial, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';

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
  position: integer('position').notNull(),
  hideTitle: boolean('hide_title').notNull(),
  pageBreakAbove: boolean('page_break_above').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Block Content table
export const blockContent = pgTable('block_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockId: uuid('block_id').notNull().references(() => blocks.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  languageId: uuid('language_id').notNull().references(() => languages.id),
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