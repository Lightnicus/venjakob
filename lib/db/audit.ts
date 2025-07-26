import { eq, and } from 'drizzle-orm';
import { db } from './index';
import { changeHistory, articles, blocks, blockContent, users } from './schema';

// Type for database transaction - using the actual db transaction type
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Entity type mapping
export const ENTITY_TYPES = {
  ARTICLES: 'articles',
  BLOCKS: 'blocks',
  USERS: 'users',
  BLOCK_CONTENT: 'block_content',
  ARTICLE_CALCULATION_ITEM: 'article_calculation_item',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

// Audit action types
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

// Interface for audit log data
interface AuditLogData {
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  changedFields?: Record<string, { old: any; new: any }> | Record<string, any>;
  userId: string;
  metadata?: Record<string, any>;
}

// Utility to create audit log entry
const createAuditLog = async (tx: Transaction, auditData: AuditLogData): Promise<void> => {
  await tx.insert(changeHistory).values({
    entityType: auditData.entityType,
    entityId: auditData.entityId,
    action: auditData.action,
    changedFields: auditData.changedFields,
    userId: auditData.userId,
    metadata: auditData.metadata,
  });
};

// Generic audited transaction wrapper
export const withAudit = async <T>(
  operation: (tx: Transaction) => Promise<T>,
  auditData: AuditLogData
): Promise<T> => {
  return await db.transaction(async (tx) => {
    // 1. Perform the main operation
    const result = await operation(tx);
    
    // 2. Update entityId with the actual result ID for INSERT operations
    if (auditData.action === 'INSERT' && result && typeof result === 'object' && 'id' in result) {
      auditData.entityId = (result as any).id;
    }
    
    // 3. Log the change in the same transaction
    await createAuditLog(tx, auditData);
    
    // 4. Both succeed or both fail
    return result;
  });
};

// Specific audited operations for articles
export const auditedArticleOperations = {
  // Create new article with audit
  create: async (articleData: typeof articles.$inferInsert, userId: string, metadata?: Record<string, any>) => {
    return await withAudit(
      async (tx) => {
        const [newArticle] = await tx.insert(articles).values(articleData).returning();
        return newArticle;
      },
      {
        entityType: ENTITY_TYPES.ARTICLES,
        entityId: '', // Will be set after insert
        action: 'INSERT',
        changedFields: articleData,
        userId,
        metadata,
      }
    );
  },

  // Update article with audit
  update: async (id: string, updateData: Partial<typeof articles.$inferInsert>, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before update
      const [currentArticle] = await tx.select().from(articles).where(eq(articles.id, id));
      if (!currentArticle) throw new Error('Article not found');

      // 2. Perform update
      const [updatedArticle] = await tx.update(articles)
        .set({ ...updateData, updatedAt: new Date().toISOString() })
        .where(eq(articles.id, id))
        .returning();

      // 3. Calculate changed fields
      const changedFields: Record<string, { old: any; new: any }> = {};
      for (const [key, newValue] of Object.entries(updateData)) {
        const oldValue = currentArticle[key as keyof typeof currentArticle];
        if (oldValue !== newValue) {
          changedFields[key] = { old: oldValue, new: newValue };
        }
      }

      // 4. Create audit log only if there were actual changes
      if (Object.keys(changedFields).length > 0) {
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.ARTICLES,
          entityId: id,
          action: 'UPDATE',
          changedFields,
          userId,
          metadata,
        });
      }

      return updatedArticle;
    });
  },

  // Soft delete article with audit
  delete: async (id: string, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before deletion
      const [currentArticle] = await tx.select().from(articles).where(eq(articles.id, id));
      if (!currentArticle) throw new Error('Article not found');

      // 2. Soft delete the article (set deleted = true)
      const [deletedArticle] = await tx.update(articles)
        .set({ deleted: true, updatedAt: new Date().toISOString() })
        .where(eq(articles.id, id))
        .returning();

      // 3. Soft delete associated block content (cascade)
      const associatedContent = await tx.select().from(blockContent).where(eq(blockContent.articleId, id));
      for (const content of associatedContent) {
        await tx.update(blockContent)
          .set({ deleted: true, updatedAt: new Date().toISOString() })
          .where(eq(blockContent.id, content.id));

        // Create audit log for each deleted content piece
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCK_CONTENT,
          entityId: content.id,
          action: 'DELETE',
          changedFields: { deleted: { old: false, new: true } },
          userId,
          metadata: {
            ...metadata,
            reason: 'Cascading soft delete from article deletion',
            parentEntityType: 'articles',
            parentEntityId: id,
          },
        });
      }

      // 4. Create audit log for article
      await createAuditLog(tx, {
        entityType: ENTITY_TYPES.ARTICLES,
        entityId: id,
        action: 'DELETE',
        changedFields: { deleted: { old: false, new: true } },
        userId,
        metadata,
      });

      return deletedArticle;
    });
  },
};

