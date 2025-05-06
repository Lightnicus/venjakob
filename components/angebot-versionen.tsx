"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock version data
const versionHistory = [
  {
    version: "V3",
    publishedAt: "2023-01-28",
    publishedBy: "Enrica Pietig",
    status: "Veröffentlicht",
    changeTitle: "Erweiterung um Projektmanagement-Software",
    changeDescription:
      "Hinzufügen von Projektmanagement-Software für 5 Benutzer und Preisanpassung für bestehende Positionen.",
    content: {
      title: "Softwarelizenzen",
      beschreibung: "Dieses Angebot umfasst Softwarelizenzen für 20 Benutzer.",
      blocks: ["block-1", "block-2"],
      positions: [
        { id: "pos-1", name: "Office-Lizenzen", menge: 20, einzelpreis: 145.0, gesamtpreis: 2900.0 },
        { id: "pos-2", name: "Antivirensoftware", menge: 20, einzelpreis: 45.0, gesamtpreis: 900.0 },
        { id: "pos-3", name: "Projektmanagement-Software", menge: 5, einzelpreis: 200.0, gesamtpreis: 1000.0 },
      ],
    },
  },
  {
    version: "V2",
    publishedAt: "2023-01-27",
    publishedBy: "Enrica Pietig",
    status: "Entwurf",
    changeTitle: "Erhöhung der Benutzeranzahl und Antivirensoftware",
    changeDescription: "Erhöhung der Benutzeranzahl von 10 auf 15 und Hinzufügen von Antivirensoftware.",
    content: {
      title: "Softwarelizenzen",
      beschreibung: "Dieses Angebot umfasst Softwarelizenzen für 15 Benutzer.",
      blocks: ["block-1", "block-2"],
      positions: [
        { id: "pos-1", name: "Office-Lizenzen", menge: 15, einzelpreis: 150.0, gesamtpreis: 2250.0 },
        { id: "pos-2", name: "Antivirensoftware", menge: 15, einzelpreis: 50.0, gesamtpreis: 750.0 },
      ],
    },
  },
  {
    version: "V1",
    publishedAt: "2023-01-26",
    publishedBy: "Enrica Pietig",
    status: "Entwurf",
    changeTitle: "Initiale Version",
    changeDescription: "Erste Version des Angebots für Softwarelizenzen.",
    content: {
      title: "Softwarelizenzen",
      beschreibung: "Dieses Angebot umfasst Softwarelizenzen für 10 Benutzer.",
      blocks: ["block-1", "block-2"],
      positions: [{ id: "pos-1", name: "Office-Lizenzen", menge: 10, einzelpreis: 150.0, gesamtpreis: 1500.0 }],
    },
  },
]

interface AngebotVersionenProps {
  versions: any[]
  offerId: string
  onViewVersion?: (versionNumber: string) => void
}

