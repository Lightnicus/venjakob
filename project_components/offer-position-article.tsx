import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import KalkulationForm from "./kalkulation-form"
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

  // Update state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode) {
      const newTitle = selectedNode.data.title || "";
      setTitle(newTitle);
      setOriginalTitle(newTitle);
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

  // Convert PlateJS value to HTML for preview
  useEffect(() => {
    const convertToHtml = async () => {
      if (!selectedNode?.data?.description) {
        setPreviewHtml("<em>(Keine Beschreibung)</em>");
        return;
      }

      try {
        // Parse the JSON string back to PlateJS value
        const plateValue = parseJsonContent(selectedNode.data.description);
        // Convert to HTML
        const html = await plateValueToHtml(plateValue);
        setPreviewHtml(html);
      } catch (error) {
        console.error('Error converting to HTML for preview:', error);
        setPreviewHtml("<em>(Fehler beim Laden der Beschreibung)</em>");
      }
    };

    convertToHtml();
  }, [selectedNode?.data?.description]);

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

  // Memoize the kalkulation content
  const kalkulationContent = useMemo(() => (
    <div className="pt-2">
      <KalkulationForm />
    </div>
  ), [])

  // Memoize the preview content
  const previewContent = useMemo(() => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title || "(Keine Überschrift)"}</h2>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </div>
  ), [title, previewHtml])

  return (
    <div className="p-6 h-full">
      {isEditing ? (
        <Tabs defaultValue="eingabe" className="w-full">
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