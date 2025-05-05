"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
const initialBlocks = [
  {
    id: "block-1",
    bezeichnung: "Einleitung",
    standard: true,
    verpflichtend: true,
    position: 1,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "block-2",
    bezeichnung: "Produkte",
    standard: true,
    verpflichtend: false,
    position: 2,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "block-3",
    bezeichnung: "Bedingungen und Konditionen",
    standard: true,
    verpflichtend: true,
    position: 3,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "block-4",
    bezeichnung: "Optionale Leistungen",
    standard: false,
    verpflichtend: false,
    position: null,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
  {
    id: "block-5",
    bezeichnung: "Referenzen",
    standard: false,
    verpflichtend: false,
    position: null,
    geaendertAm: "2023-03-06",
    geaendertVon: "Enrica Pietig",
  },
]

export function BlockTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [blocks, setBlocks] = useState(initialBlocks)
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null)

  const filteredBlocks = blocks.filter((block) => {
    return block.bezeichnung.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleDeleteBlock = (id: string) => {
    setBlockToDelete(id)
  }

  const confirmDelete = () => {
    if (blockToDelete) {
      setBlocks(blocks.filter((block) => block.id !== blockToDelete))
      setBlockToDelete(null)
    }
  }

  const handleCopyBlock = (id: string) => {
    const blockToCopy = blocks.find((block) => block.id === id)
    if (blockToCopy) {
      const newBlock = {
        ...blockToCopy,
        id: `block-${Date.now()}`,
        bezeichnung: `${blockToCopy.bezeichnung} (Kopie)`,
        standard: false,
        position: null,
        geaendertAm: new Date().toISOString().split("T")[0],
        geaendertVon: "Enrica Pietig",
      }
      setBlocks([...blocks, newBlock])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Blöcke durchsuchen..."
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
              <TableHead>Bezeichnung</TableHead>
              <TableHead>Standard</TableHead>
              <TableHead>Verpflichtend</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Zuletzt geändert am</TableHead>
              <TableHead>Zuletzt geändert von</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell className="font-medium">
                  <Link href={`/bloecke/${block.id}`} className="hover:underline">
                    {block.bezeichnung}
                  </Link>
                </TableCell>
                <TableCell>{block.standard ? "Ja" : "Nein"}</TableCell>
                <TableCell>{block.verpflichtend ? "Ja" : "Nein"}</TableCell>
                <TableCell>{block.position || "-"}</TableCell>
                <TableCell>{new Date(block.geaendertAm).toLocaleDateString("de-DE")}</TableCell>
                <TableCell>{block.geaendertVon}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/bloecke/${block.id}/bearbeiten`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCopyBlock(block.id)}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Kopieren</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBlock(block.id)}
                      disabled={block.standard && block.verpflichtend}
                    >
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

      <AlertDialog open={!!blockToDelete} onOpenChange={(open) => !open && setBlockToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Block löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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
