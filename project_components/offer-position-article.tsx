import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { fetchPositionCalculationItems, updatePositionCalculationItemsAPI } from '@/lib/api/quotes'
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
  const [calcItems, setCalcItems] = useState<Array<{ id: string; name: string; type: string; value: string; order: number | null }>>([])
  const [note, setNote] = useState<string>(selectedNode?.data?.calculationNote || '')

  // Update state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode) {
      const newTitle = selectedNode.data.title || "";
      setTitle(newTitle);
      setOriginalTitle(newTitle);
      setNote(selectedNode.data.calculationNote || '')
    }
  }, [selectedNode])

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
        setCalcItems(items);
      } catch (e) {
        console.error('Error loading calculation items', e);
      }
    };
    if (currentTab === 'kalkulation') {
      load();
    }
  }, [positionId, currentTab])

  const formatUnit = useCallback((type: string) => {
    if (type === 'time') return 'h';
    if (type === 'cost') return '€';
    return '';
  }, [])

  const handleCalcValueChange = useCallback((id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCalcItems(prev => prev.map(it => it.id === id ? { ...it, value: newValue } : it));
  }, [])

  const handleCalcSave = useCallback(async () => {
    if (!positionId) return;
    try {
      await updatePositionCalculationItemsAPI(positionId, calcItems.map(it => ({ id: it.id, value: it.value })));
    } catch (e) {
      console.error('Error saving calculation items', e);
    }
  }, [positionId, calcItems])

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
                  type="number"
                  value={item.value}
                  onChange={handleCalcValueChange(item.id)}
                  className="w-full"
                  aria-label={item.name}
                  tabIndex={0}
                  min={0}
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
      {isEditing && (
        <div className="mt-8 flex">
          <Button
            type="button"
            variant="outline"
            onClick={handleCalcSave}
            aria-label="Kalkulationsdaten speichern"
            tabIndex={0}
            className="flex items-center gap-2"
          >
            Kalkulationsdaten speichern
          </Button>
        </div>
      )}
    </div>
  ), [calcItems, note, handleCalcValueChange, handleNoteChange, handleCalcSave, isEditing, formatUnit])

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