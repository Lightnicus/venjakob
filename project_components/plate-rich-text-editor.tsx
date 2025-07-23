'use client';

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { cn } from '@/lib/utils';
import { htmlToPlateValue, plateValueToHtml } from '@/helper/plate-serialization';
import { parseJsonContent } from '@/helper/plate-json-parser';

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
  value?: Value | string; // Accept either Plate Value or JSON string
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

// Helper function to parse value (JSON string or Plate Value)
const parseValue = (value: Value | string | undefined): Value => {
  if (!value) {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  
  if (typeof value === 'string') {
    return parseJsonContent(value);
  }
  
  return value;
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
  ({ value, className, id }, ref) => {
    const [html, setHtml] = React.useState('');
    const parsedValue = useMemo(() => parseValue(value), [value]);

    // Convert value to HTML for display
    useEffect(() => {
      let isMounted = true;
      
      const convertToHtml = async () => {
        try {
          const htmlResult = await plateValueToHtml(parsedValue);
          if (isMounted) {
            setHtml(htmlResult);
          }
        } catch (error) {
          console.error('Error converting to HTML:', error);
          if (isMounted) {
            setHtml('<p>Error loading content</p>');
          }
        }
      };
      
      convertToHtml();
      
      return () => {
        isMounted = false;
      };
    }, [parsedValue]);

    // Expose methods via ref for compatibility
    React.useImperativeHandle(ref, () => ({
      getEditor: () => null,
      getHtml: async () => await plateValueToHtml(parsedValue),
      setHtml: () => {
        console.warn('Cannot set HTML in read-only mode');
      },
    }), [parsedValue]);

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
    value,
    onTextChange,
    onValueChange,
    placeholder = 'Type your amazing content here...',
    className,
    id,
    variant = 'select',
  }, ref) => {
    const parsedValue = useMemo(() => parseValue(value), [value]);
    const editorRef = useRef<any>(null);
    const isMountedRef = useRef(true);
    
    // Create plugin list - filter out floating toolbar and dnd to prevent conflicts
    const plugins = useMemo(() => {
      return EditorKit.filter(plugin => 
        plugin.key !== 'floating-toolbar' && 
        plugin.key !== 'dnd' // Disable drag-and-drop to prevent HTML5 backend conflicts
      );
    }, []);

    // Create editor
    const editor = usePlateEditor({
      plugins,
      value: parsedValue,
    });

    // Store editor reference
    useEffect(() => {
      editorRef.current = editor;
      isMountedRef.current = true;
      
      return () => {
        isMountedRef.current = false;
      };
    }, [editor]);

    // Handle editor changes with debouncing
    const handleChange = useCallback(async ({ value: newValue }: { value: Value }) => {
      if (!isMountedRef.current) return;
      
      // Call onValueChange first (preferred, no conversion needed)
      if (onValueChange) {
        onValueChange(newValue);
      }
      
      // Keep onTextChange for backward compatibility
      if (onTextChange) {
        try {
          const html = await plateValueToHtml(newValue);
          // Create a mock editor object that matches Quill's interface
          const mockEditor = {
            root: {
              innerHTML: html
            }
          };
          onTextChange(html, mockEditor);
        } catch (error) {
          console.error('Error converting to HTML:', error);
        }
      }
    }, [onTextChange, onValueChange]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      getEditor: () => editorRef.current,
      getHtml: async () => {
        if (editorRef.current) {
          return await plateValueToHtml(editorRef.current.children);
        }
        return '';
      },
      setHtml: (html: string) => {
        if (editorRef.current) {
          const newValue = htmlToPlateValue(html);
          editorRef.current.tf.setValue(newValue);
        }
      },
    }), []);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (editorRef.current) {
          // Clean up editor resources
          try {
            editorRef.current.destroy?.();
          } catch (error) {
            console.warn('Error destroying editor:', error);
          }
        }
      };
    }, []);

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