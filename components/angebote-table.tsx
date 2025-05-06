"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Copy, Search, FileText, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { IconButton } from "@/components/icon-button"

// Update the data structure to include version history
// Replace the initialAngebote array with this enhanced version

const initialAngebote = [
  {
    id: "1000",
    currentVersion: "V1",
    title: "Büroausstattung",
    kunde: "Schüller Möbelwerk KG",
    datum: "2023-01-15",
    status: "Entwurf",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-15",
        publishedBy: "Enrica Pietig",
        status: "Entwurf",
        content: {
          title: "Büroausstattung",
          beschreibung: "Dieses Angebot umfasst die Lieferung von Büroausstattung gemäß den Anforderungen des Kunden.",
          blocks: ["block-1", "block-2", "block-3"],
          positions: [
            { id: "pos-1", name: "Bürostühle", menge: 5, einzelpreis: 299.99, gesamtpreis: 1499.95 },
            { id: "pos-2", name: "Schreibtische", menge: 5, einzelpreis: 499.99, gesamtpreis: 2499.95 },
            { id: "pos-3", name: "Aktenschränke", menge: 2, einzelpreis: 379.99, gesamtpreis: 759.98 },
          ],
        },
      },
    ],
  },
  {
    id: "1000",
    currentVersion: "V2",
    title: "Büroausstattung (Alternative)",
    kunde: "Schüller Möbelwerk KG",
    datum: "2023-01-18",
    status: "Veröffentlicht",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-15",
        publishedBy: "Enrica Pietig",
        status: "Entwurf",
        content: {
          title: "Büroausstattung",
          beschreibung: "Dieses Angebot umfasst die Lieferung von Büroausstattung gemäß den Anforderungen des Kunden.",
          blocks: ["block-1", "block-2", "block-3"],
          positions: [
            { id: "pos-1", name: "Bürostühle", menge: 5, einzelpreis: 299.99, gesamtpreis: 1499.95 },
            { id: "pos-2", name: "Schreibtische", menge: 5, einzelpreis: 499.99, gesamtpreis: 2499.95 },
            { id: "pos-3", name: "Aktenschränke", menge: 2, einzelpreis: 379.99, gesamtpreis: 759.98 },
          ],
        },
      },
      {
        versionNumber: "V2",
        publishedAt: "2023-01-18",
        publishedBy: "Enrica Pietig",
        status: "Veröffentlicht",
        content: {
          title: "Büroausstattung (Alternative)",
          beschreibung:
            "Dieses Angebot umfasst die Lieferung von alternativer Büroausstattung gemäß den Anforderungen des Kunden.",
          blocks: ["block-1", "block-2", "block-3"],
          positions: [
            { id: "pos-1", name: "Bürostühle (Premium)", menge: 5, einzelpreis: 399.99, gesamtpreis: 1999.95 },
            {
              id: "pos-2",
              name: "Schreibtische (Höhenverstellbar)",
              menge: 5,
              einzelpreis: 699.99,
              gesamtpreis: 3499.95,
            },
            { id: "pos-3", name: "Aktenschränke", menge: 2, einzelpreis: 379.99, gesamtpreis: 759.98 },
          ],
        },
      },
    ],
  },
  {
    id: "1001",
    currentVersion: "V1",
    title: "IT-Infrastruktur Upgrade",
    kunde: "TechGiant GmbH",
    datum: "2023-01-22",
    status: "Veröffentlicht",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-22",
        publishedBy: "Enrica Pietig",
        status: "Veröffentlicht",
        content: {
          title: "IT-Infrastruktur Upgrade",
          beschreibung: "Dieses Angebot umfasst das Upgrade der IT-Infrastruktur.",
          blocks: ["block-1", "block-2", "block-3"],
          positions: [
            { id: "pos-1", name: "Server", menge: 2, einzelpreis: 2999.99, gesamtpreis: 5999.98 },
            { id: "pos-2", name: "Netzwerk-Switches", menge: 4, einzelpreis: 599.99, gesamtpreis: 2399.96 },
            { id: "pos-3", name: "Installation", menge: 1, einzelpreis: 1500.0, gesamtpreis: 1500.0 },
          ],
        },
      },
    ],
  },
  {
    id: "1002",
    currentVersion: "V1",
    title: "Wartungsvertrag",
    kunde: "Global Services AG",
    datum: "2023-01-25",
    status: "Entwurf",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-25",
        publishedBy: "Enrica Pietig",
        status: "Entwurf",
        content: {
          title: "Wartungsvertrag",
          beschreibung: "Dieses Angebot umfasst einen jährlichen Wartungsvertrag.",
          blocks: ["block-1", "block-3"],
          positions: [
            { id: "pos-1", name: "Jährliche Wartung", menge: 1, einzelpreis: 5000.0, gesamtpreis: 5000.0 },
            { id: "pos-2", name: "24/7 Support", menge: 1, einzelpreis: 3000.0, gesamtpreis: 3000.0 },
          ],
        },
      },
    ],
  },
  {
    id: "1003",
    currentVersion: "V3",
    title: "Softwarelizenzen",
    kunde: "Innovate Solutions GmbH",
    datum: "2023-01-28",
    status: "Veröffentlicht",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-26",
        publishedBy: "Enrica Pietig",
        status: "Entwurf",
        content: {
          title: "Softwarelizenzen",
          beschreibung: "Dieses Angebot umfasst Softwarelizenzen für 10 Benutzer.",
          blocks: ["block-1", "block-2"],
          positions: [{ id: "pos-1", name: "Office-Lizenzen", menge: 10, einzelpreis: 150.0, gesamtpreis: 1500.0 }],
        },
      },
      {
        versionNumber: "V2",
        publishedAt: "2023-01-27",
        publishedBy: "Enrica Pietig",
        status: "Entwurf",
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
        versionNumber: "V3",
        publishedAt: "2023-01-28",
        publishedBy: "Enrica Pietig",
        status: "Veröffentlicht",
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
    ],
  },
  {
    id: "1003",
    currentVersion: "V1",
    title: "Softwarelizenzen (Alternative)",
    kunde: "Innovate Solutions GmbH",
    datum: "2023-01-30",
    status: "Auftragsbestätigung",
    versions: [
      {
        versionNumber: "V1",
        publishedAt: "2023-01-30",
        publishedBy: "Enrica Pietig",
        status: "Auftragsbestätigung",
        content: {
          title: "Softwarelizenzen (Alternative)",
          beschreibung: "Dieses Angebot umfasst alternative Softwarelizenzen für 20 Benutzer.",
          blocks: ["block-1", "block-2"],
          positions: [
            { id: "pos-1", name: "Open Source Office-Paket", menge: 20, einzelpreis: 50.0, gesamtpreis: 1000.0 },
            { id: "pos-2", name: "Antivirensoftware (Enterprise)", menge: 20, einzelpreis: 60.0, gesamtpreis: 1200.0 },
            { id: "pos-3", name: "Cloud-Projektmanagement", menge: 20, einzelpreis: 15.0, gesamtpreis: 300.0 },
          ],
        },
      },
    ],
  },
]

