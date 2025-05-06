"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ArtikelDetailsProps {
  id: string
}

export function ArtikelDetails({ id }: ArtikelDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [artikel, setArtikel] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [previewLanguage, setPreviewLanguage] = useState("de")

  // Fetch article data
  useEffect(() => {
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
  }, [id])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Laden...</div>
  }

  if (!artikel) {
    return <div className="flex justify-center items-center h-64">Artikel nicht gefunden</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/artikel">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Zurück</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{artikel.bezeichnung}</h1>
        </div>
        <Button asChild>
          <Link href={`/artikel/${id}/bearbeiten`}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        Zuletzt geändert am {new Date(artikel.geaendertAm).toLocaleDateString("de-DE")} von {artikel.geaendertVon}
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Artikelnummer</h3>
              <p className="mt-1">{artikel.artikelnummer}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Bezeichnung</h3>
              <p className="mt-1">{artikel.bezeichnung}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Kategorie</h3>
              <p className="mt-1">
                <Badge
                  className={
                    artikel.kategorie === "Hardware"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : artikel.kategorie === "Software"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                        : "bg-green-100 text-green-800 hover:bg-green-100"
                  }
                >
                  {artikel.kategorie}
                </Badge>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Preis</h3>
              <p className="mt-1">{artikel.preis.toFixed(2)} €</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="beschreibung" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Beschreibung</h3>
              <Select value={previewLanguage} onValueChange={setPreviewLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: artikel.beschreibung[previewLanguage] }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
