import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Quill, { type QuillOptions } from 'quill';
import { Delta, Op } from 'quill'; // Import Delta and Op
import 'quill/dist/quill.snow.css'; // Default theme

// Define Sources type explicitly
type EditorSources = 'user' | 'api' | 'silent';

// isDeltaEqual is no longer needed for an uncontrolled component
// interface ComparableDeltaOperation { ... }
// const isDeltaEqual = (...) => { ... };

export interface QuillRichTextEditorProps {
  defaultValue?: string | Delta; // Changed from value to defaultValue
  onTextChange?: (delta: Delta, editor: Quill) => void; // Renamed and signature changed
  onSelectionChange?: (range: any, oldRange: any, source: EditorSources, editor: Quill) => void;
  placeholder?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
  modules?: QuillOptions['modules'];
  formats?: string[];
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export interface QuillEditorRef {
  getQuill: () => Quill | null;
}

const QuillRichTextEditor = forwardRef<QuillEditorRef, QuillRichTextEditorProps>(
  (
    {
      defaultValue, // Changed from value
      onTextChange,   // Changed from onChange
      onSelectionChange,
      placeholder,
      readOnly = false,
      theme = 'snow',
      modules,
      formats,
      className,
      style,
      id,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    // contentRef is no longer needed for an uncontrolled component
    // const contentRef = useRef<Delta | undefined>(undefined);

    // Expose Quill instance
    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
    }));

    // Initialize Quill
    useEffect(() => {
      if (editorRef.current && !quillRef.current) {
        const defaultModules: QuillOptions['modules'] = {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            [{ align: [] }],
            ['clean'],
          ],
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
          }
        };

        const options: QuillOptions = {
          theme,
          modules: modules ?? defaultModules,
          placeholder,
          readOnly,
          formats,
        };

        quillRef.current = new Quill(editorRef.current, options);
        const quill = quillRef.current;

        // Set initial content from defaultValue
        if (defaultValue) {
          if (typeof defaultValue === 'string') {
            const deltaOutput: any = quill.clipboard.convert(defaultValue as any);
            quill.setContents(deltaOutput instanceof Delta ? deltaOutput : new Delta(deltaOutput?.ops), 'silent');
          } else { // defaultValue is a Delta instance
            quill.setContents(defaultValue, 'silent');
          }
        }
        // No need to store initial content in contentRef for uncontrolled component
      }
      // Removed dependencies that would re-init for prop changes like defaultValue, making it uncontrolled post-init
    }, [theme, modules, placeholder, readOnly, formats]); 

    // useEffect for props.value (now defaultValue) is removed - component is uncontrolled for content after init.

    // Handle readOnly prop changes
    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    // Event listeners
    useEffect(() => {
      const quill = quillRef.current;
      if (!quill) return;

      // Listener for text change
      const handleTextChange = (delta: Delta, oldDelta: Delta, source: EditorSources) => {
        if (onTextChange) {
          onTextChange(quill.getContents(), quill);
        }
      };

      // Listener for selection change
      const handleSelectionChange = (range: any, oldRange: any, source: EditorSources) => {
        if (onSelectionChange) {
          onSelectionChange(range, oldRange, source, quill);
        }
      };

      quill.on('text-change' as any, handleTextChange);
      quill.on('selection-change' as any, handleSelectionChange);

      return () => {
        quill.off('text-change' as any, handleTextChange);
        quill.off('selection-change' as any, handleSelectionChange);
      };
      // Depend on callbacks so if they change, listeners are updated
    }, [onTextChange, onSelectionChange]); 

    return <div ref={editorRef} className={className} style={style} id={id} />;
  }
);

QuillRichTextEditor.displayName = 'QuillRichTextEditor';

export default QuillRichTextEditor; 