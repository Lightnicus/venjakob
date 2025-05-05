"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AngebotVersionViewProps {
  version: any
  onBack: () => void
}

export function AngebotVersionView({ version, onBack }: AngebotVersionViewProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>Version nicht gefunden</p>
        <Button onClick={onBack} className="mt-4">
          Zurück
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold tracking-tight ml-4">Angebot: Version {version.versionNumber}</h1>
          <Badge className="ml-2">{version.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPdfPreview(true)}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Vorschau
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            PDF herunterladen
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Versionsinformationen</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-500">Titel:</div>
                <div>{version.content?.title || version.title}</div>

                <div className="text-sm font-medium text-gray-500">Änderungstitel:</div>
                <div>{version.changeTitle || "Keine Angabe"}</div>

                <div className="text-sm font-medium text-gray-500">Veröffentlicht am:</div>
                <div>{new Date(version.publishedAt).toLocaleDateString("de-DE")}</div>

                <div className="text-sm font-medium text-gray-500">Veröffentlicht von:</div>
                <div>{version.publishedBy}</div>

                <div className="text-sm font-medium text-gray-500">Status:</div>
                <div>{version.status}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Änderungsbeschreibung</h3>
              <p className="text-gray-700">{version.changeDescription || "Keine Beschreibung vorhanden."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Angebotsinhalte</h3>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Beschreibung</h4>
            <p className="text-gray-700">
              {version.content?.beschreibung || version.description || "Keine Beschreibung vorhanden."}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Positionen</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Menge</TableHead>
                  <TableHead>Einheit</TableHead>
                  <TableHead className="text-right">Einzelpreis (€)</TableHead>
                  <TableHead className="text-right">Gesamtpreis (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(version.content?.positions || version.positions || []).map((pos: any) => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.name}</TableCell>
                    <TableCell className="text-right">{pos.menge || pos.quantity}</TableCell>
                    <TableCell>{pos.unit || "Stück"}</TableCell>
                    <TableCell className="text-right">{(pos.einzelpreis || pos.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(pos.gesamtpreis || pos.totalPrice).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right py-2 font-bold">
                    Gesamtsumme:
                  </td>
                  <td className="text-right py-2 font-bold">
                    {(version.content?.positions || version.positions || [])
                      .reduce((sum: number, pos: any) => sum + (pos.gesamtpreis || pos.totalPrice), 0)
                      .toFixed(2)}{" "}
                    €
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">PDF Vorschau</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPdfPreview(false)}>
                Schließen
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-gray-100 p-8 min-h-full">
                <div className="bg-white p-8 shadow-md mx-auto max-w-4xl">
                  <div className="flex justify-between">
                    <div>
                      <img src="/generic-company-logo.png" alt="Company Logo" className="h-12" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold">ANGEBOT</h2>
                      <p>Version: {version.versionNumber}</p>
                      <p>Datum: {new Date(version.publishedAt).toLocaleDateString("de-DE")}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-8">
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
                    <h2 className="text-xl font-bold">{version.content?.title || version.title}</h2>
                    <p className="mt-2">{version.content?.beschreibung || version.description}</p>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold">Positionen</h3>
                    <table className="w-full mt-4 border-collapse">
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
                        {(version.content?.positions || version.positions || []).map((pos: any) => (
                          <tr key={pos.id} className="border-b">
                            <td className="py-2">{pos.name}</td>
                            <td className="text-center py-2">{pos.menge || pos.quantity}</td>
                            <td className="text-center py-2">{pos.unit || "Stück"}</td>
                            <td className="text-right py-2">{(pos.einzelpreis || pos.unitPrice).toFixed(2)} €</td>
                            <td className="text-right py-2">{(pos.gesamtpreis || pos.totalPrice).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="text-right py-2 font-bold">
                            Zwischensumme:
                          </td>
                          <td className="text-right py-2">
                            {(version.content?.positions || version.positions || [])
                              .reduce((sum: number, pos: any) => sum + (pos.gesamtpreis || pos.totalPrice), 0)
                              .toFixed(2)}{" "}
                            €
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-right py-2">
                            MwSt. (19%):
                          </td>
                          <td className="text-right py-2">
                            {(
                              (version.content?.positions || version.positions || []).reduce(
                                (sum: number, pos: any) => sum + (pos.gesamtpreis || pos.totalPrice),
                                0,
                              ) * 0.19
                            ).toFixed(2)}{" "}
                            €
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="text-right py-2 font-bold">
                            Gesamtsumme:
                          </td>
                          <td className="text-right py-2 font-bold">
                            {(
                              (version.content?.positions || version.positions || []).reduce(
                                (sum: number, pos: any) => sum + (pos.gesamtpreis || pos.totalPrice),
                                0,
                              ) * 1.19
                            ).toFixed(2)}{" "}
                            €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-8">
                    <p>Wir freuen uns auf Ihre Rückmeldung.</p>
                    <p className="mt-4">Mit freundlichen Grüßen,</p>
                    <p className="mt-2">Venjakob GmbH & Co. KG</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
