import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import KalkulationForm from "./kalkulation-form"
import QuillRichTextEditor from "./quill-rich-text-editor" // adjust if needed

type OfferPositionArticleProps = {
  selectedNode?: any
  formDescriptionHtml?: string | undefined
  onDescriptionChange?: (desc: string | undefined) => void
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = ({ selectedNode, formDescriptionHtml, onDescriptionChange }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState<string>("")

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
  const handleDescriptionChange = (_: any, editor: any) => {
    if (editor && editor.root) {
      const html = editor.root.innerHTML
      setDescription(html === "<p><br></p>" ? "" : html)
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
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="editor-beschreibung" className="text-sm font-medium">Beschreibung</label>
              <QuillRichTextEditor
                id="editor-beschreibung"
                defaultValue={description}
                onTextChange={handleDescriptionChange}
                placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
                theme="snow"
                className="min-h-[200px] border rounded-md"
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
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description || "<em>(Keine Beschreibung)</em>" }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OfferPositionArticle 