// Specific audited operations for blocks
export const auditedBlockOperations = {
  // Create new block with audit
  create: async (blockData: typeof blocks.$inferInsert, userId: string, metadata?: Record<string, any>) => {
    return await withAudit(
      async (tx) => {
        const [newBlock] = await tx.insert(blocks).values(blockData).returning();
        return newBlock;
      },
      {
        entityType: ENTITY_TYPES.BLOCKS,
        entityId: '', // Will be set after insert
        action: 'INSERT',
        changedFields: blockData,
        userId,
        metadata,
      }
    );
  },

  // Update block with audit
  update: async (id: string, updateData: Partial<typeof blocks.$inferInsert>, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before update
      const [currentBlock] = await tx.select().from(blocks).where(eq(blocks.id, id));
      if (!currentBlock) throw new Error('Block not found');

      // 2. Perform update
      const [updatedBlock] = await tx.update(blocks)
        .set({ ...updateData, updatedAt: new Date().toISOString() })
        .where(eq(blocks.id, id))
        .returning();

      // 3. Calculate changed fields
      const changedFields: Record<string, { old: any; new: any }> = {};
      for (const [key, newValue] of Object.entries(updateData)) {
        const oldValue = currentBlock[key as keyof typeof currentBlock];
        if (oldValue !== newValue) {
          changedFields[key] = { old: oldValue, new: newValue };
        }
      }

      // 4. Create audit log only if there were actual changes
      if (Object.keys(changedFields).length > 0) {
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCKS,
          entityId: id,
          action: 'UPDATE',
          changedFields,
          userId,
          metadata,
        });
      }

      return updatedBlock;
    });
  },

  // Soft delete block with audit
  delete: async (id: string, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before deletion
      const [currentBlock] = await tx.select().from(blocks).where(eq(blocks.id, id));
      if (!currentBlock) throw new Error('Block not found');

      // 2. Soft delete the block (set deleted = true)
      const [deletedBlock] = await tx.update(blocks)
        .set({ deleted: true, updatedAt: new Date().toISOString() })
        .where(eq(blocks.id, id))
        .returning();

      // 3. Soft delete associated block content (cascade)
      const associatedContent = await tx.select().from(blockContent).where(eq(blockContent.blockId, id));
      for (const content of associatedContent) {
        await tx.update(blockContent)
          .set({ deleted: true, updatedAt: new Date().toISOString() })
          .where(eq(blockContent.id, content.id));

        // Create audit log for each deleted content piece
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCK_CONTENT,
          entityId: content.id,
          action: 'DELETE',
          changedFields: { deleted: { old: false, new: true } },
          userId,
          metadata: {
            ...metadata,
            reason: 'Cascading soft delete from block deletion',
            parentEntityType: 'blocks',
            parentEntityId: id,
          },
        });
      }

      // 4. Create audit log for block
      await createAuditLog(tx, {
        entityType: ENTITY_TYPES.BLOCKS,
        entityId: id,
        action: 'DELETE',
        changedFields: { deleted: { old: false, new: true } },
        userId,
        metadata,
      });

      return deletedBlock;
    });
  },
};

