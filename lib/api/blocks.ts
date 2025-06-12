import type { BlockWithContent } from '@/lib/db/blocks';
import type { Language, Block, BlockContent } from '@/lib/db/schema';

// Fetch all languages
export async function fetchLanguages(): Promise<Language[]> {
  const response = await fetch('/api/languages');
  if (!response.ok) {
    throw new Error('Failed to fetch languages');
  }
  return response.json();
}

// Fetch all blocks with content
export async function fetchBlocksWithContent(): Promise<BlockWithContent[]> {
  const response = await fetch('/api/blocks');
  if (!response.ok) {
    throw new Error('Failed to fetch blocks');
  }
  return response.json();
}

// Create a new block
export async function createNewBlock(): Promise<BlockWithContent> {
  const response = await fetch('/api/blocks', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to create block');
  }
  return response.json();
}

// Save block content
export async function saveBlockContentAPI(
  blockId: string,
  blockContents: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'content',
      data: blockContents,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to save block content');
  }
}

// Save block properties
export async function saveBlockPropertiesAPI(
  blockId: string,
  blockData: Partial<Block>
): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'properties',
      data: blockData,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to save block properties');
  }
}

// Delete a block
export async function deleteBlockAPI(blockId: string): Promise<void> {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete block');
  }
}

// Copy a block
export async function copyBlockAPI(originalBlock: BlockWithContent): Promise<BlockWithContent> {
  const response = await fetch('/api/blocks/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalBlockId: originalBlock.id }),
  });
  if (!response.ok) {
    throw new Error('Failed to copy block');
  }
  return response.json();
} 