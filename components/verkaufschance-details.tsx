"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, RefreshCw } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { fetchSalesOpportunityById, fetchDocumentsByOpportunityId } from "@/lib/crm-service"

interface VerkaufschanceDetailsProps {
  id: string
}

export function VerkaufschanceDetails({ id }: VerkaufschanceDetailsProps) {
  const [verkaufschance, setVerkaufschance] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadVerkaufschance()
  }, [id])

  const loadVerkaufschance = async () => {
    setIsLoading(true)
    try {
      // Verkaufschance aus dem CRM laden
      const data = await fetchSalesOpportunityById(id)
      if (data) {
        setVerkaufschance(data)
        loadDocuments(data.GGUID)
      } else {
        toast({
          title: "Fehler",
          description: "Verkaufschance nicht gefunden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading sales opportunity:", error)
      toast({
        title: "Fehler",
        description: "Verkaufschance konnte nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDocuments = async (gguid: string) => {
    setIsLoadingDocuments(true)
    try {
      const docs = await fetchDocumentsByOpportunityId(gguid)
      setDocuments(docs)
    } catch (error) {
      console.error("Error loading documents:", error)
      toast({
        title: "Fehler",
        description: "Dokumente konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleCreateOffer = () => {
    console.log("Creating offer from sales opportunity with ID:", id)
    router.push(`/angebote/neu?verkaufschance=${id}`)
  }

  const formatCurrency = (value?: number, currency = "EUR") => {
    if (value === undefined) return "-"

    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"

    return new Date(dateString).toLocaleDateString("de-DE")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size={40} />
        <p className="mt-4 text-muted-foreground">Verkaufschance wird geladen...</p>
      </div>
    )
  }

  if (!verkaufschance) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold">Verkaufschance nicht gefunden</h2>
              <p className="text-muted-foreground mt-2">
                Die angeforderte Verkaufschance konnte nicht gefunden werden.
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
          <Button onClick={handleCreateOffer}>
            <FileText className="mr-2 h-4 w-4" />
            Angebot erstellen
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verkaufschance {verkaufschance.KEYWORD}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Allgemeine Informationen</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">GGUID:</span>
                  <span className="truncate">{verkaufschance.GGUID}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Stichwort:</span>
                  <span>{verkaufschance.KEYWORD}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{verkaufschance.STATUS}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Phase:</span>
                  <span>{verkaufschance.DISTRIBUTIONPHASE}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Volumen:</span>
                  <span>{formatCurrency(verkaufschance.VJ_ANGEBOTSVOLUMEN, verkaufschance.CURRENCYNAT)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Liefertermin:</span>
                  <span>{formatDate(verkaufschance.VJ_LIEFERTERMIN)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Wahrscheinlichkeit:</span>
                  <span>{verkaufschance.VJ_WAHRSCHEINLICHKEIT || "-"}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Kundeninformationen</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Kunde:</span>
                  <span>{verkaufschance.ACCOUNTINFORMATION}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Verantwortlicher:</span>
                  <span>{verkaufschance.PERSONINCHARGE}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Erstellt am:</span>
                  <span>{formatDate(verkaufschance.INSERTDATE)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Geändert am:</span>
                  <span>{formatDate(verkaufschance.CHANGEDATE)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Test notwendig:</span>
                  <span>{verkaufschance.VJ_TESTNOTWENDIG ? "Ja" : "Nein"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Geheimhaltung:</span>
                  <span>{verkaufschance.VJ_GEHEIMHALTUNGSVEREINBARUNG ? "Ja" : "Nein"}</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="documents" className="mt-6">
            <TabsList>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="notes">Notizen</TabsTrigger>
              <TabsTrigger value="history">Verlauf</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {isLoadingDocuments ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-2">Dokumente werden geladen...</span>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Keine Dokumente vorhanden</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Dokumente</h3>
                        <Button variant="outline" size="sm" onClick={() => loadDocuments(verkaufschance.GGUID)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Aktualisieren
                        </Button>
                      </div>
                      <div className="border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Datum
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Typ
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stichwort
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ersteller
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Eigentümer
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((doc, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatDate(doc.fields.DOCDATE)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doc.fields.GWSTYPE}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doc.fields.KEYWORD}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doc.fields.INSERTUSER}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {doc.fields.OWNERNAME}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Keine Notizen vorhanden</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Kein Verlauf vorhanden</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
