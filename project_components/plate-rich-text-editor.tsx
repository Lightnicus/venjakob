'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { cn } from '@/lib/utils';
import { htmlToPlateValue, plateValueToHtml } from '@/helper/plate-serialization';

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
  value?: Value;
  onTextChange?: (content: string, editor: any) => void;
  onValueChange?: (value: Value) => void;
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
  ({ value = [{ type: 'p', children: [{ text: '' }] }], className, id }, ref) => {
    const [html, setHtml] = React.useState('');

    // Convert value to HTML for display
    useEffect(() => {
      plateValueToHtml(value).then(setHtml);
    }, [value]);

    // Expose methods via ref for compatibility
    React.useImperativeHandle(ref, () => ({
      getEditor: () => null,
      getHtml: async () => await plateValueToHtml(value),
      setHtml: () => {
        console.warn('Cannot set HTML in read-only mode');
      },
    }));

    return (
      <div 
        className={cn('min-h-[200px] bg-gray-100 border p-3 rounded-md prose prose-sm max-w-none', className)} 
        id={id}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

PlateRichTextViewer.displayName = 'PlateRichTextViewer';

// Edit component - full PlateJS editor
const PlateRichTextEditorEdit = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  ({
    value = [{ type: 'p', children: [{ text: '' }] }],
    onTextChange,
    onValueChange,
    placeholder = 'Type your amazing content here...',
    className,
    id,
    variant = 'select',
  }, ref) => {
    // Create plugin list - filter out floating toolbar
    const plugins = useMemo(() => {
      return EditorKit.filter(plugin => plugin.key !== 'floating-toolbar');
    }, []);

    // Create editor
    const editor = usePlateEditor({
      plugins,
      value,
    });

    // Handle editor changes
    const handleChange = useCallback(async ({ value: newValue }: { value: Value }) => {
      // Call onValueChange first (preferred, no conversion needed)
      if (onValueChange) {
        onValueChange(newValue);
      }
      
      // Keep onTextChange for backward compatibility
      if (onTextChange) {
        const html = await plateValueToHtml(newValue);
        // Create a mock editor object that matches Quill's interface
        const mockEditor = {
          root: {
            innerHTML: html
          }
        };
        onTextChange(html, mockEditor);
      }
    }, [onTextChange, onValueChange]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      getHtml: async () => await plateValueToHtml(editor.children),
      setHtml: (html: string) => {
        const newValue = htmlToPlateValue(html);
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

// Export helper functions for parent components
export { htmlToPlateValue, plateValueToHtml } from '@/helper/plate-serialization';

export default PlateRichTextEditor; 