// Specific audited operations for block content
export const auditedBlockContentOperations = {
  // Create new block content with audit
  create: async (contentData: typeof blockContent.$inferInsert, userId: string, metadata?: Record<string, any>) => {
    return await withAudit(
      async (tx) => {
        const [newContent] = await tx.insert(blockContent).values(contentData).returning();
        return newContent;
      },
      {
        entityType: ENTITY_TYPES.BLOCK_CONTENT,
        entityId: '', // Will be set after insert
        action: 'INSERT',
        changedFields: contentData,
        userId,
        metadata,
      }
    );
  },

  // Update block content with audit
  update: async (id: string, updateData: Partial<typeof blockContent.$inferInsert>, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before update
      const [currentContent] = await tx.select().from(blockContent).where(eq(blockContent.id, id));
      if (!currentContent) throw new Error('Block content not found');

      // 2. Perform update
      const [updatedContent] = await tx.update(blockContent)
        .set({ ...updateData, updatedAt: new Date().toISOString() })
        .where(eq(blockContent.id, id))
        .returning();

      // 3. Calculate changed fields
      const changedFields: Record<string, { old: any; new: any }> = {};
      for (const [key, newValue] of Object.entries(updateData)) {
        const oldValue = currentContent[key as keyof typeof currentContent];
        if (oldValue !== newValue) {
          changedFields[key] = { old: oldValue, new: newValue };
        }
      }

      // 4. Create audit log only if there were actual changes
      if (Object.keys(changedFields).length > 0) {
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCK_CONTENT,
          entityId: id,
          action: 'UPDATE',
          changedFields,
          userId,
          metadata,
        });
      }

      return updatedContent;
    });
  },

  // Soft delete block content with audit
  delete: async (id: string, userId: string, metadata?: Record<string, any>) => {
    return await db.transaction(async (tx) => {
      // 1. Get current state before deletion
      const [currentContent] = await tx.select().from(blockContent).where(eq(blockContent.id, id));
      if (!currentContent) throw new Error('Block content not found');

      // 2. Soft delete the content (set deleted = true)
      const [deletedContent] = await tx.update(blockContent)
        .set({ deleted: true, updatedAt: new Date().toISOString() })
        .where(eq(blockContent.id, id))
        .returning();

      // 3. Create audit log
      await createAuditLog(tx, {
        entityType: ENTITY_TYPES.BLOCK_CONTENT,
        entityId: id,
        action: 'DELETE',
        changedFields: { deleted: { old: false, new: true } },
        userId,
        metadata,
      });

      return deletedContent;
    });
  },

  // Bulk operations for content replacement (used by saveBlockContent/saveArticleContent)
  replaceAll: async (
    entityType: 'blocks' | 'articles',
    entityId: string,
    newContentData: Omit<typeof blockContent.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
    userId: string,
    metadata?: Record<string, any>
  ) => {
    return await db.transaction(async (tx) => {
      // 1. Get existing content before deletion
      const whereClause = entityType === 'blocks' 
        ? eq(blockContent.blockId, entityId)
        : eq(blockContent.articleId, entityId);
      
      const existingContent = await tx.select().from(blockContent).where(whereClause);

      // 2. Soft delete existing content with audit logs
      for (const content of existingContent) {
        await tx.update(blockContent)
          .set({ deleted: true, updatedAt: new Date().toISOString() })
          .where(eq(blockContent.id, content.id));

        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCK_CONTENT,
          entityId: content.id,
          action: 'DELETE',
          changedFields: { deleted: { old: false, new: true } },
          userId,
          metadata: {
            ...metadata,
            reason: `Content replaced as part of ${entityType.slice(0, -1)} content update`,
            parentEntityType: entityType,
            parentEntityId: entityId,
          },
        });
      }

      // 4. Insert new content with audit logs
      const createdContent = [];
      for (const contentData of newContentData) {
        const [newContent] = await tx.insert(blockContent).values({
          ...contentData,
          deleted: false,
        }).returning();
        
        await createAuditLog(tx, {
          entityType: ENTITY_TYPES.BLOCK_CONTENT,
          entityId: newContent.id,
          action: 'INSERT',
          changedFields: contentData,
          userId,
          metadata: {
            ...metadata,
            reason: `Content created as part of ${entityType.slice(0, -1)} content update`,
            parentEntityType: entityType,
            parentEntityId: entityId,
          },
        });

        createdContent.push(newContent);
      }

      return createdContent;
    });
  },
};

// Query functions for change history
export const auditQueries = {
  // Get all changes for a specific entity
  getEntityHistory: async (entityType: EntityType, entityId: string, limit = 50) => {
    return await db
      .select({
        id: changeHistory.id,
        action: changeHistory.action,
        changedFields: changeHistory.changedFields,
        timestamp: changeHistory.timestamp,
        metadata: changeHistory.metadata,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(changeHistory)
      .leftJoin(users, eq(changeHistory.userId, users.id))
      .where(and(
        eq(changeHistory.entityType, entityType),
        eq(changeHistory.entityId, entityId)
      ))
      .orderBy(changeHistory.timestamp)
      .limit(limit);
  },

  // Get recent changes by a user
  getUserActivity: async (userId: string, limit = 50) => {
    return await db
      .select()
      .from(changeHistory)
      .where(eq(changeHistory.userId, userId))
      .orderBy(changeHistory.timestamp)
      .limit(limit);
  },

  // Get recent changes across all entities
  getRecentChanges: async (limit = 100) => {
    return await db
      .select({
        id: changeHistory.id,
        entityType: changeHistory.entityType,
        entityId: changeHistory.entityId,
        action: changeHistory.action,
        timestamp: changeHistory.timestamp,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(changeHistory)
      .leftJoin(users, eq(changeHistory.userId, users.id))
      .orderBy(changeHistory.timestamp)
      .limit(limit);
  },
}; 