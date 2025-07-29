import { relations } from "drizzle-orm/relations";
import { permissions, rolePermissions, roles, userRoles, users, blocks, quotePositions, articles, quoteVersions, blockContent, languages, quoteVariants, quotes, clients, contactPersons, changeHistory, salesOpportunities, articleCalculationItem } from "./schema";

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userRoles: many(userRoles),
	blocks: many(blocks),
	quoteVariants_blockedBy: many(quoteVariants, {
		relationName: "quoteVariants_blockedBy_users_id"
	}),
	quoteVariants_createdBy: many(quoteVariants, {
		relationName: "quoteVariants_createdBy_users_id"
	}),
	quoteVariants_modifiedBy: many(quoteVariants, {
		relationName: "quoteVariants_modifiedBy_users_id"
	}),
	changeHistories: many(changeHistory),
	quotes_blockedBy: many(quotes, {
		relationName: "quotes_blockedBy_users_id"
	}),
	quotes_createdBy: many(quotes, {
		relationName: "quotes_createdBy_users_id"
	}),
	quotes_modifiedBy: many(quotes, {
		relationName: "quotes_modifiedBy_users_id"
	}),
	salesOpportunities_blockedBy: many(salesOpportunities, {
		relationName: "salesOpportunities_blockedBy_users_id"
	}),
	salesOpportunities_createdBy: many(salesOpportunities, {
		relationName: "salesOpportunities_createdBy_users_id"
	}),
	salesOpportunities_modifiedBy: many(salesOpportunities, {
		relationName: "salesOpportunities_modifiedBy_users_id"
	}),
	salesOpportunities_salesRepresentative: many(salesOpportunities, {
		relationName: "salesOpportunities_salesRepresentative_users_id"
	}),
	quoteVersions_blockedBy: many(quoteVersions, {
		relationName: "quoteVersions_blockedBy_users_id"
	}),
	quoteVersions_createdBy: many(quoteVersions, {
		relationName: "quoteVersions_createdBy_users_id"
	}),
	quoteVersions_modifiedBy: many(quoteVersions, {
		relationName: "quoteVersions_modifiedBy_users_id"
	}),
	articles: many(articles),
}));

export const blocksRelations = relations(blocks, ({one, many}) => ({
	user: one(users, {
		fields: [blocks.blockedBy],
		references: [users.id]
	}),
	quotePositions: many(quotePositions),
	blockContents: many(blockContent),
}));

export const quotePositionsRelations = relations(quotePositions, ({one, many}) => ({
	quotePosition: one(quotePositions, {
		fields: [quotePositions.quotePositionParentId],
		references: [quotePositions.id],
		relationName: "quotePositions_quotePositionParentId_quotePositions_id"
	}),
	quotePositions: many(quotePositions, {
		relationName: "quotePositions_quotePositionParentId_quotePositions_id"
	}),
	article: one(articles, {
		fields: [quotePositions.articleId],
		references: [articles.id]
	}),
	block: one(blocks, {
		fields: [quotePositions.blockId],
		references: [blocks.id]
	}),
	quoteVersion: one(quoteVersions, {
		fields: [quotePositions.versionId],
		references: [quoteVersions.id]
	}),
}));

export const articlesRelations = relations(articles, ({one, many}) => ({
	quotePositions: many(quotePositions),
	blockContents: many(blockContent),
	user: one(users, {
		fields: [articles.blockedBy],
		references: [users.id]
	}),
	articleCalculationItems: many(articleCalculationItem),
}));

export const quoteVersionsRelations = relations(quoteVersions, ({one, many}) => ({
	quotePositions: many(quotePositions),
	user_blockedBy: one(users, {
		fields: [quoteVersions.blockedBy],
		references: [users.id],
		relationName: "quoteVersions_blockedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [quoteVersions.createdBy],
		references: [users.id],
		relationName: "quoteVersions_createdBy_users_id"
	}),
	user_modifiedBy: one(users, {
		fields: [quoteVersions.modifiedBy],
		references: [users.id],
		relationName: "quoteVersions_modifiedBy_users_id"
	}),
	quoteVariant: one(quoteVariants, {
		fields: [quoteVersions.variantId],
		references: [quoteVariants.id]
	}),
}));

