"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

export function AngebotVorschau() {
  const [language, setLanguage] = useState("de")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Angebotsvorschau</h3>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sprache wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="en">Englisch</SelectItem>
              <SelectItem value="fr">Französisch</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white p-4 min-h-[600px] flex flex-col items-center">
        <div className="w-full max-w-[800px] border border-gray-200 min-h-[600px] shadow-sm">
          {/* PDF Preview mockup */}
          <div className="p-8 space-y-6">
            <div className="flex justify-between">
              <div>
                <img src="/generic-company-logo.png" alt="Venjakob Logo" className="h-12" />
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">ANGEBOT</h2>
                <p>Nr. 1000A-V1</p>
                <p>Datum: 15.01.2023</p>
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
                vielen Dank für Ihr Interesse an unseren Produkten. Wir freuen uns, Ihnen folgendes Angebot unterbreiten
                zu können.
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

            <div className="mt-8">
              <h3 className="font-bold">Bedingungen und Konditionen</h3>
              <p className="mt-2">
                <strong>Zahlungsbedingungen:</strong> 30 Tage netto
                <br />
                <strong>Lieferzeit:</strong> 4-6 Wochen nach Auftragsbestätigung
                <br />
                <strong>Gültigkeit:</strong> Dieses Angebot ist gültig bis zum 15.03.2023
              </p>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
              <p>Dieses Angebot wurde elektronisch erstellt und ist ohne Unterschrift gültig.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
