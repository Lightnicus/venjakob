"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AngebotBlockTree } from "./angebot-block-tree"
import { AngebotKalkulation } from "./angebot-kalkulation"
import { AngebotVorschau } from "./angebot-vorschau"
import { AngebotVersionen } from "./angebot-versionen"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export interface Angebot {
  id?: string
  titel: string
  beschreibung: string
  kunde: string
  status: string
  erstelltAm?: string
  gueltigBis?: string
  gesamtpreis?: number
  waehrung?: string
  sprache?: string
  blocks?: any[]
  versionen?: any[]
}

interface AngebotEditorProps {
  angebot?: Angebot
  isNew?: boolean
  onSave?: (angebot: Angebot) => void
  onChange?: (angebot: Angebot) => void
}

export function AngebotEditor({ angebot: initialAngebot, isNew = false, onSave, onChange }: AngebotEditorProps) {
  const [angebot, setAngebot] = useState<Angebot>(
    initialAngebot || {
      titel: "",
      beschreibung: "",
      kunde: "",
      status: "Entwurf",
      erstelltAm: new Date().toISOString().split("T")[0],
      gueltigBis: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      gesamtpreis: 0,
      waehrung: "EUR",
      sprache: "Deutsch",
      blocks: [],
      versionen: [],
    },
  )

  const [activeTab, setActiveTab] = useState("details")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (initialAngebot) {
      setAngebot(initialAngebot)
    }
  }, [initialAngebot])

  const handleChange = (field: keyof Angebot, value: any) => {
    const updatedAngebot = { ...angebot, [field]: value }
    setAngebot(updatedAngebot)
    if (onChange) {
      onChange(updatedAngebot)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(angebot)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleBlocksChange = (blocks: any[]) => {
    handleChange("blocks", blocks)
  }

  const handleCancel = () => {
    router.push("/angebote")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isNew ? "Neues Angebot erstellen" : `Angebot: ${angebot.titel}`}</h1>
        <div className="space-x-2">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </div>
          {!isNew && <Button variant="outline">PDF exportieren</Button>}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="blocks">Blöcke</TabsTrigger>
          <TabsTrigger value="kalkulation">Kalkulation</TabsTrigger>
          <TabsTrigger value="vorschau">Vorschau</TabsTrigger>
          {!isNew && <TabsTrigger value="versionen">Versionen</TabsTrigger>}
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Angebotsinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titel">Titel</Label>
                  <Input id="titel" value={angebot.titel} onChange={(e) => handleChange("titel", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kunde">Kunde</Label>
                  <Input id="kunde" value={angebot.kunde} onChange={(e) => handleChange("kunde", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beschreibung">Beschreibung</Label>
                <Textarea
                  id="beschreibung"
                  value={angebot.beschreibung}
                  onChange={(e) => handleChange("beschreibung", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={angebot.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entwurf">Entwurf</SelectItem>
                      <SelectItem value="Gesendet">Gesendet</SelectItem>
                      <SelectItem value="Akzeptiert">Akzeptiert</SelectItem>
                      <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erstelltAm">Erstellt am</Label>
                  <Input
                    id="erstelltAm"
                    type="date"
                    value={angebot.erstelltAm}
                    onChange={(e) => handleChange("erstelltAm", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gueltigBis">Gültig bis</Label>
                  <Input
                    id="gueltigBis"
                    type="date"
                    value={angebot.gueltigBis}
                    onChange={(e) => handleChange("gueltigBis", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waehrung">Währung</Label>
                  <Select value={angebot.waehrung} onValueChange={(value) => handleChange("waehrung", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Währung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprache">Sprache</Label>
                  <Select value={angebot.sprache} onValueChange={(value) => handleChange("sprache", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sprache wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deutsch">Deutsch</SelectItem>
                      <SelectItem value="Englisch">Englisch</SelectItem>
                      <SelectItem value="Französisch">Französisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Angebotsblöcke</CardTitle>
            </CardHeader>
            <CardContent>
              <AngebotBlockTree blocks={angebot.blocks || []} onChange={handleBlocksChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kalkulation">
          <Card>
            <CardHeader>
              <CardTitle>Angebotskalkulation</CardTitle>
            </CardHeader>
            <CardContent>
              <AngebotKalkulation
                blocks={angebot.blocks || []}
                onChange={handleBlocksChange}
                waehrung={angebot.waehrung || "EUR"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vorschau">
          <Card>
            <CardHeader>
              <CardTitle>Angebotsvorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <AngebotVorschau angebot={angebot} />
            </CardContent>
          </Card>
        </TabsContent>

        {!isNew && (
          <TabsContent value="versionen">
            <Card>
              <CardHeader>
                <CardTitle>Angebotsversionen</CardTitle>
              </CardHeader>
              <CardContent>
                <AngebotVersionen angebotId={angebot.id || ""} versionen={angebot.versionen || []} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
