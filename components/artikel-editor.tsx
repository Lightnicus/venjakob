"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Trash } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"

interface ArtikelEditorProps {
  id: string
}

export function ArtikelEditor({ id }: ArtikelEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)
  const [artikel, setArtikel] = useState<any>(null)

  // Fetch article data if editing an existing article
  useEffect(() => {
    if (id !== "neu") {
      setIsLoading(true)
      // In a real app, you would fetch the article data from the API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockArtikel = {
          id: id,
          artikelnummer: id === "ART-001" ? "BS1069" : id === "ART-002" ? "BS1071" : "BS848",
          bezeichnung:
            id === "ART-001" ? "Bürostuhl Comfort Plus" : id === "ART-002" ? "Bürostuhl Executive" : "Bürostuhl Basic",
          kategorie: "Hardware",
          preis: id === "ART-001" ? 299.99 : id === "ART-002" ? 499.99 : 199.99,
          beschreibung: {
            de: "Ergonomischer Bürostuhl mit verstellbarer Rückenlehne und Armlehnen.",
            en: "Ergonomic office chair with adjustable backrest and armrests.",
          },
          geaendertAm: "2023-03-06",
          geaendertVon: "Enrica Pietig",
        }
        setArtikel(mockArtikel)
        setIsLoading(false)
      }, 500)
    } else {
      // Initialize with empty data for a new article
      setArtikel({
        id: "neu",
        artikelnummer: "",
        bezeichnung: "",
        kategorie: "Hardware",
        preis: 0,
        beschreibung: {
          de: "",
          en: "",
        },
        geaendertAm: new Date().toISOString(),
        geaendertVon: "Enrica Pietig",
      })
    }
  }, [id])

  const handleInputChange = (field: string, value: any) => {
    setArtikel((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDescriptionChange = (language: string, value: string) => {
    setArtikel((prev: any) => ({
      ...prev,
      beschreibung: {
        ...prev.beschreibung,
        [language]: value,
      },
    }))
  }

  const handleSave = () => {
    setIsLoading(true)
    // In a real app, you would save the article data to the API
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: id === "neu" ? "Artikel erstellt" : "Artikel aktualisiert",
        description: `Artikel "${artikel.bezeichnung}" wurde erfolgreich ${id === "neu" ? "erstellt" : "aktualisiert"}.`,
      })
      router.push("/artikel")
    }, 1000)
  }

  const handleCancel = () => {
    router.push("/artikel")
  }

  if (isLoading && !artikel) {
    return <div className="flex justify-center items-center h-64">Laden...</div>
  }

  if (!artikel) {
    return <div className="flex justify-center items-center h-64">Artikel nicht gefunden</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {id === "neu" ? "Neuer Artikel" : `Artikel bearbeiten: ${artikel.bezeichnung}`}
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Speichern..." : "Speichern"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
        </div>
      </div>

      {id !== "neu" && (
        <div className="text-sm text-gray-500">
          Zuletzt geändert am {new Date(artikel.geaendertAm).toLocaleDateString("de-DE")} von {artikel.geaendertVon}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg border shadow-sm">
        <TabsList className="border-b rounded-none p-0">
          <TabsTrigger
            value="details"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="beschreibung"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
          >
            Beschreibung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="artikelnummer">Artikelnummer</Label>
                <Input
                  id="artikelnummer"
                  value={artikel.artikelnummer}
                  onChange={(e) => handleInputChange("artikelnummer", e.target.value)}
                  placeholder="z.B. BS1069"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bezeichnung">Bezeichnung</Label>
                <Input
                  id="bezeichnung"
                  value={artikel.bezeichnung}
                  onChange={(e) => handleInputChange("bezeichnung", e.target.value)}
                  placeholder="z.B. Bürostuhl Comfort Plus"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategorie">Kategorie</Label>
                <Select value={artikel.kategorie} onValueChange={(value) => handleInputChange("kategorie", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Dienstleistung">Dienstleistung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preis">Preis (€)</Label>
                <Input
                  id="preis"
                  type="number"
                  step="0.01"
                  min="0"
                  value={artikel.preis}
                  onChange={(e) => handleInputChange("preis", Number.parseFloat(e.target.value))}
                  placeholder="z.B. 299.99"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="beschreibung" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Beschreibung</h3>
              <Button variant="outline" size="sm">
                Sprache hinzufügen
              </Button>
            </div>

            {/* German description */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Deutsch</h4>
                  <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Sprache löschen</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <RichTextEditor
                    value={artikel.beschreibung.de}
                    onChange={(value) => handleDescriptionChange("de", value)}
                    placeholder="Artikelbeschreibung auf Deutsch eingeben..."
                    minHeight="200px"
                  />
                </div>
              </CardContent>
            </Card>

            {/* English description */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Englisch</h4>
                  <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Sprache löschen</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <RichTextEditor
                    value={artikel.beschreibung.en}
                    onChange={(value) => handleDescriptionChange("en", value)}
                    placeholder="Enter article description in English..."
                    minHeight="200px"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
