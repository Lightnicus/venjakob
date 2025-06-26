import { auditedArticleOperations, auditedBlockOperations, auditQueries, ENTITY_TYPES } from './audit';
import { getArticleWithCalculations } from './articles';
import { getBlockWithContent } from './blocks';

// Helper function for error handling
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// Example usage in API routes
export const articleApiExamples = {
  // POST /api/articles - Create new article with audit
  async createArticle(articleData: { number: string; price: string; hideTitle?: boolean }, userId: string) {
    try {
      const newArticle = await auditedArticleOperations.create(
        {
          number: articleData.number,
          price: articleData.price,
          hideTitle: articleData.hideTitle ?? false,
        },
        userId,
        {
          userAgent: 'Mozilla/5.0...',
          ip: '192.168.1.1',
          reason: 'New article creation',
        }
      );
      
      return { success: true, article: newArticle };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // PUT /api/articles/[id] - Update article with audit
  async updateArticle(id: string, updateData: { number?: string; price?: string; hideTitle?: boolean }, userId: string) {
    try {
      const updatedArticle = await auditedArticleOperations.update(
        id,
        updateData,
        userId,
        {
          reason: 'Article properties updated',
          source: 'web-interface',
        }
      );
      
      return { success: true, article: updatedArticle };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // DELETE /api/articles/[id] - Delete article with audit
  async deleteArticle(id: string, userId: string) {
    try {
      const deletedArticle = await auditedArticleOperations.delete(
        id,
        userId,
        {
          reason: 'Article deletion requested by user',
        }
      );
      
      return { success: true, article: deletedArticle };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

// Example usage for blocks
export const blockApiExamples = {
  // POST /api/blocks - Create new block with audit
  async createBlock(blockData: {
    name: string;
    standard: boolean;
    mandatory: boolean;
    position?: number;
    hideTitle: boolean;
    pageBreakAbove: boolean;
  }, userId: string) {
    try {
      const newBlock = await auditedBlockOperations.create(
        blockData,
        userId,
        {
          source: 'block-management-interface',
        }
      );
      
      return { success: true, block: newBlock };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // PUT /api/blocks/[id] - Update block with audit
  async updateBlock(id: string, updateData: Partial<{
    name: string;
    standard: boolean;
    mandatory: boolean;
    position: number;
    hideTitle: boolean;
    pageBreakAbove: boolean;
  }>, userId: string) {
    try {
      const updatedBlock = await auditedBlockOperations.update(
        id,
        updateData,
        userId,
        {
          reason: 'Block configuration updated',
        }
      );
      
      return { success: true, block: updatedBlock };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

// Example queries for change history
export const auditQueryExamples = {
  // Get change history for a specific article
  async getArticleHistory(articleId: string) {
    try {
      const history = await auditQueries.getEntityHistory(ENTITY_TYPES.ARTICLES, articleId);
      return { success: true, history };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // Get all activity by a specific user
  async getUserActivity(userId: string, limit = 20) {
    try {
      const activity = await auditQueries.getUserActivity(userId, limit);
      return { success: true, activity };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // Get recent changes across the system
  async getRecentSystemChanges(limit = 50) {
    try {
      const changes = await auditQueries.getRecentChanges(limit);
      return { success: true, changes };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // Get change history for a specific block
  async getBlockHistory(blockId: string) {
    try {
      const history = await auditQueries.getEntityHistory(ENTITY_TYPES.BLOCKS, blockId);
      return { success: true, history };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

// Example of how the audit data would look
export const auditDataExample = {
  // Example of UPDATE audit log entry
  updateExample: {
    id: 'audit-uuid-123',
    entityType: 'articles',
    entityId: 'article-uuid-456',
    action: 'UPDATE',
    changedFields: {
      price: {
        old: '100.00',
        new: '120.00'
      },
      hideTitle: {
        old: false,
        new: true
      }
    },
    userId: 'user-uuid-789',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip: '192.168.1.100',
      reason: 'Price adjustment for new market conditions'
    }
  },

  // Example of INSERT audit log entry
  insertExample: {
    id: 'audit-uuid-124',
    entityType: 'blocks',
    entityId: 'block-uuid-789',
    action: 'INSERT',
    changedFields: {
      name: 'New Standard Block',
      standard: true,
      mandatory: false,
      position: 5,
      hideTitle: false,
      pageBreakAbove: true
    },
    userId: 'user-uuid-789',
    timestamp: '2024-01-15T10:35:00Z',
    metadata: {
      source: 'block-management-interface'
    }
  },

  // Example of DELETE audit log entry
  deleteExample: {
    id: 'audit-uuid-125',
    entityType: 'articles',
    entityId: 'article-uuid-999',
    action: 'DELETE',
    changedFields: {
      id: 'article-uuid-999',
      number: 'ART-001',
      price: '50.00',
      hideTitle: false,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-14T16:20:00Z'
    },
    userId: 'user-uuid-456',
    timestamp: '2024-01-15T11:00:00Z',
    metadata: {
      reason: 'Article discontinued'
    }
  }
};

// Example 8: Using the enhanced functions with lastChangedBy information
export async function exampleEnhancedEntityQueries() {
  console.log('=== Enhanced Entity Queries with lastChangedBy ===');
  
  try {
    // Get an article with change information
    const articleId = 'some-article-id'; // Replace with actual ID
    const articleWithChanges = await getArticleWithCalculations(articleId);
    
    if (articleWithChanges) {
      console.log('Article:', articleWithChanges.number);
      console.log('Calculations count:', articleWithChanges.calculations.length);
      console.log('Content pieces:', articleWithChanges.content?.length || 0);
      
      if (articleWithChanges.lastChangedBy) {
        console.log('Last changed by:', {
          user: articleWithChanges.lastChangedBy.name || articleWithChanges.lastChangedBy.email,
          timestamp: articleWithChanges.lastChangedBy.timestamp,
          changeType: articleWithChanges.lastChangedBy.changeType, // 'article' or 'content'
        });
      } else {
        console.log('No change history found for this article');
      }
    }

    // Get a block with change information
    const blockId = 'some-block-id'; // Replace with actual ID  
    const blockWithChanges = await getBlockWithContent(blockId);
    
    if (blockWithChanges) {
      console.log('Block:', blockWithChanges.name);
      console.log('Content pieces:', blockWithChanges.blockContents.length);
      
      if (blockWithChanges.lastChangedBy) {
        console.log('Last changed by:', {
          user: blockWithChanges.lastChangedBy.name || blockWithChanges.lastChangedBy.email,
          timestamp: blockWithChanges.lastChangedBy.timestamp,
          changeType: blockWithChanges.lastChangedBy.changeType, // 'block' or 'content'
        });
      } else {
        console.log('No change history found for this block');
      }
    }
    
  } catch (error) {
    console.error('Error in enhanced queries example:', error);
  }
}

/*
The enhanced functions now provide:

1. getArticleWithCalculations() returns:
   - Article properties
   - Calculation items
   - Content pieces (blockContent where articleId is set)
   - lastChangedBy: Information about who made the most recent change to either:
     * The article itself (properties, calculations)
     * Any content piece attached to the article
   
2. getBlockWithContent() returns:
   - Block properties
   - Content pieces (blockContent where blockId is set)
   - lastChangedBy: Information about who made the most recent change to either:
     * The block itself (properties)
     * Any content piece attached to the block

lastChangedBy object contains:
- id: User ID who made the change
- name: User's display name (can be null)
- email: User's email address
- timestamp: When the change was made
- changeType: 'article'/'block' for entity changes, 'content' for content changes

This gives a complete picture of who last touched any part of the entity.
*/ 