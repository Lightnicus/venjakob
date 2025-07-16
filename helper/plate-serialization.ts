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
      value: [] 
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
    return value.map(node => {
      const text = node.children?.map((child: any) => child.text || '').join('') || '';
      return text ? `<p>${text}</p>` : '<p><br></p>';
    }).join('');
  }
};

/**
 * Convert Plate value to HTML string using official PlateJS serializeHtml (synchronous fallback)
 * @param value - PlateJS Value array to convert  
 * @param variant - Editor variant for styling
 * @returns string - HTML string (note: this is a simplified fallback)
 */
export const plateValueToHtmlSync = (value: Value, variant: 'default' | 'select' | 'demo' = 'select'): string => {
  try {
    // This is a simplified synchronous fallback - for full features use plateValueToHtml
    return value.map(node => {
      if (node.type === 'p') {
        const text = node.children?.map((child: any) => {
          let nodeText = child.text || '';
          // Apply basic formatting
          if (child.bold) nodeText = `<strong>${nodeText}</strong>`;
          if (child.italic) nodeText = `<em>${nodeText}</em>`;
          if (child.underline) nodeText = `<u>${nodeText}</u>`;
          if (child.strikethrough) nodeText = `<s>${nodeText}</s>`;
          if (child.code) nodeText = `<code>${nodeText}</code>`;
          return nodeText;
        }).join('') || '';
        return text ? `<p>${text}</p>` : '<p><br></p>';
      }
      if (node.type === 'h1') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        return `<h1>${text}</h1>`;
      }
      if (node.type === 'h2') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        return `<h2>${text}</h2>`;
      }
      if (node.type === 'h3') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        return `<h3>${text}</h3>`;
      }
      if (node.type === 'blockquote') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        return `<blockquote><p>${text}</p></blockquote>`;
      }
      if (node.type === 'ul' || node.type === 'ol') {
        const listItems = node.children?.map((listItem: any) => {
          const itemText = listItem.children?.map((child: any) => child.text || '').join('') || '';
          return `<li>${itemText}</li>`;
        }).join('') || '';
        return node.type === 'ul' ? `<ul>${listItems}</ul>` : `<ol>${listItems}</ol>`;
      }
      // Fallback for unknown node types
      const text = node.children?.map((child: any) => child.text || '').join('') || '';
      return text ? `<p>${text}</p>` : '<p><br></p>';
    }).join('');
  } catch (error) {
    console.warn('Failed to serialize HTML synchronously:', error);
    // Ultimate fallback to simple text extraction
    return value.map(node => {
      const text = node.children?.map((child: any) => child.text || '').join('') || '';
      return text ? `<p>${text}</p>` : '<p><br></p>';
    }).join('');
  }
}; 