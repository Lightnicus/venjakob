"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, Eye } from "lucide-react"

// Mock data
const verkaufschancen = [
  {
    id: "VC-001",
    gguid: "1F27A0B5-AEA4-48C2-8CD6-501301D63C5C",
    kunde: "Schüller Möbelwerk KG",
    stichwort: "Schüller Umbau 2024",
    status: "qualifiziert",
    phase: "Angebotsphase",
    volumen: 2500000.0,
    liefertermin: "2024-06-28",
    verantwortlicher: "RScharpenberg",
    wahrscheinlichkeit: 80,
    angebote: 2,
  },
  {
    id: "VC-002",
    gguid: "F61C5241-5384-4D4C-94F2-995F528CB1D5",
    kunde: "TechGiant GmbH",
    stichwort: "IT-Infrastruktur Upgrade",
    status: "qualifiziert",
    phase: "Angebotsphase",
    volumen: 150000.0,
    liefertermin: "2024-04-15",
    verantwortlicher: "EPietig",
    wahrscheinlichkeit: 60,
    angebote: 1,
  },
  {
    id: "VC-003",
    gguid: "A27B4C35-9E12-4F78-B456-123D45E67890",
    kunde: "Global Services AG",
    stichwort: "Wartungsvertrag 2024",
    status: "bewertet",
    phase: "Anfrage qualifizieren",
    volumen: 75000.0,
    liefertermin: "2024-03-01",
    verantwortlicher: "RScharpenberg",
    wahrscheinlichkeit: 40,
    angebote: 0,
  },
  {
    id: "VC-004",
    gguid: "B38C5D46-0F23-5G89-C567-234E56F78901",
    kunde: "Innovate Solutions GmbH",
    stichwort: "Softwarelizenzen Erneuerung",
    status: "gewonnen",
    phase: "Auftrag",
    volumen: 50000.0,
    liefertermin: "2023-12-15",
    verantwortlicher: "EPietig",
    wahrscheinlichkeit: 100,
    angebote: 2,
  },
  {
    id: "VC-005",
    gguid: "C49D6E57-1G34-6H90-D678-345F67G89012",
    kunde: "Digital Transformation AG",
    stichwort: "Cloud Migration Projekt",
    status: "qualifiziert",
    phase: "Angebotsphase",
    volumen: 200000.0,
    liefertermin: "2024-05-30",
    verantwortlicher: "RScharpenberg",
    wahrscheinlichkeit: 70,
    angebote: 1,
  },
]

export function VerkaufschancenTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredVerkaufschancen = verkaufschancen.filter((vc) => {
    const matchesSearch =
      vc.kunde.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.stichwort.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vc.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Verkaufschancen durchsuchen..."
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
            <SelectItem value="unbewertet">Unbewertet</SelectItem>
            <SelectItem value="vorbewertet">Vorbewertet</SelectItem>
            <SelectItem value="bewertet">Bewertet</SelectItem>
            <SelectItem value="qualifiziert">Qualifiziert</SelectItem>
            <SelectItem value="gewonnen">Gewonnen</SelectItem>
            <SelectItem value="verschoben">Verschoben</SelectItem>
            <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
            <SelectItem value="verloren">Verloren</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Stichwort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Volumen (€)</TableHead>
              <TableHead>Liefertermin</TableHead>
              <TableHead>Angebote</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVerkaufschancen.map((vc) => (
              <TableRow key={vc.id}>
                <TableCell className="font-medium">{vc.id}</TableCell>
                <TableCell>{vc.kunde}</TableCell>
                <TableCell>{vc.stichwort}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      vc.status === "qualifiziert"
                        ? "bg-blue-100 text-blue-800"
                        : vc.status === "gewonnen"
                          ? "bg-green-100 text-green-800"
                          : vc.status === "bewertet"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vc.status}
                  </span>
                </TableCell>
                <TableCell>{vc.phase}</TableCell>
                <TableCell>{vc.volumen.toLocaleString("de-DE")} €</TableCell>
                <TableCell>{new Date(vc.liefertermin).toLocaleDateString("de-DE")}</TableCell>
                <TableCell>{vc.angebote}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/verkaufschancen/${vc.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Details</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/angebote/neu?verkaufschance=${vc.id}`}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Angebot erstellen</span>
                      </Link>
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
