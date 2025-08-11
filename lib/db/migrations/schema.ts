import { pgTable, unique, uuid, text, timestamp, foreignKey, boolean, integer, check, numeric, index, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const articleCalculationItemType = pgEnum("article_calculation_item_type", ['time', 'cost'])
export const auditAction = pgEnum("audit_action", ['INSERT', 'UPDATE', 'DELETE'])
export const salesOpportunityStatus = pgEnum("sales_opportunity_status", ['open', 'in_progress', 'won', 'lost', 'cancelled'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const permissions = pgTable("permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	resource: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("permissions_name_unique").on(table.name),
]);

export const rolePermissions = pgTable("role_permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roleId: uuid("role_id").notNull(),
	permissionId: uuid("permission_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_permissions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_roles_id_fk"
		}).onDelete("cascade"),
	unique("role_permission_unique").on(table.roleId, table.permissionId),
]);

export const userRoles = pgTable("user_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	roleId: uuid("role_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_roles_role_id_roles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_role_unique").on(table.userId, table.roleId),
]);

export const blocks = pgTable("blocks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	standard: boolean().notNull(),
	mandatory: boolean().notNull(),
	position: integer(),
	hideTitle: boolean("hide_title").notNull(),
	pageBreakAbove: boolean("page_break_above").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "blocks_blocked_by_users_id_fk"
		}),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const quotePositions = pgTable("quote_positions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	versionId: uuid("version_id").notNull(),
	articleId: uuid("article_id"),
	blockId: uuid("block_id"),
	positionNumber: integer("position_number").notNull(),
	quantity: numeric().default('1').notNull(),
	unitPrice: numeric("unit_price"),
	totalPrice: numeric("total_price"),
	articleCost: numeric("article_cost"),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	title: text(),
	quotePositionParentId: uuid("quote_position_parent_id"),
	isOption: boolean("is_option").default(false).notNull(),
	pageBreakAbove: boolean("page_break_above").default(false).notNull(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.quotePositionParentId],
			foreignColumns: [table.id],
			name: "quote_position_parent_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "quote_positions_article_id_articles_id_fk"
		}),
	foreignKey({
			columns: [table.blockId],
			foreignColumns: [blocks.id],
			name: "quote_positions_block_id_blocks_id_fk"
		}),
	foreignKey({
			columns: [table.versionId],
			foreignColumns: [quoteVersions.id],
			name: "quote_positions_version_id_quote_versions_id_fk"
		}).onDelete("cascade"),
	unique("version_position_unique").on(table.versionId, table.positionNumber, table.quotePositionParentId),
	check("article_or_block_check", sql`((article_id IS NOT NULL) AND (block_id IS NULL)) OR ((article_id IS NULL) AND (block_id IS NOT NULL))`),
]);

export const blockContent = pgTable("block_content", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	blockId: uuid("block_id"),
	title: text().notNull(),
	content: text().notNull(),
	languageId: uuid("language_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	articleId: uuid("article_id"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "block_content_article_id_articles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockId],
			foreignColumns: [blocks.id],
			name: "block_content_block_id_blocks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: "block_content_language_id_languages_id_fk"
		}),
	check("block_or_article_check", sql`((block_id IS NOT NULL) AND (article_id IS NULL)) OR ((block_id IS NULL) AND (article_id IS NOT NULL))`),
]);

export const quoteVariants = pgTable("quote_variants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id").notNull(),
	variantDescriptor: text("variant_descriptor").notNull(),
	languageId: uuid("language_id").notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	modifiedBy: uuid("modified_by"),
	variantNumber: integer("variant_number").notNull(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "quote_variants_blocked_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "quote_variants_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: "quote_variants_language_id_languages_id_fk"
		}),
	foreignKey({
			columns: [table.modifiedBy],
			foreignColumns: [users.id],
			name: "quote_variants_modified_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "quote_variants_quote_id_quotes_id_fk"
		}).onDelete("cascade"),
]);

