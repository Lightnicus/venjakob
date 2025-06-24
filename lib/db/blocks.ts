import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import { blocks, blockContent, languages, type Block, type BlockContent, type Language } from './schema';
import { getCurrentUser } from '@/lib/auth/server';

// Common error type for edit lock conflicts
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly blockId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: Date | null = null
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}

export type BlockWithContent = Block & {
  blockContents: BlockContent[];
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
      block.blocked
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
    const allBlocks = await db.select().from(blocks).orderBy(blocks.position, blocks.name);
    
    // Fetch all block content
    const allBlockContent = await db.select().from(blockContent);
    
    // Join the data
    const blocksWithContent: BlockWithContent[] = allBlocks.map(block => ({
      ...block,
      blockContents: allBlockContent.filter(content => content.blockId === block.id)
    }));
    
    return blocksWithContent;
  } catch (error) {
    console.error('Error fetching blocks with content:', error);
    throw new Error('Failed to fetch blocks');
  }
}

// Get a single block with content
export async function getBlockWithContent(blockId: string): Promise<BlockWithContent | null> {
  try {
    const [block] = await db.select().from(blocks).where(eq(blocks.id, blockId));
    if (!block) return null;
    
    const content = await db.select().from(blockContent).where(eq(blockContent.blockId, blockId));
    
    return {
      ...block,
      blockContents: content
    };
  } catch (error) {
    console.error('Error fetching block:', error);
    throw new Error('Failed to fetch block');
  }
}

// Save block content (create or update)
export async function saveBlockContent(
  blockId: string, 
  blockContents: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);
    
    // Delete existing content for this block
    await db.delete(blockContent).where(eq(blockContent.blockId, blockId));
    
    // Insert new content
    if (blockContents.length > 0) {
      await db.insert(blockContent).values(blockContents);
    }
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving block content:', error);
    throw new Error('Failed to save block content');
  }
}

// Save block properties
export async function saveBlockProperties(
  blockId: string, 
  blockData: Partial<Block>
): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);
    
    await db.update(blocks)
      .set({ ...blockData, updatedAt: new Date() })
      .where(eq(blocks.id, blockId));
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving block properties:', error);
    throw new Error('Failed to save block properties');
  }
}

// Create a new block
export async function createBlock(): Promise<BlockWithContent> {
  try {
    // Create new block with position set to null since standard defaults to false
    const [newBlock] = await db.insert(blocks).values({
      name: 'Neuer Block',
      standard: false,
      mandatory: false,
      position: null, // Position is null when standard is false
      hideTitle: false,
      pageBreakAbove: false,
    }).returning();
    
    return {
      ...newBlock,
      blockContents: []
    };
  } catch (error) {
    console.error('Error creating block:', error);
    throw new Error('Failed to create block');
  }
}

// Copy a block
export async function copyBlock(originalBlockId: string): Promise<BlockWithContent> {
  try {
    // Get the original block with content
    const originalBlock = await getBlockWithContent(originalBlockId);
    if (!originalBlock) {
      throw new Error('Original block not found');
    }
    
    // Get position for the copy - only if the original is standard
    let copyPosition = null;
    if (originalBlock.standard) {
      const maxPositionResult = await db.select({ maxPosition: blocks.position })
        .from(blocks)
        .orderBy(desc(blocks.position))
        .limit(1);
      
      copyPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;
    }
    
    // Create new block with "(Kopie)" appended to the name
    const [newBlock] = await db.insert(blocks).values({
      name: `${originalBlock.name} (Kopie)`,
      standard: originalBlock.standard,
      mandatory: originalBlock.mandatory,
      position: copyPosition,
      hideTitle: originalBlock.hideTitle,
      pageBreakAbove: originalBlock.pageBreakAbove,
    }).returning();
    
    // Copy all block contents (without modifying titles)
    const copiedContents = [];
    if (originalBlock.blockContents.length > 0) {
      const contentToInsert = originalBlock.blockContents.map(content => ({
        blockId: newBlock.id,
        articleId: content.articleId,
        title: content.title,
        content: content.content,
        languageId: content.languageId,
      }));
      
      const insertedContents = await db.insert(blockContent).values(contentToInsert).returning();
      copiedContents.push(...insertedContents);
    }
    
    return {
      ...newBlock,
      blockContents: copiedContents
    };
  } catch (error) {
    console.error('Error copying block:', error);
    throw new Error('Failed to copy block');
  }
}

// Delete a block and its content
export async function deleteBlock(blockId: string): Promise<void> {
  try {
    // Check if block is editable by current user
    await checkBlockEditable(blockId);
    
    // Delete block content first (foreign key constraint)
    await db.delete(blockContent).where(eq(blockContent.blockId, blockId));
    
    // Delete the block
    await db.delete(blocks).where(eq(blocks.id, blockId));
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error deleting block:', error);
    throw new Error('Failed to delete block');
  }
}

// Fetch minimal block list data
export async function getBlockList(): Promise<{
  id: string;
  name: string;
  standard: boolean;
  mandatory: boolean;
  position: number | null;
  firstContentTitle: string | null;
  languages: string;
  lastModified: string;
}[]> {
  try {
    // Fetch all blocks
    const allBlocks = await db.select().from(blocks).orderBy(blocks.position, blocks.name);
    
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
      const blockContents = allBlockContent.filter(content => content.blockId === block.id);
      
      // Get content title from default language, or empty string if not found
      let firstContentTitle = '';
      if (defaultLanguage) {
        const defaultContent = blockContents.find(content => content.languageId === defaultLanguage.id);
        if (defaultContent) {
          firstContentTitle = defaultContent.title;
        }
      }
      
      // Get languages for this block
      const blockLanguages = blockContents.map(bc => {
        const lang = allLanguages.find(l => l.id === bc.languageId);
        return lang;
      }).filter(lang => lang !== undefined);
      
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
          new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
        );
        lastModified = latestUpdate.updatedAt.toISOString();
      }
      
      return {
        id: block.id,
        name: block.name,
        standard: block.standard,
        mandatory: block.mandatory,
        position: block.position,
        firstContentTitle,
        languages: languagesString,
        lastModified
      };
    });
    
    return blockList;
  } catch (error) {
    console.error('Error fetching block list:', error);
    throw new Error('Failed to fetch block list');
  }
} 