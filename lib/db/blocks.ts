import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import { blocks, blockContent, languages, type Block, type BlockContent, type Language } from './schema';

export type BlockWithContent = Block & {
  blockContents: BlockContent[];
};

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
    // Delete existing content for this block
    await db.delete(blockContent).where(eq(blockContent.blockId, blockId));
    
    // Insert new content
    if (blockContents.length > 0) {
      await db.insert(blockContent).values(blockContents);
    }
  } catch (error) {
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
    await db.update(blocks)
      .set({ ...blockData, updatedAt: new Date() })
      .where(eq(blocks.id, blockId));
  } catch (error) {
    console.error('Error saving block properties:', error);
    throw new Error('Failed to save block properties');
  }
}

// Create a new block
export async function createBlock(): Promise<BlockWithContent> {
  try {
    // Get the next position
    const maxPositionResult = await db.select({ maxPosition: blocks.position })
      .from(blocks)
      .orderBy(desc(blocks.position))
      .limit(1);
    
    const nextPosition = (maxPositionResult[0]?.maxPosition || 0) + 1;
    
    // Create new block
    const [newBlock] = await db.insert(blocks).values({
      name: 'Neuer Block',
      standard: false,
      mandatory: false,
      position: nextPosition,
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

// Delete a block and its content
export async function deleteBlock(blockId: string): Promise<void> {
  try {
    // Delete block content first (foreign key constraint)
    await db.delete(blockContent).where(eq(blockContent.blockId, blockId));
    
    // Delete the block
    await db.delete(blocks).where(eq(blocks.id, blockId));
  } catch (error) {
    console.error('Error deleting block:', error);
    throw new Error('Failed to delete block');
  }
} 