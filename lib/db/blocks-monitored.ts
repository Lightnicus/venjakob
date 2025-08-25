import { withQueryMonitoring } from '@/lib/performance/performance-monitor';
import {
  getBlocksWithContent as originalGetBlocksWithContent,
  getBlocksWithContentByLanguage as originalGetBlocksWithContentByLanguage,
  createBlock as originalCreateBlock,
  saveBlockProperties as originalSaveBlockProperties,
  deleteBlock as originalDeleteBlock,
  saveBlockContent as originalSaveBlockContent,
  getBlockWithContent as originalGetBlockWithContent,
  copyBlock as originalCopyBlock,
  getBlockList as originalGetBlockList,
  getLanguages as originalGetLanguages,
  getDefaultLanguage as originalGetDefaultLanguage,
  type BlockWithContent,
} from './blocks';
import { type Block, type BlockContent } from './schema';
import { type Language } from './schema';

// Monitored database functions using withQueryMonitoring HOF
export const getBlocksWithContent = withQueryMonitoring(
  originalGetBlocksWithContent,
  'getBlocksWithContent'
);

// Manual monitoring for getBlocksWithContentByLanguage since it takes arguments
export const getBlocksWithContentByLanguage = async (languageId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalGetBlocksWithContentByLanguage(languageId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getBlocksWithContentByLanguage_${languageId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getBlocksWithContentByLanguage_${languageId}`, duration);
    throw error;
  }
};

export const createBlock = withQueryMonitoring(
  originalCreateBlock,
  'createBlock'
);

// Manual monitoring for getBlockWithContent since it takes arguments
export const getBlockWithContent = async (blockId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalGetBlockWithContent(blockId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getBlockWithContent_${blockId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getBlockWithContent_${blockId}`, duration);
    throw error;
  }
};

// Manual monitoring for copyBlock since it takes arguments
export const copyBlock = async (originalBlockId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalCopyBlock(originalBlockId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`copyBlock_${originalBlockId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`copyBlock_${originalBlockId}`, duration);
    throw error;
  }
};

export const getBlockList = withQueryMonitoring(
  originalGetBlockList,
  'getBlockList'
);

export const getLanguages = withQueryMonitoring(
  originalGetLanguages,
  'getLanguages'
);

export const getDefaultLanguage = withQueryMonitoring(
  originalGetDefaultLanguage,
  'getDefaultLanguage'
);

// Manual monitoring for functions with arguments
import { performanceMonitor } from '@/lib/performance/performance-monitor';

export const saveBlockProperties = async (blockId: string, data: any): Promise<void> => {
  const startTime = performance.now();
  try {
    const result = await originalSaveBlockProperties(blockId, data);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveBlockProperties_${blockId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveBlockProperties_${blockId}`, duration);
    throw error;
  }
};

export const saveBlockContent = async (blockId: string, data: any): Promise<void> => {
  const startTime = performance.now();
  try {
    const result = await originalSaveBlockContent(blockId, data);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveBlockContent_${blockId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveBlockContent_${blockId}`, duration);
    throw error;
  }
};

export const deleteBlock = async (blockId: string): Promise<void> => {
  const startTime = performance.now();
  try {
    const result = await originalDeleteBlock(blockId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`deleteBlock_${blockId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`deleteBlock_${blockId}`, duration);
    throw error;
  }
};

// Re-export types and error classes
export type { BlockWithContent, Block, BlockContent, Language };
export { EditLockError } from './blocks';
