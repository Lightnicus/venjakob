// This file defines the database schema using Drizzle ORM
import { relations } from "drizzle-orm"
import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, uuid, unique } from "drizzle-orm/pg-core"

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  status: boolean("status").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  offers: many(offers),
  blocks: many(blocks),
  articles: many(articles),
  salesOpportunities: many(salesOpportunities),
}))

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const customersRelations = relations(customers, ({ many }) => ({
  offers: many(offers),
  salesOpportunities: many(salesOpportunities),
}))

// Sales Opportunities table
export const salesOpportunities = pgTable("sales_opportunities", {
  id: serial("id").primaryKey(),
  gguid: uuid("gguid").defaultRandom().notNull().unique(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("unbewertet"),
  phase: varchar("phase", { length: 100 }),
  volume: decimal("volume", { precision: 12, scale: 2 }),
  deliveryDate: timestamp("delivery_date"),
  responsibleUserId: integer("responsible_user_id").references(() => users.id),
  probability: integer("probability"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const salesOpportunitiesRelations = relations(salesOpportunities, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesOpportunities.customerId],
    references: [customers.id],
  }),
  responsibleUser: one(users, {
    fields: [salesOpportunities.responsibleUserId],
    references: [users.id],
  }),
  offers: many(offers),
}))

// Blocks table
export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  isStandard: boolean("is_standard").notNull().default(false),
  isMandatory: boolean("is_mandatory").notNull().default(false),
  position: integer("position"),
  printTitle: boolean("print_title").notNull().default(true),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedById: integer("updated_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [blocks.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [blocks.updatedById],
    references: [users.id],
  }),
  blockDescriptions: many(blockDescriptions),
  offerBlocks: many(offerBlocks),
}))

// Block Descriptions table (multilingual)
export const blockDescriptions = pgTable(
  "block_descriptions",
  {
    id: serial("id").primaryKey(),
    blockId: integer("block_id")
      .references(() => blocks.id)
      .notNull(),
    language: varchar("language", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      blockLanguageUnique: unique().on(table.blockId, table.language),
    }
  },
)

export const blockDescriptionsRelations = relations(blockDescriptions, ({ one }) => ({
  block: one(blocks, {
    fields: [blockDescriptions.blockId],
    references: [blocks.id],
  }),
}))

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  articleNumber: varchar("article_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedById: integer("updated_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const articlesRelations = relations(articles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [articles.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [articles.updatedById],
    references: [users.id],
  }),
  articleDescriptions: many(articleDescriptions),
}))

// Article Descriptions table (multilingual)
export const articleDescriptions = pgTable(
  "article_descriptions",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .references(() => articles.id)
      .notNull(),
    language: varchar("language", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      articleLanguageUnique: unique().on(table.articleId, table.language),
    }
  },
)

export const articleDescriptionsRelations = relations(articleDescriptions, ({ one }) => ({
  article: one(articles, {
    fields: [articleDescriptions.articleId],
    references: [articles.id],
  }),
}))

