import { eq, desc, sql, and, inArray, or } from 'drizzle-orm';
import { db } from './index';
import {
  blocks,
  blockContent,
  languages,
  type Block,
  type BlockContent,
  type Language,
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';
import { auditedBlockOperations, auditedBlockContentOperations, auditQueries, ENTITY_TYPES } from './audit';
import { changeHistory, users } from './schema';

// Common error type for edit lock conflicts
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly blockId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null,
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}

export type BlockWithContent = Block & {
  blockContents: BlockContent[];
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
    changeType: 'block' | 'content';
  } | null;
};

// Check if a block is editable by the current user
async function checkBlockEditable(blockId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', blockId);
  }

  // Get block with lock info
  const [block] = await db
    .select({
      id: blocks.id,
      blocked: blocks.blocked,
      blockedBy: blocks.blockedBy,
    })
    .from(blocks)
    .where(eq(blocks.id, blockId));

  if (!block) {
    throw new Error('Block nicht gefunden');
  }

  // Check if block is locked by another user
  if (block.blocked && block.blockedBy && block.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      'Block wird bereits von einem anderen Benutzer bearbeitet',
      blockId,
      block.blockedBy,
      block.blocked,
    );
  }
}

// Fetch all languages
export async function getLanguages(): Promise<Language[]> {
  try {
    return await db.select().from(languages).orderBy(languages.label);
  } catch (error) {
    console.error('Error fetching languages:', error);
    throw new Error('Failed to fetch languages');
  }
}

// Fetch all blocks with their content
export async function getBlocksWithContent(): Promise<BlockWithContent[]> {
  try {
    // Fetch all blocks
    const allBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.deleted, false))
      .orderBy(blocks.position, blocks.name);

    // Fetch all block content
    const allBlockContent = await db.select().from(blockContent).where(eq(blockContent.deleted, false));

    // Join the data
    const blocksWithContent: BlockWithContent[] = allBlocks.map(block => ({
      ...block,
      blockContents: allBlockContent.filter(
        content => content.blockId === block.id,
      ),
    }));

    return blocksWithContent;
  } catch (error) {
    console.error('Error fetching blocks with content:', error);
    throw new Error('Failed to fetch blocks');
  }
}

// Get a single block with content
export async function getBlockWithContent(
  blockId: string,
): Promise<BlockWithContent | null> {
  try {
    const [block] = await db
      .select()
      .from(blocks)
      .where(and(eq(blocks.id, blockId), eq(blocks.deleted, false)));
    if (!block) return null;

    const content = await db
      .select()
      .from(blockContent)
      .where(and(eq(blockContent.blockId, blockId), eq(blockContent.deleted, false)));

    // Find the most recent change (block itself or its content)
    let lastChangedBy = null;
    
    // Get all content IDs for this block
    const contentIds = content.map(c => c.id);
    
    // Build the where clause - if no content, only check block changes
    let whereClause;
    if (contentIds.length > 0) {
      whereClause = or(
        and(
          eq(changeHistory.entityType, 'blocks'),
          eq(changeHistory.entityId, blockId)
        ),
        and(
          eq(changeHistory.entityType, 'block_content'),
          inArray(changeHistory.entityId, contentIds)
        )
      );
    } else {
      whereClause = and(
        eq(changeHistory.entityType, 'blocks'),
        eq(changeHistory.entityId, blockId)
      );
    }
    
    // Query for the most recent change to either the block or its content
    const recentChanges = await db
      .select({
        timestamp: changeHistory.timestamp,
        entityType: changeHistory.entityType,
        userId: changeHistory.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(changeHistory)
      .leftJoin(users, eq(changeHistory.userId, users.id))
      .where(whereClause)
      .orderBy(desc(changeHistory.timestamp))
      .limit(1);

    if (recentChanges.length > 0) {
      const recentChange = recentChanges[0];
      lastChangedBy = {
        id: recentChange.userId,
        name: recentChange.userName,
        email: recentChange.userEmail || '',
        timestamp: recentChange.timestamp,
        changeType: recentChange.entityType === 'blocks' ? 'block' as const : 'content' as const
      };
    }

    return {
      ...block,
      blockContents: content,
      lastChangedBy,
    };
  } catch (error) {
    console.error('Error fetching block:', error);
    throw new Error('Failed to fetch block');
  }
}

// Save block content (create or update) with audit
export async function saveBlockContent(
  blockId: string,
  blockContents: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[],
): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Use audited bulk replacement operation
    await auditedBlockContentOperations.replaceAll(
      'blocks',
      blockId,
      blockContents,
      user.dbUser.id,
      {
        source: 'block-content-management',
        reason: 'Block-Inhalt aktualisiert'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving block content:', error);
    throw new Error('Failed to save block content');
  }
}

// Save block properties with audit
export async function saveBlockProperties(
  blockId: string,
  blockData: Partial<Block>,
): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await auditedBlockOperations.update(
      blockId,
      blockData,
      user.dbUser.id,
      {
        source: 'block-management',
        reason: 'Block-Eigenschaften aktualisiert'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving block properties:', error);
    throw new Error('Failed to save block properties');
  }
}

// Create a new block with audit
export async function createBlock(): Promise<BlockWithContent> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Create new block with position set to null since standard defaults to false
    const newBlock = await auditedBlockOperations.create(
      {
        name: 'Neuer Block',
        standard: false,
        mandatory: false,
        position: null, // Position is null when standard is false
        hideTitle: false,
        pageBreakAbove: false,
      },
      user.dbUser.id,
      {
        source: 'block-management',
        reason: 'Neuer Block erstellt'
      }
    );

    return {
      ...newBlock,
      blockContents: [],
    };
  } catch (error) {
    console.error('Error creating block:', error);
    throw new Error('Failed to create block');
  }
}

