'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { createSlateEditor, serializeHtml } from 'platejs';

import { EditorKit } from '@/components/editor/editor-kit';
import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { EditorStatic } from '@/components/ui/editor-static';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { cn } from '@/lib/utils';

// Available toolbar tool categories
export type ToolbarTools = {
  ai?: boolean;
  basicMarks?: boolean; // bold, italic, underline, strikethrough, code
  textColor?: boolean;
  alignment?: boolean;
  lists?: boolean; // numbered, bulleted, todo
  links?: boolean;
  media?: boolean; // images, videos, audio, files
  tables?: boolean;
  formatting?: boolean; // headings, blockquote
  advanced?: boolean; // math, columns, toggles
  history?: boolean; // undo, redo
  exportImport?: boolean;
};

export interface PlateRichTextEditorProps {
  defaultValue?: string;
  onTextChange?: (content: string, editor: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  id?: string;
  enabledTools?: ToolbarTools;
  variant?: 'default' | 'select' | 'demo';
}

export interface PlateEditorRef {
  getEditor: () => any | null;
  getHtml: () => Promise<string>;
  setHtml: (html: string) => void;
}

// Helper function to create DOM element from HTML string
const getEditorDOMFromHtmlString = (html: string): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

// Convert HTML string to Plate value using PlateJS deserialization
const htmlToValue = (html: string): Value => {
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

// Convert Plate value to HTML string using official PlateJS serializeHtml
const valueToHtml = async (value: Value): Promise<string> => {
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

// Default enabled tools
const DEFAULT_TOOLS: ToolbarTools = {
  ai: true,
  basicMarks: true,
  textColor: true,
  alignment: true,
  lists: true,
  links: true,
  media: false,
  tables: true,
  formatting: true,
  advanced: false,
  history: true,
  exportImport: false,
};

// Read-only component - simple HTML display
const PlateRichTextViewer = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  ({ defaultValue = '', className, id }, ref) => {
    // Expose methods via ref for compatibility
    React.useImperativeHandle(ref, () => ({
      getEditor: () => null,
      getHtml: async () => defaultValue,
      setHtml: () => {
        console.warn('Cannot set HTML in read-only mode');
      },
    }));

    return (
      <div 
        className={cn('min-h-[200px] bg-gray-100 border p-3 rounded-md prose prose-sm max-w-none', className)} 
        id={id}
        dangerouslySetInnerHTML={{ __html: defaultValue || '' }}
      />
    );
  }
);

PlateRichTextViewer.displayName = 'PlateRichTextViewer';

// Edit component - full PlateJS editor
const PlateRichTextEditorEdit = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  ({
    defaultValue = '',
    onTextChange,
    placeholder = 'Type your amazing content here...',
    className,
    id,
    variant = 'select',
  }, ref) => {
    // Initialize value from defaultValue
    const initialValue = useMemo(() => htmlToValue(defaultValue), [defaultValue]);

    // Create plugin list - filter out floating toolbar
    const plugins = useMemo(() => {
      return EditorKit.filter(plugin => plugin.key !== 'floating-toolbar');
    }, []);

    // Create editor
    const editor = usePlateEditor({
      plugins,
      value: initialValue,
    });

    // Update editor content when defaultValue changes
    useEffect(() => {
      if (editor && defaultValue !== undefined) {
        const newValue = htmlToValue(defaultValue);
        // Update content directly without HTML comparison to avoid async complexity
        editor.tf.setValue(newValue);
      }
    }, [defaultValue, editor]);

    // Handle editor changes
    const handleChange = useCallback(async ({ value: newValue }: { value: Value }) => {
      if (onTextChange) {
        const html = await valueToHtml(newValue);
        // Create a mock editor object that matches Quill's interface
        const mockEditor = {
          root: {
            innerHTML: html
          }
        };
        onTextChange(html, mockEditor);
      }
    }, [onTextChange]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getHtml: async () => await valueToHtml(editor.children),
      setHtml: (html: string) => {
        const newValue = htmlToValue(html);
        editor.tf.setValue(newValue);
      },
    }));

    return (
      <div className={cn('min-h-[100px]', className)} id={id}>
        <Plate 
          editor={editor} 
          onChange={handleChange}
        >
          <EditorContainer variant={variant}>
            <Editor 
              placeholder={placeholder} 
              variant={variant}
            />
          </EditorContainer>
        </Plate>
      </div>
    );
  }
);

PlateRichTextEditorEdit.displayName = 'PlateRichTextEditorEdit';

// Main component - conditional rendering of separate components
const PlateRichTextEditor = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  (props, ref) => {
    if (props.readOnly) {
      return <PlateRichTextViewer {...props} ref={ref} />;
    }
    
    return <PlateRichTextEditorEdit {...props} ref={ref} />;
  }
);

PlateRichTextEditor.displayName = 'PlateRichTextEditor';

export default PlateRichTextEditor; 