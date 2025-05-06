"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchSalesOpportunityById } from "@/lib/crm-service"
import { LoadingSpinner } from "@/components/loading-spinner"

interface VerkaufschanceEditorProps {
  id: string
}

export function VerkaufschanceEditor({ id }: VerkaufschanceEditorProps) {
  const [verkaufschance, setVerkaufschance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadVerkaufschance()
  }, [id])

  const loadVerkaufschance = async () => {
    setIsLoading(true)
    try {
      const data = await fetchSalesOpportunityById(id)
      if (data) {
        setVerkaufschance(data)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVerkaufschance((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setVerkaufschance((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setVerkaufschance((prev: any) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In einer echten Anwendung würde hier ein API-Aufruf stehen
      // Für Entwicklungszwecke simulieren wir eine Speicheroperation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Erfolg",
        description: "Verkaufschance wurde erfolgreich aktualisiert",
      })

      router.push(`/verkaufschancen/${id}`)
    } catch (error) {
      console.error("Error saving sales opportunity:", error)
      toast({
        title: "Fehler",
        description: "Verkaufschance konnte nicht gespeichert werden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Verkaufschance bearbeiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="KEYWORD">Stichwort</Label>
                  <Input
                    id="KEYWORD"
                    name="KEYWORD"
                    value={verkaufschance.KEYWORD || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ACCOUNTINFORMATION">Kunde</Label>
                  <Input
                    id="ACCOUNTINFORMATION"
                    name="ACCOUNTINFORMATION"
                    value={verkaufschance.ACCOUNTINFORMATION || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="PERSONINCHARGE">Verantwortlicher</Label>
                  <Input
                    id="PERSONINCHARGE"
                    name="PERSONINCHARGE"
                    value={verkaufschance.PERSONINCHARGE || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="STATUS">Status</Label>
                  <Select
                    value={verkaufschance.STATUS || ""}
                    onValueChange={(value) => handleSelectChange("STATUS", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Neu">Neu</SelectItem>
                      <SelectItem value="In Bearbeitung">In Bearbeitung</SelectItem>
                      <SelectItem value="Angeboten">Angeboten</SelectItem>
                      <SelectItem value="Verhandlung">Verhandlung</SelectItem>
                      <SelectItem value="Gewonnen">Gewonnen</SelectItem>
                      <SelectItem value="Verloren">Verloren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="DISTRIBUTIONPHASE">Phase</Label>
                  <Select
                    value={verkaufschance.DISTRIBUTIONPHASE || ""}
                    onValueChange={(value) => handleSelectChange("DISTRIBUTIONPHASE", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Phase auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kontakt">Kontakt</SelectItem>
                      <SelectItem value="Anfrage">Anfrage</SelectItem>
                      <SelectItem value="Angebot">Angebot</SelectItem>
                      <SelectItem value="Verhandlung">Verhandlung</SelectItem>
                      <SelectItem value="Abschluss">Abschluss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="VJ_ANGEBOTSVOLUMEN">Volumen</Label>
                  <Input
                    id="VJ_ANGEBOTSVOLUMEN"
                    name="VJ_ANGEBOTSVOLUMEN"
                    type="number"
                    value={verkaufschance.VJ_ANGEBOTSVOLUMEN || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="CURRENCYNAT">Währung</Label>
                  <Select
                    value={verkaufschance.CURRENCYNAT || "EUR"}
                    onValueChange={(value) => handleSelectChange("CURRENCYNAT", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Währung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="VJ_LIEFERTERMIN">Liefertermin</Label>
                  <Input
                    id="VJ_LIEFERTERMIN"
                    name="VJ_LIEFERTERMIN"
                    type="date"
                    value={verkaufschance.VJ_LIEFERTERMIN ? verkaufschance.VJ_LIEFERTERMIN.split("T")[0] : ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="VJ_WAHRSCHEINLICHKEIT">Wahrscheinlichkeit (%)</Label>
                  <Input
                    id="VJ_WAHRSCHEINLICHKEIT"
                    name="VJ_WAHRSCHEINLICHKEIT"
                    type="number"
                    min="0"
                    max="100"
                    value={verkaufschance.VJ_WAHRSCHEINLICHKEIT || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="VJ_TESTNOTWENDIG"
                    checked={verkaufschance.VJ_TESTNOTWENDIG || false}
                    onCheckedChange={(checked) => handleSwitchChange("VJ_TESTNOTWENDIG", checked)}
                  />
                  <Label htmlFor="VJ_TESTNOTWENDIG">Test notwendig</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="VJ_GEHEIMHALTUNGSVEREINBARUNG"
                    checked={verkaufschance.VJ_GEHEIMHALTUNGSVEREINBARUNG || false}
                    onCheckedChange={(checked) => handleSwitchChange("VJ_GEHEIMHALTUNGSVEREINBARUNG", checked)}
                  />
                  <Label htmlFor="VJ_GEHEIMHALTUNGSVEREINBARUNG">Geheimhaltungsvereinbarung</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoadingSpinner className="mr-2" size={16} />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