export function AngebotVersionen({ versions = versionHistory, offerId, onViewVersion }: AngebotVersionenProps) {
  const [showVersionDetails, setShowVersionDetails] = useState<string | null>(null)
  const [compareVersions, setCompareVersions] = useState<boolean>(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState<boolean>(false)

  const handleVersionSelect = (version: string) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter((v) => v !== version))
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, version])
      } else {
        // Replace the oldest selected version
        setSelectedVersions([selectedVersions[1], version])
      }
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setShowComparison(true)
    }
  }

  const getVersionDetails = (version: string) => {
    return versionHistory.find((v) => v.version === version)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Entwurf":
        return <Badge variant="outline">Entwurf</Badge>
      case "Veröffentlicht":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Veröffentlicht</Badge>
      case "Auftragsbestätigung":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Auftragsbestätigung</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Versionsverlauf</h3>
        <div className="flex gap-2">
          {!compareVersions ? (
            <Button size="sm" variant="outline" onClick={() => setCompareVersions(true)}>
              Versionen vergleichen
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCompareVersions(false)
                  setSelectedVersions([])
                }}
              >
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleCompare} disabled={selectedVersions.length !== 2}>
                {selectedVersions.length === 2 ? "Vergleichen" : `${selectedVersions.length}/2 ausgewählt`}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {compareVersions && <TableHead className="w-[50px]">Auswahl</TableHead>}
              <TableHead>Version</TableHead>
              <TableHead>Änderungstitel</TableHead>
              <TableHead>Veröffentlicht am</TableHead>
              <TableHead>Veröffentlicht von</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versionHistory.map((version) => (
              <TableRow key={version.version}>
                {compareVersions && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.version)}
                      onChange={() => handleVersionSelect(version.version)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{version.version}</TableCell>
                <TableCell>{version.changeTitle}</TableCell>
                <TableCell>{new Date(version.publishedAt).toLocaleDateString("de-DE")}</TableCell>
                <TableCell>{version.publishedBy}</TableCell>
                <TableCell>{getStatusBadge(version.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowVersionDetails(version.version)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Details</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onViewVersion(version.version)}>
                      Bearbeiten
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Version Details Dialog */}
      <Dialog open={!!showVersionDetails} onOpenChange={(open) => !open && setShowVersionDetails(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version {showVersionDetails} Details</DialogTitle>
            <DialogDescription>
              {showVersionDetails && getVersionDetails(showVersionDetails)?.changeTitle}
            </DialogDescription>
          </DialogHeader>

          {showVersionDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Veröffentlicht am</h4>
                  <p>
                    {new Date(getVersionDetails(showVersionDetails)?.publishedAt || "").toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Veröffentlicht von</h4>
                  <p>{getVersionDetails(showVersionDetails)?.publishedBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getStatusBadge(getVersionDetails(showVersionDetails)?.status || "")}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Änderungsbeschreibung</h4>
                <p className="mt-1">{getVersionDetails(showVersionDetails)?.changeDescription}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium">Angebotsinhalte</h4>
                <div className="mt-2">
                  <h5 className="text-sm font-medium">Titel</h5>
                  <p>{getVersionDetails(showVersionDetails)?.content.title}</p>
                </div>
                <div className="mt-2">
                  <h5 className="text-sm font-medium">Beschreibung</h5>
                  <p>{getVersionDetails(showVersionDetails)?.content.beschreibung}</p>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium">Positionen</h5>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Menge</TableHead>
                        <TableHead>Einzelpreis (€)</TableHead>
                        <TableHead>Gesamtpreis (€)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getVersionDetails(showVersionDetails)?.content.positions.map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell>{pos.name}</TableCell>
                          <TableCell>{pos.menge}</TableCell>
                          <TableCell>{pos.einzelpreis.toFixed(2)}</TableCell>
                          <TableCell>{pos.gesamtpreis.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDetails(null)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Versionsvergleich</DialogTitle>
            <DialogDescription>
              Vergleich zwischen Version {selectedVersions[0]} und Version {selectedVersions[1]}
            </DialogDescription>
          </DialogHeader>

          {selectedVersions.length === 2 && (
            <div className="space-y-6">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="positions">Positionen</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-center">
                      <h4 className="font-medium">Version {selectedVersions[0]}</h4>
                      <p className="text-sm text-gray-500">
                        {getVersionDetails(selectedVersions[0])?.publishedAt &&
                          new Date(getVersionDetails(selectedVersions[0])?.publishedAt || "").toLocaleDateString(
                            "de-DE",
                          )}
                      </p>
                    </div>
                    <div className="col-span-1 text-center">
                      <h4 className="font-medium">Änderungen</h4>
                    </div>
                    <div className="col-span-1 text-center">
                      <h4 className="font-medium">Version {selectedVersions[1]}</h4>
                      <p className="text-sm text-gray-500">
                        {getVersionDetails(selectedVersions[1])?.publishedAt &&
                          new Date(getVersionDetails(selectedVersions[1])?.publishedAt || "").toLocaleDateString(
                            "de-DE",
                          )}
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <div className="grid grid-cols-3 gap-4 p-4 border-b">
                      <div className="col-span-1">
                        <p>{getVersionDetails(selectedVersions[0])?.content.title}</p>
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        {getVersionDetails(selectedVersions[0])?.content.title !==
                        getVersionDetails(selectedVersions[1])?.content.title ? (
                          <ArrowRight className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="col-span-1">
                        <p>{getVersionDetails(selectedVersions[1])?.content.title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 border-b">
                      <div className="col-span-1">
                        <p>{getVersionDetails(selectedVersions[0])?.content.beschreibung}</p>
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        {getVersionDetails(selectedVersions[0])?.content.beschreibung !==
                        getVersionDetails(selectedVersions[1])?.content.beschreibung ? (
                          <ArrowRight className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="col-span-1">
                        <p>{getVersionDetails(selectedVersions[1])?.content.beschreibung}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4">
                      <div className="col-span-1">
                        <p>Anzahl Positionen: {getVersionDetails(selectedVersions[0])?.content.positions.length}</p>
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        {getVersionDetails(selectedVersions[0])?.content.positions.length !==
                        getVersionDetails(selectedVersions[1])?.content.positions.length ? (
                          <ArrowRight className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="col-span-1">
                        <p>Anzahl Positionen: {getVersionDetails(selectedVersions[1])?.content.positions.length}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="positions" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Version {selectedVersions[0]}</TableHead>
                        <TableHead>Änderung</TableHead>
                        <TableHead>Version {selectedVersions[1]}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Combine positions from both versions for comparison */}
                      {Array.from(
                        new Set([
                          ...(getVersionDetails(selectedVersions[0])?.content.positions.map((p) => p.name) || []),
                          ...(getVersionDetails(selectedVersions[1])?.content.positions.map((p) => p.name) || []),
                        ]),
                      ).map((posName) => {
                        const pos0 = getVersionDetails(selectedVersions[0])?.content.positions.find(
                          (p) => p.name === posName,
                        )
                        const pos1 = getVersionDetails(selectedVersions[1])?.content.positions.find(
                          (p) => p.name === posName,
                        )

                        return (
                          <TableRow key={posName}>
                            <TableCell>{posName}</TableCell>
                            <TableCell>
                              {pos0 ? (
                                <div>
                                  <p>Menge: {pos0.menge}</p>
                                  <p>Einzelpreis: {pos0.einzelpreis.toFixed(2)} €</p>
                                  <p>Gesamtpreis: {pos0.gesamtpreis.toFixed(2)} €</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Nicht vorhanden</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!pos0 ? (
                                <Badge className="bg-green-100 text-green-800">Neu</Badge>
                              ) : !pos1 ? (
                                <Badge className="bg-red-100 text-red-800">Entfernt</Badge>
                              ) : pos0.menge !== pos1.menge ||
                                pos0.einzelpreis !== pos1.einzelpreis ||
                                pos0.gesamtpreis !== pos1.gesamtpreis ? (
                                <Badge className="bg-amber-100 text-amber-800">Geändert</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Unverändert</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {pos1 ? (
                                <div>
                                  <p>Menge: {pos1.menge}</p>
                                  <p>Einzelpreis: {pos1.einzelpreis.toFixed(2)} €</p>
                                  <p>Gesamtpreis: {pos1.gesamtpreis.toFixed(2)} €</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Nicht vorhanden</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowComparison(false)
                setCompareVersions(false)
                setSelectedVersions([])
              }}
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
