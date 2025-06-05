'use client';
import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';

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

// Flag to track if we've loaded Quill CSS already
let cssLoaded = false;

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
        // Only clear if Quill hasn't been initialized yet or if critical props change
        if (!quillRef.current) {
          editorRef.current.innerHTML = '';
        }

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
            readOnly, // Set initial readOnly state
            formats,
          };

          if (!isMounted || !editorRef.current) return; // Re-check after async operations

          // Initialize Quill only if it hasn't been initialized yet
          if (!quillRef.current) {
            currentInstance = new Quill(editorRef.current, options);
            quillRef.current = currentInstance;

            if (defaultValue) {
              if (typeof defaultValue === 'string') {
                // Set HTML content directly on the editor root
                currentInstance.root.innerHTML = defaultValue;
              } else {
                currentInstance.setContents(defaultValue, 'silent');
              }
            }
          } else {
            // If Quill is already initialized, ensure its options are updated if necessary (e.g., placeholder)
            // Note: theme, modules, formats changes still require re-initialization handled by the dependency array.
            if (quillRef.current.options.placeholder !== placeholder) {
                 quillRef.current.root.setAttribute('data-placeholder', placeholder || '');
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
        // Cleanup logic remains tricky. If we re-initialize on certain prop changes,
        // we need to decide if we destroy the old instance.
        // For now, focusing on readOnly not causing full re-init.
        // if (currentInstance) {
        //   currentInstance.off('text-change');
        //   currentInstance.off('selection-change');
        // }
        // if (quillRef.current === currentInstance) {
        //   quillRef.current = null;
        // }
        // setIsQuillLoaded(false); // Reset loaded state if instance is truly destroyed
      };
    }, [theme, customModules, placeholder, formats, defaultValue]); // Removed readOnly, defaultValue added as it affects initial content

    // Effect for handling readOnly changes specifically
    useEffect(() => {
      const quill = quillRef.current;
      if (quill && isQuillLoaded) {
        quill.enable(!readOnly);
      }
    }, [readOnly, isQuillLoaded]);

    // Effect for managing event listeners based on callback props and Quill load state
    useEffect(() => {
      const quill = quillRef.current;
      if (!quill || !isQuillLoaded) {
        return () => {}; // No cleanup needed if not ready
      }

      const textChangeHandler = (
        delta: Delta,
        oldDelta: Delta,
        source: EditorSources,
      ) => {
        if (onTextChange) {
          // Return HTML content instead of Delta object
          const htmlContent = quill.root.innerHTML;
          onTextChange(htmlContent, quill);
        }
      };

      const selectionChangeHandler = (
        range: any,
        oldRange: any,
        source: EditorSources,
      ) => {
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
  },
);

QuillRichTextEditor.displayName = 'QuillRichTextEditor';

export default QuillRichTextEditor;