export const contactPersons = pgTable("contact_persons", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	name: text().notNull(),
	firstName: text("first_name"),
	email: text(),
	phone: text(),
	position: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	salutation: text(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "contact_persons_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const changeHistory = pgTable("change_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	action: auditAction().notNull(),
	changedFields: jsonb("changed_fields"),
	userId: uuid("user_id").notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("change_history_entity_idx").using("btree", table.entityType.asc().nullsLast().op("uuid_ops"), table.entityId.asc().nullsLast().op("text_ops")),
	index("change_history_timestamp_idx").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("change_history_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "change_history_user_id_users_id_fk"
		}),
]);

export const quotes = pgTable("quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	salesOpportunityId: uuid("sales_opportunity_id").notNull(),
	quoteNumber: text("quote_number").notNull(),
	title: text(),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	modifiedBy: uuid("modified_by"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "quotes_blocked_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "quotes_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.modifiedBy],
			foreignColumns: [users.id],
			name: "quotes_modified_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.salesOpportunityId],
			foreignColumns: [salesOpportunities.id],
			name: "quotes_sales_opportunity_id_sales_opportunities_id_fk"
		}).onDelete("cascade"),
	unique("quotes_quote_number_unique").on(table.quoteNumber),
]);

export const salesOpportunities = pgTable("sales_opportunities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	crmId: text("crm_id"),
	clientId: uuid("client_id").notNull(),
	contactPersonId: uuid("contact_person_id"),
	orderInventorySpecification: text("order_inventory_specification"),
	status: salesOpportunityStatus().default('open').notNull(),
	businessArea: text("business_area"),
	salesRepresentative: uuid("sales_representative"),
	keyword: text(),
	quoteVolume: numeric("quote_volume"),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	modifiedBy: uuid("modified_by"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "sales_opportunities_blocked_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "sales_opportunities_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.contactPersonId],
			foreignColumns: [contactPersons.id],
			name: "sales_opportunities_contact_person_id_contact_persons_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_opportunities_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.modifiedBy],
			foreignColumns: [users.id],
			name: "sales_opportunities_modified_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.salesRepresentative],
			foreignColumns: [users.id],
			name: "sales_opportunities_sales_representative_users_id_fk"
		}),
]);

export const quoteVersions = pgTable("quote_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	variantId: uuid("variant_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	accepted: boolean().default(false).notNull(),
	calculationDataLive: boolean("calculation_data_live").default(false).notNull(),
	totalPrice: numeric("total_price"),
	isLatest: boolean("is_latest").default(false).notNull(),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	modifiedBy: uuid("modified_by"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "quote_versions_blocked_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "quote_versions_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.modifiedBy],
			foreignColumns: [users.id],
			name: "quote_versions_modified_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.variantId],
			foreignColumns: [quoteVariants.id],
			name: "quote_versions_variant_id_quote_variants_id_fk"
		}).onDelete("cascade"),
	unique("variant_version_unique").on(table.variantId, table.versionNumber),
]);

export const languages = pgTable("languages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	value: text().notNull(),
	label: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	default: boolean().default(false).notNull(),
}, (table) => [
	unique("languages_value_unique").on(table.value),
]);

export const articles = pgTable("articles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	number: text().notNull(),
	price: numeric().notNull(),
	hideTitle: boolean("hide_title").default(false).notNull(),
	blocked: timestamp({ mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [users.id],
			name: "articles_blocked_by_users_id_fk"
		}),
]);

export const articleCalculationItem = pgTable("article_calculation_item", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: articleCalculationItemType().notNull(),
	value: numeric().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	articleId: uuid("article_id"),
	order: integer(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "article_calculation_item_article_id_articles_id_fk"
		}).onDelete("cascade"),
]);

export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	foreignId: text("foreign_id").notNull(),
	name: text().notNull(),
	languageId: uuid("language_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	address: text(),
	phone: text(),
	casLink: text("cas_link"),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.languageId],
			foreignColumns: [languages.id],
			name: "clients_language_id_languages_id_fk"
		}),
	unique("clients_foreign_id_unique").on(table.foreignId),
]);
