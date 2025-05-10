import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import KalkulationForm from "./kalkulation-form"
import QuillRichTextEditor from "./quill-rich-text-editor" // adjust if needed

const TABS = [
  { id: "eingabe", label: "Eingabe" },
  { id: "kalkulation", label: "Kalkulation" },
  { id: "vorschau", label: "Vorschau" },
]

type OfferPositionArticleProps = {
  selectedNode?: any
  formDescriptionHtml?: string | undefined
  onDescriptionChange?: (desc: string | undefined) => void
}

const OfferPositionArticle: React.FC<OfferPositionArticleProps> = ({ selectedNode, formDescriptionHtml, onDescriptionChange }) => {
  const [activeTab, setActiveTab] = useState("eingabe")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState<string>("")

  const handleTabClick = (id: string) => setActiveTab(id)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)
  const handleDescriptionChange = (_: any, editor: any) => {
    if (editor && editor.root) {
      const html = editor.root.innerHTML
      setDescription(html === "<p><br></p>" ? "" : html)
    }
  }

  return (
    <div className="p-6 h-full">
      <div role="tablist" aria-label="Tabs" className="flex mb-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={0}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => e.key === "Enter" && handleTabClick(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div id="tabpanel-eingabe" role="tabpanel" hidden={activeTab !== "eingabe"} aria-labelledby="tab-eingabe">
        {activeTab === "eingabe" && (
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
        )}
      </div>
      <div id="tabpanel-kalkulation" role="tabpanel" hidden={activeTab !== "kalkulation"} aria-labelledby="tab-kalkulation">
        {activeTab === "kalkulation" && (
          <div className="pt-2">
            <KalkulationForm />
          </div>
        )}
      </div>
      <div id="tabpanel-vorschau" role="tabpanel" hidden={activeTab !== "vorschau"} aria-labelledby="tab-vorschau">
        {activeTab === "vorschau" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title || "(Keine Überschrift)"}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description || "<em>(Keine Beschreibung)</em>" }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default OfferPositionArticle 