import { type Value } from 'platejs';
import { htmlToPlateValue } from '@/helper/plate-serialization';

/**
 * Parse JSON content to Plate value
 * @param content - JSON string content from database
 * @returns Plate Value array
 */
export const parseJsonContent = (content: string): Value => {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [{ type: 'p', children: [{ text: '' }] }];
  } catch {
    // If parsing fails, it might be HTML content that needs conversion
    // Try to convert HTML to Plate value as fallback
    try {
      return htmlToPlateValue(content);
    } catch (htmlError) {
      console.warn('Failed to parse content as JSON or HTML, returning empty paragraph:', content.substring(0, 100));
      return [{ type: 'p', children: [{ text: '' }] }];
    }
  }
};

/**
 * Check if content is already in JSON format
 * @param content - Content string to check
 * @returns true if content is valid JSON array
 */
export const isJsonContent = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}; 