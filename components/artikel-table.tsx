"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Copy, Search, Trash } from "lucide-react"
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

// Mock data
const initialArtikel = [
  {
    id: "ART-001",
    artikelnummer: "BS1069",
    bezeichnung: "Bürostuhl Comfort Plus",
    kategorie: "Hardware",
    preis: 299.99,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "ART-002",
    artikelnummer: "BS1071",
    bezeichnung: "Bürostuhl Executive",
    kategorie: "Hardware",
    preis: 499.99,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "ART-003",
    artikelnummer: "BS848",
    bezeichnung: "Bürostuhl Basic",
    kategorie: "Hardware",
    preis: 199.99,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "ART-004",
    artikelnummer: "BS1078",
    bezeichnung: "Bürostuhl Ergonomic",
    kategorie: "Hardware",
    preis: 399.99,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "ART-005",
    artikelnummer: "ST2001",
    bezeichnung: "Schreibtisch Standard",
    kategorie: "Hardware",
    preis: 399.99,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
]

export function ArtikelTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [kategorieFilter, setKategorieFilter] = useState("all")
  const [artikel, setArtikel] = useState(initialArtikel)
  const [artikelToDelete, setArtikelToDelete] = useState<string | null>(null)

  const filteredArtikel = artikel.filter((item) => {
    const matchesSearch =
      item.artikelnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bezeichnung.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesKategorie = kategorieFilter === "all" || item.kategorie === kategorieFilter

    return matchesSearch && matchesKategorie
  })

  const handleDeleteArtikel = (id: string) => {
    setArtikelToDelete(id)
  }

  const confirmDelete = () => {
    if (artikelToDelete) {
      setArtikel(artikel.filter((item) => item.id !== artikelToDelete))
      setArtikelToDelete(null)
    }
  }

  const handleCopyArtikel = (id: string) => {
    const artikelToCopy = artikel.find((item) => item.id === id)
    if (artikelToCopy) {
      const newArtikel = {
        ...artikelToCopy,
        id: `ART-${Date.now().toString().slice(-3)}`,
        artikelnummer: `${artikelToCopy.artikelnummer}-KOPIE`,
        bezeichnung: `${artikelToCopy.bezeichnung} (Kopie)`,
        geaendertAm: new Date().toISOString().split("T")[0],
        geaendertVon: "Enrica Pietig",
      }
      setArtikel([...artikel, newArtikel])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Artikel durchsuchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={kategorieFilter} onValueChange={setKategorieFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Kategorie filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Dienstleistung">Dienstleistung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artikelnummer</TableHead>
              <TableHead>Bezeichnung</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Preis (€)</TableHead>
              <TableHead>Zuletzt geändert am</TableHead>
              <TableHead>Zuletzt geändert von</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtikel.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/artikel/${item.id}`} className="hover:underline">
                    {item.artikelnummer}
                  </Link>
                </TableCell>
                <TableCell>{item.bezeichnung}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      item.kategorie === "Hardware"
                        ? "bg-blue-100 text-blue-800"
                        : item.kategorie === "Software"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.kategorie}
                  </span>
                </TableCell>
                <TableCell>{item.preis.toFixed(2)}</TableCell>
                <TableCell>{new Date(item.geaendertAm).toLocaleDateString("de-DE")}</TableCell>
                <TableCell>{item.geaendertVon}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/artikel/${item.id}/bearbeiten`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyArtikel(item.id)}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Kopieren</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteArtikel(item.id)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Löschen</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!artikelToDelete} onOpenChange={(open) => !open && setArtikelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht
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
    </div>
  )
}
