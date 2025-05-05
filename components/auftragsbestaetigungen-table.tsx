"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, FileText } from "lucide-react"

// Mock data
const auftragsbestaetigungen = [
  {
    id: "AB-2023-001",
    angebotsnr: "1003B-V1",
    kunde: "Innovate Solutions GmbH",
    titel: "Softwarelizenzen (Alternative)",
    datum: "2023-01-30",
    betrag: 5664.26,
    verkaufschance: "VC-004",
  },
  {
    id: "AB-2023-002",
    angebotsnr: "998A-V2",
    kunde: "Musterfirma GmbH",
    titel: "Serverausstattung",
    datum: "2023-01-25",
    betrag: 12500.0,
    verkaufschance: "VC-000",
  },
]

export function AuftragsbestaetigungenTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAuftragsbestaetigungen = auftragsbestaetigungen.filter((ab) => {
    return (
      ab.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ab.angebotsnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ab.kunde.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ab.titel.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Auftragsbestätigungen durchsuchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>AB-Nr.</TableHead>
              <TableHead>Angebots-Nr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Betrag (€)</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAuftragsbestaetigungen.map((ab) => (
              <TableRow key={ab.id}>
                <TableCell className="font-medium">{ab.id}</TableCell>
                <TableCell>{ab.angebotsnr}</TableCell>
                <TableCell>{ab.kunde}</TableCell>
                <TableCell>{ab.titel}</TableCell>
                <TableCell>{new Date(ab.datum).toLocaleDateString("de-DE")}</TableCell>
                <TableCell>{ab.betrag.toLocaleString("de-DE")} €</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/auftragsbestatigungen/${ab.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Details</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">PDF anzeigen</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
