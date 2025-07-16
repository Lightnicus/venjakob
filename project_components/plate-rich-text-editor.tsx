'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
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
  getHtml: () => string;
  setHtml: (html: string) => void;
}

// Convert HTML string to Plate value
const htmlToValue = (html: string): Value => {
  if (!html || html.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  
  try {
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // For now, convert to simple paragraph structure
    // This can be enhanced with proper HTML deserialization later
    return [{ type: 'p', children: [{ text: tempDiv.textContent || '' }] }];
  } catch (error) {
    console.warn('Failed to parse HTML:', error);
    return [{ type: 'p', children: [{ text: '' }] }];
  }
};

// Convert Plate value to HTML string
const valueToHtml = (value: Value): string => {
  try {
    // Simple conversion for now - can be enhanced with proper HTML serialization
    return value.map(node => {
      if (node.type === 'p') {
        const text = node.children?.map((child: any) => child.text || '').join('') || '';
        return `<p>${text}</p>`;
      }
      return '';
    }).join('');
  } catch (error) {
    console.warn('Failed to serialize to HTML:', error);
    return '';
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
      getHtml: () => defaultValue,
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
        // Only update if content is actually different to avoid unnecessary re-renders
        const currentHtml = valueToHtml(editor.children);
        const newHtml = valueToHtml(newValue);
        if (currentHtml !== newHtml) {
          editor.tf.setValue(newValue);
        }
      }
    }, [defaultValue, editor]);

    // Handle editor changes
    const handleChange = useCallback(({ value: newValue }: { value: Value }) => {
      if (onTextChange) {
        const html = valueToHtml(newValue);
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
      getHtml: () => valueToHtml(editor.children),
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