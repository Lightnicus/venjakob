"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuftragsbestaetigungPDFPreview } from "@/components/auftragsbestaetigung-pdf-preview"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react"

interface AuftragsbestaetigungDetailsProps {
  id: string
}

// Mock-Daten für die Auftragsbestätigung
const mockAuftragsbestaetigung = {
  id: "AB-2023-001",
  angebotsnr: "1003B-V1",
  kunde: {
    name: "Innovate Solutions GmbH",
    address: "Technologiepark 10",
    city: "Berlin",
    postalCode: "10587",
    country: "Deutschland",
    contactPerson: "Dr. Markus Weber",
    email: "m.weber@innovate-solutions.de",
    phone: "+49 30 12345678",
  },
  titel: "Softwarelizenzen (Alternative)",
  datum: "2023-01-30",
  betrag: 5664.26,
  verkaufschance: "VC-004",
  positionen: [
    {
      id: 1,
      name: "Enterprise Software Lizenz",
      menge: 5,
      einheit: "Stück",
      einzelpreis: 950.0,
      gesamtpreis: 4750.0,
    },
    {
      id: 2,
      name: "Support & Wartung (12 Monate)",
      menge: 1,
      einheit: "Paket",
      einzelpreis: 914.26,
      gesamtpreis: 914.26,
    },
  ],
  angebot: {
    id: 1,
    offerNumber: "1003B",
    currentVersion: {
      id: 1,
      versionNumber: "V1",
      title: "Softwarelizenzen (Alternative)",
      description: "Enterprise Software Lizenzen mit Support & Wartung",
      status: "Akzeptiert",
      positions: [
        {
          id: 1,
          name: "Enterprise Software Lizenz",
          quantity: 5,
          unit: "Stück",
          unitPrice: 950.0,
          totalPrice: 4750.0,
        },
        {
          id: 2,
          name: "Support & Wartung (12 Monate)",
          quantity: 1,
          unit: "Paket",
          unitPrice: 914.26,
          totalPrice: 914.26,
        },
      ],
    },
  },
}

export function AuftragsbestaetigungDetails({ id }: AuftragsbestaetigungDetailsProps) {
  const [auftragsbestaetigung, setAuftragsbestaetigung] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // In einer echten Anwendung würden wir hier die Daten von der API abrufen
    // Für dieses Beispiel verwenden wir Mock-Daten
    setTimeout(() => {
      setAuftragsbestaetigung(mockAuftragsbestaetigung)
      setIsLoading(false)
    }, 500)
  }, [id])

  const handleDownloadPDF = () => {
    toast({
      title: "PDF wird heruntergeladen",
      description: "Die Auftragsbestätigung wird als PDF heruntergeladen.",
    })
    // In einer echten Anwendung würden wir hier die PDF herunterladen
  }

  const handlePrintPDF = () => {
    toast({
      title: "PDF wird gedruckt",
      description: "Die Auftragsbestätigung wird zum Drucken vorbereitet.",
    })
    // In einer echten Anwendung würden wir hier die PDF drucken
  }

  const handleSharePDF = () => {
    toast({
      title: "PDF wird geteilt",
      description: "Die Auftragsbestätigung wird zum Teilen vorbereitet.",
    })
    // In einer echten Anwendung würden wir hier die PDF teilen
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Auftragsbestätigung wird geladen...</div>
  }

  if (!auftragsbestaetigung) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">Auftragsbestätigung nicht gefunden</h2>
              <p className="text-muted-foreground mt-2">
                Die angeforderte Auftragsbestätigung konnte nicht gefunden werden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Herunterladen
          </Button>
          <Button variant="outline" onClick={handlePrintPDF}>
            <Printer className="mr-2 h-4 w-4" />
            Drucken
          </Button>
          <Button variant="outline" onClick={handleSharePDF}>
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auftragsbestätigung {auftragsbestaetigung.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Allgemeine Informationen</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Auftragsbestätigungs-Nr.:</span>
                  <span>{auftragsbestaetigung.id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Angebots-Nr.:</span>
                  <span>{auftragsbestaetigung.angebotsnr}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Datum:</span>
                  <span>{new Date(auftragsbestaetigung.datum).toLocaleDateString("de-DE")}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Betrag:</span>
                  <span>{auftragsbestaetigung.betrag.toLocaleString("de-DE")} €</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Verkaufschance:</span>
                  <span>{auftragsbestaetigung.verkaufschance}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Kundeninformationen</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{auftragsbestaetigung.kunde.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Adresse:</span>
                  <span>
                    {auftragsbestaetigung.kunde.address}, {auftragsbestaetigung.kunde.postalCode}{" "}
                    {auftragsbestaetigung.kunde.city}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Ansprechpartner:</span>
                  <span>{auftragsbestaetigung.kunde.contactPerson}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">E-Mail:</span>
                  <span>{auftragsbestaetigung.kunde.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span>{auftragsbestaetigung.kunde.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Positionen</h3>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Menge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Einheit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Einzelpreis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gesamtpreis
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auftragsbestaetigung.positionen.map((position) => (
                    <tr key={position.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{position.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.menge}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.einheit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.einzelpreis.toLocaleString("de-DE")} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.gesamtpreis.toLocaleString("de-DE")} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4 text-right font-medium">
                      Zwischensumme:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {auftragsbestaetigung.betrag.toLocaleString("de-DE")} €
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4 text-right font-medium">
                      MwSt. (19%):
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(auftragsbestaetigung.betrag * 0.19).toLocaleString("de-DE")} €
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4 text-right font-medium">
                      Gesamtbetrag:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(auftragsbestaetigung.betrag * 1.19).toLocaleString("de-DE")} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
          <TabsTrigger value="angebot">Angebot</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <AuftragsbestaetigungPDFPreview auftragsbestaetigung={auftragsbestaetigung} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="angebot" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Angebotsinformationen</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Angebots-Nr.:</span>
                  <span>{auftragsbestaetigung.angebot.offerNumber}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{auftragsbestaetigung.angebot.currentVersion.versionNumber}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Titel:</span>
                  <span>{auftragsbestaetigung.angebot.currentVersion.title}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Beschreibung:</span>
                  <span>{auftragsbestaetigung.angebot.currentVersion.description}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{auftragsbestaetigung.angebot.currentVersion.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