export const blockContentRelations = relations(blockContent, ({one}) => ({
	article: one(articles, {
		fields: [blockContent.articleId],
		references: [articles.id]
	}),
	block: one(blocks, {
		fields: [blockContent.blockId],
		references: [blocks.id]
	}),
	language: one(languages, {
		fields: [blockContent.languageId],
		references: [languages.id]
	}),
}));

export const languagesRelations = relations(languages, ({many}) => ({
	blockContents: many(blockContent),
	quoteVariants: many(quoteVariants),
	clients: many(clients),
}));

export const quoteVariantsRelations = relations(quoteVariants, ({one, many}) => ({
	user_blockedBy: one(users, {
		fields: [quoteVariants.blockedBy],
		references: [users.id],
		relationName: "quoteVariants_blockedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [quoteVariants.createdBy],
		references: [users.id],
		relationName: "quoteVariants_createdBy_users_id"
	}),
	language: one(languages, {
		fields: [quoteVariants.languageId],
		references: [languages.id]
	}),
	user_modifiedBy: one(users, {
		fields: [quoteVariants.modifiedBy],
		references: [users.id],
		relationName: "quoteVariants_modifiedBy_users_id"
	}),
	quote: one(quotes, {
		fields: [quoteVariants.quoteId],
		references: [quotes.id]
	}),
	quoteVersions: many(quoteVersions),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	quoteVariants: many(quoteVariants),
	user_blockedBy: one(users, {
		fields: [quotes.blockedBy],
		references: [users.id],
		relationName: "quotes_blockedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [quotes.createdBy],
		references: [users.id],
		relationName: "quotes_createdBy_users_id"
	}),
	user_modifiedBy: one(users, {
		fields: [quotes.modifiedBy],
		references: [users.id],
		relationName: "quotes_modifiedBy_users_id"
	}),
	salesOpportunity: one(salesOpportunities, {
		fields: [quotes.salesOpportunityId],
		references: [salesOpportunities.id]
	}),
}));

export const contactPersonsRelations = relations(contactPersons, ({one, many}) => ({
	client: one(clients, {
		fields: [contactPersons.clientId],
		references: [clients.id]
	}),
	salesOpportunities: many(salesOpportunities),
}));

export const clientsRelations = relations(clients, ({one, many}) => ({
	contactPersons: many(contactPersons),
	salesOpportunities: many(salesOpportunities),
	language: one(languages, {
		fields: [clients.languageId],
		references: [languages.id]
	}),
}));

export const changeHistoryRelations = relations(changeHistory, ({one}) => ({
	user: one(users, {
		fields: [changeHistory.userId],
		references: [users.id]
	}),
}));

export const salesOpportunitiesRelations = relations(salesOpportunities, ({one, many}) => ({
	quotes: many(quotes),
	user_blockedBy: one(users, {
		fields: [salesOpportunities.blockedBy],
		references: [users.id],
		relationName: "salesOpportunities_blockedBy_users_id"
	}),
	client: one(clients, {
		fields: [salesOpportunities.clientId],
		references: [clients.id]
	}),
	contactPerson: one(contactPersons, {
		fields: [salesOpportunities.contactPersonId],
		references: [contactPersons.id]
	}),
	user_createdBy: one(users, {
		fields: [salesOpportunities.createdBy],
		references: [users.id],
		relationName: "salesOpportunities_createdBy_users_id"
	}),
	user_modifiedBy: one(users, {
		fields: [salesOpportunities.modifiedBy],
		references: [users.id],
		relationName: "salesOpportunities_modifiedBy_users_id"
	}),
	user_salesRepresentative: one(users, {
		fields: [salesOpportunities.salesRepresentative],
		references: [users.id],
		relationName: "salesOpportunities_salesRepresentative_users_id"
	}),
}));

export const articleCalculationItemRelations = relations(articleCalculationItem, ({one}) => ({
	article: one(articles, {
		fields: [articleCalculationItem.articleId],
		references: [articles.id]
	}),
}));