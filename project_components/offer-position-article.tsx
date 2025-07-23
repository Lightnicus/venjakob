import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import KalkulationForm from "./kalkulation-form"
import PlateRichTextEditor from "./plate-rich-text-editor"
import { type Value } from 'platejs'
import { plateValueToHtml } from '@/helper/plate-serialization';
import { parseJsonContent } from '@/helper/plate-json-parser';

type OfferPositionArticleProps = {
  selectedNode?: any
  formDescriptionHtml?: string | undefined
  onDescriptionChange?: (desc: string | undefined) => void
  isEditing: boolean
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = React.memo(({ 
  selectedNode, 
  formDescriptionHtml, 
  onDescriptionChange, 
  isEditing 
}) => {
  const [title, setTitle] = useState(selectedNode?.data?.title || "")
  const [previewHtml, setPreviewHtml] = useState<string>("")

  // Update state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.data.title || "")
    }
  }, [selectedNode])

  // Convert PlateJS value to HTML for preview
  useEffect(() => {
    const convertToHtml = async () => {
      if (!formDescriptionHtml) {
        setPreviewHtml("<em>(Keine Beschreibung)</em>");
        return;
      }

      try {
        // Parse the JSON string back to PlateJS value
        const plateValue = parseJsonContent(formDescriptionHtml);
        // Convert to HTML
        const html = await plateValueToHtml(plateValue);
        setPreviewHtml(html);
      } catch (error) {
        console.error('Error converting to HTML for preview:', error);
        setPreviewHtml("<em>(Fehler beim Laden der Beschreibung)</em>");
      }
    };

    convertToHtml();
  }, [formDescriptionHtml]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  const handleDescriptionChange = useCallback((content: Value) => {
    if (onDescriptionChange) {
      onDescriptionChange(JSON.stringify(content))
    }
  }, [onDescriptionChange])

  // Memoize the form content to prevent unnecessary re-renders
  const formContent = useMemo(() => (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="input-ueberschrift" className="text-sm font-medium">Überschrift</label>
        <Input
          id="input-ueberschrift"
          type="text"
          placeholder="Überschrift eingeben"
          value={title}
          onChange={handleTitleChange}
          className="w-full"
          aria-label="Überschrift"
          disabled={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="editor-beschreibung" className="text-sm font-medium">Beschreibung</label>
        <PlateRichTextEditor
          id="editor-beschreibung"
          value={formDescriptionHtml || ''}
          onValueChange={handleDescriptionChange}
          placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
          className="min-h-[200px]"
          readOnly={!isEditing}
        />
      </div>
    </form>
  ), [title, handleTitleChange, formDescriptionHtml, handleDescriptionChange, isEditing])

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
    </div>
  )
})

OfferPositionArticle.displayName = 'OfferPositionArticle'

export default OfferPositionArticle 