// Copy a block with audit
export async function copyBlock(
  originalBlockId: string,
): Promise<BlockWithContent> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the original block with content
    const originalBlock = await getBlockWithContent(originalBlockId);
    if (!originalBlock) {
      throw new Error('Original block not found');
    }

    // Use transaction to copy block and related data atomically
    const result = await db.transaction(async (tx) => {
      // Get position for the copy - only if the original is standard
      let copyPosition = null;
      if (originalBlock.standard) {
        const maxPositionResult = await tx
          .select({ maxPosition: blocks.position })
          .from(blocks)
          .orderBy(desc(blocks.position))
          .limit(1);

        copyPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;
      }

      // Create new block with "(Kopie)" appended to the name and audit
      const newBlock = await auditedBlockOperations.create(
        {
          name: `${originalBlock.name} (Kopie)`,
          standard: originalBlock.standard,
          mandatory: originalBlock.mandatory,
          position: copyPosition,
          hideTitle: originalBlock.hideTitle,
          pageBreakAbove: originalBlock.pageBreakAbove,
        },
        user.dbUser.id,
        {
          source: 'block-management',
          reason: `Block kopiert von ${originalBlock.name}`,
          originalBlockId: originalBlockId
        }
      );

      // Copy all block contents (without modifying titles) with audit
      const copiedContents = [];
      if (originalBlock.blockContents.length > 0) {
        for (const content of originalBlock.blockContents) {
          const newContent = await auditedBlockContentOperations.create(
            {
              blockId: newBlock.id,
              articleId: content.articleId,
              title: content.title,
              content: content.content,
              languageId: content.languageId,
            },
            user.dbUser.id,
            {
              source: 'block-copy-operation',
              reason: `Inhalt kopiert von Block ${originalBlock.name}`,
              originalContentId: content.id,
              parentEntityType: 'blocks',
              parentEntityId: newBlock.id,
            }
          );
          copiedContents.push(newContent);
        }
      }

      return {
        ...newBlock,
        blockContents: copiedContents,
      };
    });

    return result;
  } catch (error) {
    console.error('Error copying block:', error);
    throw new Error('Failed to copy block');
  }
}

// Delete a block and its content with audit
export async function deleteBlock(blockId: string): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get all content pieces for this block first for audit purposes
    const contentPieces = await db
      .select()
      .from(blockContent)
      .where(eq(blockContent.blockId, blockId));

    // Delete each content piece with audit (done sequentially to avoid lock issues)
    for (const content of contentPieces) {
      await auditedBlockContentOperations.delete(
        content.id,
        user.dbUser.id,
        {
          source: 'block-deletion',
          reason: 'Block-Inhalt gelöscht (Block wird gelöscht)',
          parentEntityType: 'blocks',
          parentEntityId: blockId,
        }
      );
    }

    // Then delete the block with audit
    await auditedBlockOperations.delete(
      blockId,
      user.dbUser.id,
      {
        source: 'block-management',
        reason: 'Block gelöscht'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error deleting block:', error);
    throw new Error('Failed to delete block');
  }
}

