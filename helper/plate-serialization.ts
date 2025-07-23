import { type Value } from 'platejs';
import { createSlateEditor, serializeHtml } from 'platejs';

import { EditorKit } from '@/components/editor/editor-kit';
import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { EditorStatic } from '@/components/ui/editor-static';

/**
 * Helper function to create DOM element from HTML string
 */
const getEditorDOMFromHtmlString = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

/**
 * Convert HTML string to Plate value using PlateJS deserialization
 * @param html - HTML string to convert
 * @returns PlateJS Value array
 */
export const htmlToPlateValue = (html: string): Value => {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  try {
    // Create a temporary editor for HTML deserialization using EditorKit
    const tempEditor = createSlateEditor({
      plugins: EditorKit.filter(plugin => plugin.key !== 'floating-toolbar'),
      value: [],
    });

    // Parse HTML into DOM element
    const editorNode = getEditorDOMFromHtmlString(html);

    // Use editor's HTML API to deserialize
    const nodes = tempEditor.api.html.deserialize({ element: editorNode });

    // Ensure we have valid nodes
    if (Array.isArray(nodes) && nodes.length > 0) {
      return nodes as Value;
    }

    return [{ type: 'p', children: [{ text: '' }] }];
  } catch (error) {
    console.warn('Failed to parse HTML:', error);
    // Fallback to simple text extraction
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return [{ type: 'p', children: [{ text: tempDiv.textContent || '' }] }];
    } catch {
      return [{ type: 'p', children: [{ text: '' }] }];
    }
  }
};

/**
 * Convert Plate value to HTML string using official PlateJS serializeHtml
 * @param value - PlateJS Value array to convert
 * @returns Promise<string> - HTML string
 */
export const plateValueToHtml = async (value: Value): Promise<string> => {
  try {
    // Create a static editor for HTML serialization using BaseEditorKit
    const editorStatic = createSlateEditor({
      plugins: BaseEditorKit,
      value,
    });

    // Use official PlateJS HTML serialization with static components
    const html = await serializeHtml(editorStatic, {
      editorComponent: EditorStatic,
      props: { variant: 'select' },
    });

    return html;
  } catch (error) {
    console.warn('Failed to serialize to HTML:', error);
    // Fallback to simple text extraction
    return value
      .map(node => {
        const text =
          node.children?.map((child: any) => child.text || '').join('') || '';
        return text ? `<p>${text}</p>` : '<p><br></p>';
      })
      .join('');
  }
};
