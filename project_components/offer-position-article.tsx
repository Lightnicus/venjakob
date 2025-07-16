import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import KalkulationForm from "./kalkulation-form"
import PlateRichTextEditor from "./plate-rich-text-editor"

type OfferPositionArticleProps = {
  selectedNode?: any
  formDescriptionHtml?: string | undefined
  onDescriptionChange?: (desc: string | undefined) => void
  isEditing: boolean
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = ({ selectedNode, formDescriptionHtml, onDescriptionChange, isEditing }) => {
  const [title, setTitle] = useState(selectedNode?.data?.title || "")

  // Update state when selectedNode changes
  React.useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.data.title || "")
    }
  }, [selectedNode])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
  const handleDescriptionChange = (_: any, editor: any) => {
    if (editor && editor.root && onDescriptionChange) {
      const html = editor.root.innerHTML
      const cleanHtml = html === "<p><br></p>" ? "" : html
      onDescriptionChange(cleanHtml)
    }
  }

  return (
    <div className="p-6 h-full">
      <Tabs defaultValue="eingabe" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eingabe">Eingabe</TabsTrigger>
          <TabsTrigger value="kalkulation">Kalkulation</TabsTrigger>
          <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
        </TabsList>
        <TabsContent value="eingabe" className="mt-6">
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
                defaultValue={formDescriptionHtml || ''}
                onTextChange={handleDescriptionChange}
                placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
                className="min-h-[200px]"
                readOnly={!isEditing}
              />
            </div>
          </form>
        </TabsContent>
        <TabsContent value="kalkulation" className="mt-6">
          <div className="pt-2">
            <KalkulationForm />
          </div>
        </TabsContent>
        <TabsContent value="vorschau" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title || "(Keine Überschrift)"}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formDescriptionHtml || "<em>(Keine Beschreibung)</em>" }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OfferPositionArticle 