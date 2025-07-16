'use client';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Define types locally to avoid direct Quill import at module scope for SSR
type QuillOptions = {
  theme?: string;
  modules?: any;
  placeholder?: string;
  readOnly?: boolean;
  formats?: string[];
};

type Delta = {
  ops?: any[];
  [key: string]: any;
};

// Define Sources type explicitly
type EditorSources = 'user' | 'api' | 'silent';

export interface QuillRichTextEditorProps {
  defaultValue?: string | Delta;
  onTextChange?: (content: string, editor: any) => void;
  onSelectionChange?: (
    range: any,
    oldRange: any,
    source: EditorSources,
    editor: any,
  ) => void;
  placeholder?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  modules?: any;
  formats?: string[];
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export interface QuillEditorRef {
  getQuill: () => any | null;
}

const QuillRichTextEditor = forwardRef<
  QuillEditorRef,
  QuillRichTextEditorProps
>(
  (
    {
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder,
      readOnly = false,
      theme = 'snow',
      modules: customModules,
      formats,
      className,
      style,
      id,
    },
    ref,
  ) => {
    // Use a ref to access the quill instance directly
    const quillRef = useRef<any | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
    }));

    // Initialize Quill once
    useEffect(() => {
      const initializeQuill = async () => {
        if (!containerRef.current || quillRef.current) return;

        try {
          const QuillModule = await import('quill');
          const Quill = QuillModule.default;

          const defaultModulesConfig = {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              [{ align: [] }],
              ['clean'],
            ],
            history: { delay: 2000, maxStack: 500, userOnly: true },
          };

          const options: QuillOptions = {
            theme,
            modules: customModules ?? defaultModulesConfig,
            placeholder,
            readOnly,
            formats,
          };

          // Create Quill instance
          quillRef.current = new Quill(containerRef.current, options);

          // Set initial content if provided
          if (defaultValue) {
            if (typeof defaultValue === 'string') {
              quillRef.current.root.innerHTML = defaultValue;
            } else {
              quillRef.current.setContents(defaultValue);
            }
          }
        } catch (error) {
          console.error('Error initializing Quill:', error);
        }
      };

      initializeQuill();

      // Cleanup function
      return () => {
        if (quillRef.current) {
          quillRef.current = null;
        }
      };
    }, []); // Empty dependency array - initialize only once

    // Handle readOnly changes
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    // Handle content changes
    useEffect(() => {
      if (quillRef.current && defaultValue !== undefined) {
        const currentContent = quillRef.current.root.innerHTML;
        const newContent = typeof defaultValue === 'string' ? defaultValue : '';
        
        if (currentContent !== newContent) {
          if (typeof defaultValue === 'string') {
            quillRef.current.root.innerHTML = defaultValue;
          } else {
            quillRef.current.setContents(defaultValue, 'silent');
          }
        }
      }
    }, [defaultValue]);

    // Handle event listeners
    useEffect(() => {
      const quill = quillRef.current;
      if (!quill) return;

      const textChangeHandler = (delta: Delta, oldDelta: Delta, source: EditorSources) => {
        if (onTextChange && source === 'user') {
          const htmlContent = quill.root.innerHTML;
          onTextChange(htmlContent, quill);
        }
      };

      const selectionChangeHandler = (range: any, oldRange: any, source: EditorSources) => {
        if (onSelectionChange) {
          onSelectionChange(range, oldRange, source, quill);
        }
      };

      quill.on('text-change', textChangeHandler);
      quill.on('selection-change', selectionChangeHandler);

      return () => {
        quill.off('text-change', textChangeHandler);
        quill.off('selection-change', selectionChangeHandler);
      };
    }, [onTextChange, onSelectionChange]);

    return <div ref={containerRef} className={className} style={style} id={id} />;
  },
);

QuillRichTextEditor.displayName = 'QuillRichTextEditor';

export default QuillRichTextEditor;
