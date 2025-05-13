"use client"
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

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
  onTextChange?: (delta: Delta, editor: any) => void;
  onSelectionChange?: (range: any, oldRange: any, source: EditorSources, editor: any) => void;
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

// Flag to track if we've loaded Quill CSS already
let cssLoaded = false;

const QuillRichTextEditor = forwardRef<QuillEditorRef, QuillRichTextEditorProps>(
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
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any | null>(null);
    const [isQuillLoaded, setIsQuillLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
    }));

    // Effect for Quill initialization and re-initialization
    useEffect(() => {
      let isMounted = true;
      let currentInstance: any = null; // Store the instance created in this effect run

      const initializeQuill = async () => {
        if (!editorRef.current) return;

        // CRITICAL: Clear the container DOM before creating a new Quill instance
        editorRef.current.innerHTML = '';

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

          if (!isMounted || !editorRef.current) return; // Re-check after async operations

          currentInstance = new Quill(editorRef.current, options);
          quillRef.current = currentInstance;

          if (defaultValue) {
            const Delta = QuillModule.Delta;
            if (typeof defaultValue === 'string') {
              // Quill's clipboard.convert returns a Delta
              const deltaContent = currentInstance.clipboard.convert(defaultValue);
              currentInstance.setContents(deltaContent, 'silent');
            } else {
              currentInstance.setContents(defaultValue, 'silent');
            }
          }

          if (isMounted) {
            setIsQuillLoaded(true);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error initializing Quill:', error);
          }
        }
      };

      initializeQuill();

      return () => {
        isMounted = false;
        if (currentInstance) {
          // Basic cleanup for the instance created by this effect run
          currentInstance.off('text-change');
          currentInstance.off('selection-change');
        }
        // If the shared ref points to the instance we created, nullify it.
        if (quillRef.current === currentInstance) {
          quillRef.current = null;
        }
        setIsQuillLoaded(false); // Reset loaded state
      };
    }, [theme, customModules, placeholder, readOnly, formats]); // defaultValue is not a dep for re-init

    // Effect for managing event listeners based on callback props and Quill load state
    useEffect(() => {
      const quill = quillRef.current;
      if (!quill || !isQuillLoaded) {
        return () => {}; // No cleanup needed if not ready
      }

      const textChangeHandler = (delta: Delta, oldDelta: Delta, source: EditorSources) => {
        if (onTextChange) {
          // Pass the full Delta from getContents and the editor instance
          onTextChange(quill.getContents(), quill);
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
        if (quill) {
          quill.off('text-change', textChangeHandler);
          quill.off('selection-change', selectionChangeHandler);
        }
      };
    }, [onTextChange, onSelectionChange, isQuillLoaded]); // Depends on callbacks and load state

    return <div ref={editorRef} className={className} style={style} id={id} />;
  }
);

QuillRichTextEditor.displayName = 'QuillRichTextEditor';

export default QuillRichTextEditor; 