export function AngeboteTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [angebote, setAngebote] = useState(initialAngebote)
  const [angebotToDelete, setAngebotToDelete] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<string | null>(null)

  // Gruppiere Angebote nach ihrer Original-ID und wähle nur die neueste Version
  const groupedAngebote = angebote.reduce((acc, angebot) => {
    if (!acc[angebot.id]) {
      acc[angebot.id] = []
    }
    acc[angebot.id].push(angebot)
    return acc
  }, {})

  // Wähle für jede Gruppe nur die neueste Version (höchste Versionsnummer)
  const latestVersions = Object.values(groupedAngebote).map((group: any[]) => {
    return group.reduce((latest, current) => {
      const latestVersion = Number.parseInt(latest.currentVersion.replace("V", ""))
      const currentVersion = Number.parseInt(current.currentVersion.replace("V", ""))
      return currentVersion > latestVersion ? current : latest
    })
  })

  // Filtere und mappe die neuesten Versionen
  const filteredAngebote = latestVersions
    .filter((angebot: any) => {
      const matchesSearch =
        angebot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        angebot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        angebot.kunde.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || angebot.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .map((angebot: any) => ({
      id: `${angebot.id}${angebot.currentVersion.replace("V", "")}`,
      title: angebot.title,
      kunde: angebot.kunde,
      datum: angebot.datum,
      status: angebot.status,
      version: angebot.currentVersion,
      originalId: angebot.id,
      versionData: angebot,
    }))

  const handleDeleteAngebot = (id: string) => {
    setAngebotToDelete(id)
  }

  const confirmDelete = () => {
    if (angebotToDelete) {
      setAngebote(
        angebote.filter((angebot) => `${angebot.id}${angebot.currentVersion.replace("V", "")}` !== angebotToDelete),
      )
      setAngebotToDelete(null)
    }
  }

  // Update the handleCopyAngebot function to handle versioning
  const handleCopyAngebot = (id: string) => {
    const displayId = id
    const angebotToCopy = angebote.find(
      (angebot) => `${angebot.id}${angebot.currentVersion.replace("V", "")}` === displayId,
    )

    if (angebotToCopy) {
      // Generate a new ID
      const lastAngebotId = Math.max(...angebote.map((a) => Number.parseInt(a.id)))
      const newId = (lastAngebotId + 1).toString()

      // Create a new angebot with the first version
      const latestVersion = angebotToCopy.versions.find((v) => v.versionNumber === angebotToCopy.currentVersion)
      if (!latestVersion) return

      const newAngebot = {
        id: newId,
        currentVersion: "V1",
        title: `${angebotToCopy.title} (Kopie)`,
        kunde: angebotToCopy.kunde,
        datum: new Date().toISOString().split("T")[0],
        status: "Entwurf",
        versions: [
          {
            versionNumber: "V1",
            publishedAt: new Date().toISOString().split("T")[0],
            publishedBy: "Enrica Pietig",
            status: "Entwurf",
            content: {
              ...latestVersion.content,
              title: `${latestVersion.content.title} (Kopie)`,
            },
          },
        ],
      }

      setAngebote([...angebote, newAngebot])
    }
  }

  const handlePreview = (id: string) => {
    setShowPreview(id)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Angebote durchsuchen..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="Entwurf">Entwurf</SelectItem>
              <SelectItem value="Veröffentlicht">Veröffentlicht</SelectItem>
              <SelectItem value="Auftragsbestätigung">Auftragsbestätigung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Angebots-Nr.</TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAngebote.map((angebot) => (
                <TableRow key={angebot.id}>
                  <TableCell className="font-medium">{angebot.id}</TableCell>
                  <TableCell>{angebot.title}</TableCell>
                  <TableCell>{angebot.kunde}</TableCell>
                  <TableCell>{new Date(angebot.datum).toLocaleDateString("de-DE")}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      angebot.status === "Entwurf"
                        ? "bg-gray-100 text-gray-800"
                        : angebot.status === "Veröffentlicht"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
                    >
                      {angebot.status}
                    </span>
                  </TableCell>
                  <TableCell>{angebot.version}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <IconButton icon={Edit} label="Bearbeiten" asChild href={`/angebote/${angebot.originalId}`} />
                      <IconButton icon={Copy} label="Kopieren" onClick={() => handleCopyAngebot(angebot.id)} />
                      <IconButton icon={FileText} label="Vorschau" onClick={() => handlePreview(angebot.id)} />
                      <IconButton
                        icon={Trash}
                        label="Löschen"
                        onClick={() => handleDeleteAngebot(angebot.id)}
                        disabled={angebot.status === "Auftragsbestätigung"}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={!!angebotToDelete} onOpenChange={(open) => !open && setAngebotToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Angebot löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Angebot löschen möchten? Diese Aktion kann nicht rückgängig gemacht
                werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!showPreview} onOpenChange={(open) => !open && setShowPreview(null)}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Angebotsvorschau</AlertDialogTitle>
              <AlertDialogDescription>Vorschau des Angebots {showPreview}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[70vh] overflow-auto border rounded p-4">
              {showPreview && (
                <div className="space-y-6">
                  <div className="flex justify-between">
                    <div>
                      <img src="/generic-company-logo.png" alt="Venjakob Logo" className="h-12" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold">ANGEBOT</h2>
                      <p>Nr. {showPreview}</p>
                      <p>Datum: {new Date().toLocaleDateString("de-DE")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div>
                      <h3 className="font-bold text-sm">Anbieter:</h3>
                      <p>Venjakob GmbH & Co. KG</p>
                      <p>Industriestraße 1</p>
                      <p>33397 Rheda-Wiedenbrück</p>
                      <p>Deutschland</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Kunde:</h3>
                      <p>Schüller Möbelwerk KG</p>
                      <p>Rother Straße 1</p>
                      <p>91567 Herrieden</p>
                      <p>Deutschland</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xl font-bold">Büroausstattung</h2>
                    <p className="mt-2">
                      Dieses Angebot umfasst die Lieferung von Büroausstattung gemäß den Anforderungen des Kunden.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold">Einleitung</h3>
                    <p className="mt-2">
                      Sehr geehrter Herr Mustermann,
                      <br />
                      <br />
                      vielen Dank für Ihr Interesse an unseren Produkten. Wir freuen uns, Ihnen folgendes Angebot
                      unterbreiten zu können.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold">Produkte</h3>
                    <table className="w-full mt-2 border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Position</th>
                          <th className="text-center py-2">Menge</th>
                          <th className="text-center py-2">Einheit</th>
                          <th className="text-right py-2">Einzelpreis</th>
                          <th className="text-right py-2">Gesamtpreis</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Bürostühle</td>
                          <td className="text-center py-2">5</td>
                          <td className="text-center py-2">Stück</td>
                          <td className="text-right py-2">299,99 €</td>
                          <td className="text-right py-2">1.499,95 €</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Schreibtische</td>
                          <td className="text-center py-2">5</td>
                          <td className="text-center py-2">Stück</td>
                          <td className="text-right py-2">499,99 €</td>
                          <td className="text-right py-2">2.499,95 €</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Aktenschränke</td>
                          <td className="text-center py-2">2</td>
                          <td className="text-center py-2">Stück</td>
                          <td className="text-right py-2">379,99 €</td>
                          <td className="text-right py-2">759,98 €</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="text-right py-2 font-bold">
                            Zwischensumme:
                          </td>
                          <td className="text-right py-2">4.759,88 €</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-right py-2">
                            MwSt. (19%):
                          </td>
                          <td className="text-right py-2">904,38 €</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-right py-2 font-bold">
                            Gesamtsumme:
                          </td>
                          <td className="text-right py-2 font-bold">5.664,26 €</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <Button variant="outline">PDF herunterladen</Button>
              <AlertDialogCancel>Schließen</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