// Fetch minimal block list data
export async function getBlockList(): Promise<
  {
    id: string;
    name: string;
    standard: boolean;
    mandatory: boolean;
    position: number | null;
    firstContentTitle: string | null;
    languages: string;
    lastModified: string;
  }[]
> {
  try {
    // Fetch all blocks
    const allBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.deleted, false))
      .orderBy(blocks.position, blocks.name);

    // Fetch all block content with language info
    const allBlockContent = await db
      .select({
        blockId: blockContent.blockId,
        title: blockContent.title,
        updatedAt: blockContent.updatedAt,
        languageId: blockContent.languageId,
      })
      .from(blockContent);

    // Fetch all languages
    const allLanguages = await db.select().from(languages);

    // Find the default language
    const defaultLanguage = allLanguages.find(lang => lang.default);

    // Process the data
    const blockList = allBlocks.map(block => {
      const blockContents = allBlockContent.filter(
        content => content.blockId === block.id,
      );

      // Get content title from default language, or empty string if not found
      let firstContentTitle = '';
      if (defaultLanguage) {
        const defaultContent = blockContents.find(
          content => content.languageId === defaultLanguage.id,
        );
        if (defaultContent) {
          firstContentTitle = defaultContent.title;
        }
      }

      // Get languages for this block
      const blockLanguages = blockContents
        .map(bc => {
          const lang = allLanguages.find(l => l.id === bc.languageId);
          return lang;
        })
        .filter(lang => lang !== undefined);

      // Sort languages: default first, then alphabetically by label
      const sortedLanguages = blockLanguages.sort((a, b) => {
        // If one is default and the other is not, default comes first
        if (a.default && !b.default) return -1;
        if (!a.default && b.default) return 1;
        // If both are default or both are not default, sort alphabetically
        return a.label.localeCompare(b.label);
      });

      const languageLabels = sortedLanguages.map(lang => lang.label);
      const languagesString = languageLabels.join(', ') || 'Keine Sprachen';

      // Get last modified date
      let lastModified = 'Nie';
      if (blockContents.length > 0) {
        const latestUpdate = blockContents.reduce((latest, current) =>
          new Date(current.updatedAt) > new Date(latest.updatedAt)
            ? current
            : latest,
        );
        lastModified = latestUpdate.updatedAt;
      }

      return {
        id: block.id,
        name: block.name,
        standard: block.standard,
        mandatory: block.mandatory,
        position: block.position,
        firstContentTitle,
        languages: languagesString,
        lastModified,
      };
    });

    return blockList;
  } catch (error) {
    console.error('Error fetching block list:', error);
    throw new Error('Failed to fetch block list');
  }
}

// Get change history for a specific block
export async function getBlockChangeHistory(blockId: string, limit = 50) {
  try {
    return await auditQueries.getEntityHistory(ENTITY_TYPES.BLOCKS, blockId, limit);
  } catch (error) {
    console.error('Error fetching block change history:', error);
    throw new Error('Failed to fetch block change history');
  }
}

// Get change history for block content (blockContent where blockId is set)
export async function getBlockContentChangeHistory(blockId: string, limit = 50) {
  try {
    // Get all content IDs for this block first
    const blockContentRecords = await db
      .select({ id: blockContent.id })
      .from(blockContent)
      .where(eq(blockContent.blockId, blockId));

    // Get change history for all content pieces
    const allHistory = [];
    for (const content of blockContentRecords) {
      const contentHistory = await auditQueries.getEntityHistory(ENTITY_TYPES.BLOCK_CONTENT, content.id, limit);
      allHistory.push(...contentHistory);
    }

    // Sort by timestamp (most recent first)
    return allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching block content change history:', error);
    throw new Error('Failed to fetch block content change history');
  }
}

// Soft delete a block
export async function softDeleteBlock(blockId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(blocks)
      .set({ deleted: true, updatedAt: sql`NOW()` })
      .where(eq(blocks.id, blockId));

    // TODO: Add audit trail when audit operations are implemented for blocks
  } catch (error) {
    console.error('Error soft deleting block:', error);
    throw new Error('Failed to soft delete block');
  }
}

// Restore a soft deleted block
export async function restoreBlock(blockId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(blocks)
      .set({ deleted: false, updatedAt: sql`NOW()` })
      .where(eq(blocks.id, blockId));

    // TODO: Add audit trail when audit operations are implemented for blocks
  } catch (error) {
    console.error('Error restoring block:', error);
    throw new Error('Failed to restore block');
  }
}