// Offers table
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  offerNumber: varchar("offer_number", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
  salesOpportunityId: integer("sales_opportunity_id").references(() => salesOpportunities.id),
  currentVersionId: integer("current_version_id"),
  validUntil: timestamp("valid_until"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedById: integer("updated_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const offersRelations = relations(offers, ({ one, many }) => ({
  customer: one(customers, {
    fields: [offers.customerId],
    references: [customers.id],
  }),
  salesOpportunity: one(salesOpportunities, {
    fields: [offers.salesOpportunityId],
    references: [salesOpportunities.id],
  }),
  createdBy: one(users, {
    fields: [offers.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [offers.updatedById],
    references: [users.id],
  }),
  versions: many(offerVersions),
  currentVersion: one(offerVersions, {
    fields: [offers.currentVersionId],
    references: [offerVersions.id],
  }),
}))

// Offer Versions table
export const offerVersions = pgTable("offer_versions", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id")
    .references(() => offers.id)
    .notNull(),
  versionNumber: varchar("version_number", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("Entwurf"),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  recipientPhone: varchar("recipient_phone", { length: 50 }),
  changeTitle: varchar("change_title", { length: 255 }),
  changeDescription: text("change_description"),
  publishedById: integer("published_by_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const offerVersionsRelations = relations(offerVersions, ({ one, many }) => ({
  offer: one(offers, {
    fields: [offerVersions.offerId],
    references: [offers.id],
  }),
  publishedBy: one(users, {
    fields: [offerVersions.publishedById],
    references: [users.id],
  }),
  offerBlocks: many(offerBlocks),
  positions: many(positions),
}))

// Offer Blocks table (junction table between offer versions and blocks)
export const offerBlocks = pgTable("offer_blocks", {
  id: serial("id").primaryKey(),
  offerVersionId: integer("offer_version_id")
    .references(() => offerVersions.id)
    .notNull(),
  blockId: integer("block_id")
    .references(() => blocks.id)
    .notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const offerBlocksRelations = relations(offerBlocks, ({ one, many }) => ({
  offerVersion: one(offerVersions, {
    fields: [offerBlocks.offerVersionId],
    references: [offerVersions.id],
  }),
  block: one(blocks, {
    fields: [offerBlocks.blockId],
    references: [blocks.id],
  }),
  articles: many(offerBlockArticles),
}))

// Offer Block Articles table (junction table between offer blocks and articles)
export const offerBlockArticles = pgTable("offer_block_articles", {
  id: serial("id").primaryKey(),
  offerBlockId: integer("offer_block_id")
    .references(() => offerBlocks.id)
    .notNull(),
  articleId: integer("article_id")
    .references(() => articles.id)
    .notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const offerBlockArticlesRelations = relations(offerBlockArticles, ({ one }) => ({
  offerBlock: one(offerBlocks, {
    fields: [offerBlockArticles.offerBlockId],
    references: [offerBlocks.id],
  }),
  article: one(articles, {
    fields: [offerBlockArticles.articleId],
    references: [articles.id],
  }),
}))

// Positions table (line items in offers)
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  offerVersionId: integer("offer_version_id")
    .references(() => offerVersions.id)
    .notNull(),
  blockId: integer("block_id")
    .references(() => blocks.id)
    .notNull(),
  articleId: integer("article_id").references(() => articles.id),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  isOption: boolean("is_option").notNull().default(false),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const positionsRelations = relations(positions, ({ one }) => ({
  offerVersion: one(offerVersions, {
    fields: [positions.offerVersionId],
    references: [offerVersions.id],
  }),
  block: one(blocks, {
    fields: [positions.blockId],
    references: [blocks.id],
  }),
  article: one(articles, {
    fields: [positions.articleId],
    references: [articles.id],
  }),
}))

// Order Confirmations table
export const orderConfirmations = pgTable("order_confirmations", {
  id: serial("id").primaryKey(),
  confirmationNumber: varchar("confirmation_number", { length: 50 }).notNull().unique(),
  offerId: integer("offer_id")
    .references(() => offers.id)
    .notNull(),
  offerVersionId: integer("offer_version_id")
    .references(() => offerVersions.id)
    .notNull(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
  confirmationDate: timestamp("confirmation_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const orderConfirmationsRelations = relations(orderConfirmations, ({ one }) => ({
  offer: one(offers, {
    fields: [orderConfirmations.offerId],
    references: [offers.id],
  }),
  offerVersion: one(offerVersions, {
    fields: [orderConfirmations.offerVersionId],
    references: [offerVersions.id],
  }),
  customer: one(customers, {
    fields: [orderConfirmations.customerId],
    references: [customers.id],
  }),
  createdBy: one(users, {
    fields: [orderConfirmations.createdById],
    references: [users.id],
  }),
}))
