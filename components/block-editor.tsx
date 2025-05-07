"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {Save, Edit, Eye, Settings, X, Trash, ArrowLeft} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface BlockEditorProps {
  id: string
}

export function BlockEditor({ id }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState("beschreibung")
  const [editMode, setEditMode] = useState(false)
  const router = useRouter();

  // Mock data for a block
  const block = {
    id: id === "neu" ? "Neu" : id,
    bezeichnung: id === "neu" ? "" : "Einleitung",
    standard: id === "neu" ? false : true,
    verpflichtend: id === "neu" ? false : true,
    position: id === "neu" ? null : 1,
    ueberschriftDrucken: id === "neu" ? false : true,
    beschreibung: {
      de: id === "neu" ? "" : "Dieser Block enthält eine Einleitung zum Angebot und stellt das Unternehmen vor.",
      en: id === "neu" ? "" : "This block contains an introduction to the offer and presents the company.",
    },
    geaendertAm: id === "neu" ? new Date().toISOString() : "2023-03-06",
    geaendertVon: id === "neu" ? "Enrica Pietig" : "Enrica Pietig",
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleSave = () => {
    setEditMode(false)
    // In a real app, you would save the changes here
    // For example:
    // saveBlock(block).then(() => {
    //   toast({
    //     title: "Block gespeichert",
    //     description: "Der Block wurde erfolgreich gespeichert.",
    //   });
    // });
  }

  const handleCancel = () => {
    setEditMode(false)
    // In a real app, you would reset the form here
    // For example:
    // setBlock(originalBlock);
  }

  function handleReturn(): void {
      router.push('/bloecke');
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {id === "neu" ? "Neuer Block" : `Block: ${block.bezeichnung}`}
        </h1>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Abbrechen
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Last modified info */}
      <div className="text-sm text-gray-500">
        Zuletzt geändert am {new Date(block.geaendertAm).toLocaleDateString("de-DE")} von {block.geaendertVon}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg border shadow-sm">
        <TabsList className="border-b rounded-none p-0">
          <TabsTrigger
            value="beschreibung"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
          >
            <Eye className="h-4 w-4 mr-2" />
            Beschreibung
          </TabsTrigger>
          <TabsTrigger
            value="eigenschaften"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger
            value="vorschau"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beschreibung" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Beschreibung</h3>
              <Button variant="outline" size="sm" disabled={!editMode}>
                Sprache hinzufügen
              </Button>
            </div>

            {/* German description */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Deutsch</h4>
                  <Button variant="ghost" size="sm" disabled={!editMode}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Sprache löschen</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="de-ueberschrift">Überschrift</Label>
                    <Input id="de-ueberschrift" defaultValue="Einleitung" disabled={!editMode} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="de-beschreibung">Beschreibung</Label>
                    <div className={`border rounded-md p-2 min-h-[200px] bg-white ${!editMode ? "bg-gray-50" : ""}`}>
                      {editMode ? (
                        <>
                          <div className="flex gap-2 border-b pb-2 mb-2">
                            <Button variant="ghost" size="sm">
                              B
                            </Button>
                            <Button variant="ghost" size="sm">
                              I
                            </Button>
                            <Button variant="ghost" size="sm">
                              U
                            </Button>
                            <Button variant="ghost" size="sm">
                              Liste
                            </Button>
                            <Button variant="ghost" size="sm">
                              Tabelle
                            </Button>
                          </div>
                          <Textarea
                            id="de-beschreibung"
                            defaultValue={block.beschreibung.de}
                            className="min-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </>
                      ) : (
                        <div className="p-2">{block.beschreibung.de}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* English description */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Englisch</h4>
                  <Button variant="ghost" size="sm" disabled={!editMode}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Sprache löschen</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="en-ueberschrift">Überschrift</Label>
                    <Input id="en-ueberschrift" defaultValue="Introduction" disabled={!editMode} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="en-beschreibung">Beschreibung</Label>
                    <div className={`border rounded-md p-2 min-h-[200px] bg-white ${!editMode ? "bg-gray-50" : ""}`}>
                      {editMode ? (
                        <>
                          <div className="flex gap-2 border-b pb-2 mb-2">
                            <Button variant="ghost" size="sm">
                              B
                            </Button>
                            <Button variant="ghost" size="sm">
                              I
                            </Button>
                            <Button variant="ghost" size="sm">
                              U
                            </Button>
                            <Button variant="ghost" size="sm">
                              Liste
                            </Button>
                            <Button variant="ghost" size="sm">
                              Tabelle
                            </Button>
                          </div>
                          <Textarea
                            id="en-beschreibung"
                            defaultValue={block.beschreibung.en}
                            className="min-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </>
                      ) : (
                        <div className="p-2">{block.beschreibung.en}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eigenschaften" className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Eigenschaften</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bezeichnung">Bezeichnung</Label>
                <Input id="bezeichnung" defaultValue={block.bezeichnung} disabled={!editMode} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="standard" checked={block.standard} disabled={!editMode} />
                <Label htmlFor="standard">Standard (Block wird automatisch bei neuen Angeboten eingefügt)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="verpflichtend" checked={block.verpflichtend} disabled={!editMode || !block.standard} />
                <Label htmlFor="verpflichtend">
                  Verpflichtend (Block darf bei neuen Angeboten nicht gelöscht werden)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  defaultValue={block.position?.toString() || ""}
                  disabled={!editMode || !block.standard}
                  className="w-24"
                />
                <p className="text-sm text-gray-500">Definiert die Einfügeposition im Angebot</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="ueberschriftDrucken" checked={block.ueberschriftDrucken} disabled={!editMode} />
                <Label htmlFor="ueberschriftDrucken">Überschrift drucken</Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vorschau" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Vorschau</h3>
              <Select defaultValue="de">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-md bg-white p-6">
              <h2 className="text-xl font-bold mb-4">Einleitung</h2>
              <p>Dieser Block enthält eine Einleitung zum Angebot und stellt das Unternehmen vor.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
