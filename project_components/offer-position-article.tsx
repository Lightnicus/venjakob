import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { fetchPositionCalculationItems } from '@/lib/api/quotes'
import PlateRichTextEditor from "./plate-rich-text-editor"
import { type Value } from 'platejs'
import { plateValueToHtml } from '@/helper/plate-serialization';
import { parseJsonContent } from '@/helper/plate-json-parser';
import { Circle } from 'lucide-react';

type OfferPositionArticleProps = {
  selectedNode?: any
  isEditing: boolean
  positionId?: string;
  hasPositionChanges?: (positionId: string) => boolean;
  addChange?: (positionId: string, field: string, oldValue: any, newValue: any) => void;
  removeChange?: (positionId: string, field?: string) => void;
  getPositionChanges?: (positionId: string) => { [field: string]: { oldValue: any; newValue: any } };
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = React.memo(({ 
  selectedNode, 
  isEditing,
  positionId,
  hasPositionChanges,
  addChange,
  removeChange,
  getPositionChanges
}) => {
  const [title, setTitle] = useState(selectedNode?.data?.title || "")
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [originalTitle, setOriginalTitle] = useState(selectedNode?.data?.title || "")
  const [currentTab, setCurrentTab] = useState<string>("eingabe")
  const [calcItems, setCalcItems] = useState<Array<{ id: string; name: string; type: string; value: string; order: number | null; editingValue?: string }>>([])
  const [note, setNote] = useState<string>(selectedNode?.data?.calculationNote || '')

  // Update state when selectedNode changes; prefer unsaved note if available
  React.useEffect(() => {
    if (selectedNode) {
      const newTitle = selectedNode.data.title || "";
      setTitle(newTitle);
      setOriginalTitle(newTitle);
      const unsaved = positionId && getPositionChanges ? getPositionChanges(positionId) : undefined;
      const noteChange = unsaved && unsaved['calculationNote'];
      setNote((noteChange?.newValue as string) ?? (selectedNode.data.calculationNote || ''));
    }
  }, [selectedNode, positionId, getPositionChanges])

  // Get current value considering unsaved changes
  const getCurrentTitle = useCallback(() => {
    if (positionId && hasPositionChanges && hasPositionChanges(positionId)) {
      // Check if we have unsaved changes for this position
      const positionChanges = getPositionChanges?.(positionId);
      if (positionChanges?.title) {
        return positionChanges.title.newValue;
      }
    }
    return title;
  }, [positionId, hasPositionChanges, getPositionChanges, title]);

  const getCurrentDescription = useCallback(() => {
    if (positionId && hasPositionChanges && hasPositionChanges(positionId)) {
      // Check if we have unsaved changes for this position
      const positionChanges = getPositionChanges?.(positionId);
      if (positionChanges?.description) {
        return positionChanges.description.newValue;
      }
    }
    return selectedNode?.data?.description || "";
  }, [positionId, hasPositionChanges, getPositionChanges, selectedNode]);

  // Function to update preview HTML with current data
  const updatePreviewHtml = useCallback(async () => {
    const currentDescription = getCurrentDescription();
    
    if (!currentDescription) {
      setPreviewHtml("<em>(Keine Beschreibung)</em>");
      return;
    }

    try {
      // Parse the JSON string back to PlateJS value
      const plateValue = parseJsonContent(currentDescription);
      // Convert to HTML
      const html = await plateValueToHtml(plateValue);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Error converting to HTML for preview:', error);
      setPreviewHtml("<em>(Fehler beim Laden der Beschreibung)</em>");
    }
  }, [getCurrentDescription]);

  // Convert PlateJS value to HTML for preview when selectedNode changes
  useEffect(() => {
    updatePreviewHtml();
  }, [selectedNode?.data?.description, updatePreviewHtml]);

  // Update preview when switching to preview tab
  useEffect(() => {
    if (currentTab === "vorschau") {
      updatePreviewHtml();
    }
  }, [currentTab, updatePreviewHtml]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Track changes if positionId and change tracking functions are available
    if (positionId && addChange && removeChange) {
      if (newTitle !== originalTitle) {
        addChange(positionId, 'title', originalTitle, newTitle);
      } else {
        removeChange(positionId, 'title');
      }
    }
  }, [positionId, addChange, removeChange, originalTitle])

  const handleDescriptionChange = useCallback((content: Value) => {
    if (selectedNode && positionId && addChange && removeChange) {
      const newDescription = JSON.stringify(content);
      const oldDescription = selectedNode.data.description || '';
      
      if (newDescription !== oldDescription) {
        addChange(positionId, 'description', oldDescription, newDescription);
      } else {
        removeChange(positionId, 'description');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  // Load calculation items when positionId changes or when switching to kalkulation tab
  useEffect(() => {
    const load = async () => {
      if (!positionId) return;
      try {
        const items = await fetchPositionCalculationItems(positionId);
        const toGerman = (v: string) => (v ?? '').toString().replace('.', ',');
        // Merge unsaved changes
        const unsaved = getPositionChanges ? getPositionChanges(positionId) : undefined;
        const merged = items.map(it => {
          const changeKey = `calcItem:${it.id}`;
          const newVal = unsaved && unsaved[changeKey]?.newValue as string | undefined;
          const canonical = newVal ?? it.value;
          return { ...it, value: canonical, editingValue: toGerman(canonical) };
        });
        setCalcItems(merged);
      } catch (e) {
        console.error('Error loading calculation items', e);
      }
    };
    if (currentTab === 'kalkulation') {
      load();
    }
  }, [positionId, currentTab, getPositionChanges])

  const formatUnit = useCallback((type: string) => {
    if (type === 'time') return 'h';
    if (type === 'cost') return '€';
    return '';
  }, [])

  const registerCalcChange = useCallback((id: string, newValue: string, oldValue: string) => {
    if (positionId && addChange && removeChange) {
      const key = `calcItem:${id}`;
      if (newValue !== oldValue) {
        addChange(positionId, key, oldValue, newValue);
      } else {
        removeChange(positionId, key);
      }
    }
  }, [positionId, addChange, removeChange]);

  const parseGermanDecimal = (input: string) => input.replace(',', '.');
  const clampTwoDecimals = (value: string) => {
    if (value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return '';
    return num.toFixed(2);
  };

  const isValidGermanInput = (raw: string) => {
    // Allow digits with optional single comma or dot and up to 2 decimals
    return /^\d*(?:[\.,]\d{0,2})?$/.test(raw);
  };

  const handleCalcValueChange = useCallback((id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!isValidGermanInput(raw)) return;
    setCalcItems(prev => prev.map(it => it.id === id ? { ...it, editingValue: raw } : it));
  }, [])

  const handleCalcValueBlur = useCallback((id: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    setCalcItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const oldCanonical = it.value;
      const normalized = clampTwoDecimals(parseGermanDecimal(raw));
      // If empty or invalid, fall back to old value
      if (normalized === '') {
        return { ...it, editingValue: it.editingValue ?? '' };
      }
      // Update canonical and editing value, and register change
      registerCalcChange(id, normalized, oldCanonical);
      const germanDisplay = normalized.replace('.', ',');
      return { ...it, value: normalized, editingValue: germanDisplay };
    }));
  }, [registerCalcChange])

  // No local save; central Save in QuoteDetail handles persistence

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    if (positionId && addChange && removeChange) {
      const oldNote = selectedNode?.data?.calculationNote || '';
      if (newNote !== oldNote) {
        addChange(positionId, 'calculationNote', oldNote, newNote);
      } else {
        removeChange(positionId, 'calculationNote');
      }
    }
  }, [positionId, addChange, removeChange, selectedNode])

  // Check if this position has unsaved changes
  const hasChanges = positionId && hasPositionChanges ? hasPositionChanges(positionId) : false;

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="input-ueberschrift" className="text-sm font-medium">
          Überschrift
        </label>
        <Input
          id="input-ueberschrift"
          type="text"
          placeholder="Überschrift eingeben"
          value={getCurrentTitle()}
          onChange={handleTitleChange}
          className="w-full"
          aria-label="Überschrift"
          disabled={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="editor-beschreibung" className="text-sm font-medium">
          Beschreibung
        </label>
        <PlateRichTextEditor
          id="editor-beschreibung"
          value={getCurrentDescription() || ''}
          onValueChange={handleDescriptionChange}
          placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
          className="min-h-[200px]"
          readOnly={!isEditing}
        />
      </div>
    </form>
  ), [getCurrentTitle, handleTitleChange, getCurrentDescription, handleDescriptionChange, isEditing])

  // Kalkulation content (live data)
  const kalkulationContent = useMemo(() => (
    <div className="pt-2 w-full max-w-5xl border rounded p-6 bg-white mx-auto mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-0">
          {calcItems.map(item => (
            <div key={item.id} className="grid grid-cols-[minmax(200px,auto)_160px] gap-4 items-center mb-4">
              <label className="flex flex-col gap-1 text-sm font-medium" htmlFor={`ci-${item.id}`}>
                {item.name} ({formatUnit(item.type)})
                <Input
                  id={`ci-${item.id}`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[\.,]?[0-9]{0,2}"
                  value={item.editingValue ?? ''}
                  onChange={handleCalcValueChange(item.id)}
                  onBlur={handleCalcValueBlur(item.id)}
                  className="w-full"
                  aria-label={item.name}
                  tabIndex={0}
                  disabled={!isEditing}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 h-full">
          <label htmlFor="bemerkung" className="text-sm font-medium">Bemerkung</label>
          <Textarea
            id="bemerkung"
            value={note}
            onChange={handleNoteChange}
            className="min-h-[180px] resize-y h-full"
            aria-label="Bemerkung"
            tabIndex={0}
            disabled={!isEditing}
          />
        </div>
      </div>
      {/* Saved via central Save */}
    </div>
  ), [calcItems, note, handleCalcValueChange, handleNoteChange, isEditing, formatUnit])

  // Memoize the preview content
  const previewContent = useMemo(() => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{getCurrentTitle() || "(Keine Überschrift)"}</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  ), [getCurrentTitle, previewHtml])

  return (
    <div className="p-6 h-full">
      {isEditing ? (
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="eingabe">Eingabe</TabsTrigger>
            <TabsTrigger value="kalkulation">Kalkulation</TabsTrigger>
            <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
          </TabsList>
          <TabsContent value="eingabe" className="mt-6">
            {formContent}
          </TabsContent>
          <TabsContent value="kalkulation" className="mt-6">
            {kalkulationContent}
          </TabsContent>
          <TabsContent value="vorschau" className="mt-6">
            {previewContent}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-6">
          {previewContent}
        </div>
      )}
    </div>
  )
})

OfferPositionArticle.displayName = 'OfferPositionArticle'

export default OfferPositionArticle 