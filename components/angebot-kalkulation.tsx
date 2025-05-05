"use client"

import React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileUp, FileDown, Plus, Trash, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Position = {
  id: string
  name: string
  menge: number
  einheit: string
  einzelpreis: number
  rabatt: number
  gesamtpreis: number
  option: boolean
  blockId: string
}

type Block = {
  id: string
  name: string
  positions: Position[]
}

export function AngebotKalkulation() {
  // Mock initial data
  const initialBlocks: Block[] = [
    {
      id: "block-1",
      name: "Einleitung",
      positions: [],
    },
    {
      id: "block-2",
      name: "Produkte",
      positions: [
        {
          id: "pos-1",
          name: "Bürostühle",
          menge: 5,
          einheit: "Stück",
          einzelpreis: 299.99,
          rabatt: 0,
          gesamtpreis: 1499.95,
          option: false,
          blockId: "block-2",
        },
        {
          id: "pos-2",
          name: "Schreibtische",
          menge: 5,
          einheit: "Stück",
          einzelpreis: 499.99,
          rabatt: 0,
          gesamtpreis: 2499.95,
          option: false,
          blockId: "block-2",
        },
        {
          id: "pos-3",
          name: "Aktenschränke",
          menge: 2,
          einheit: "Stück",
          einzelpreis: 399.99,
          rabatt: 5,
          gesamtpreis: 759.98,
          option: false,
          blockId: "block-2",
        },
      ],
    },
    {
      id: "block-3",
      name: "Bedingungen und Konditionen",
      positions: [],
    },
  ]

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [isAddingPosition, setIsAddingPosition] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string>("block-2")

  // Neue Position
  const [newPosition, setNewPosition] = useState<Omit<Position, "id" | "gesamtpreis">>({
    name: "",
    menge: 1,
    einheit: "Stück",
    einzelpreis: 0,
    rabatt: 0,
    option: false,
    blockId: "block-2",
  })

  // Berechne Gesamtsumme
  const calculateTotal = () => {
    let subtotal = 0
    blocks.forEach((block) => {
      block.positions.forEach((pos) => {
        subtotal += pos.gesamtpreis
      })
    })
    return subtotal
  }

  const subtotal = calculateTotal()
  const mwst = subtotal * 0.19
  const total = subtotal + mwst

  // Position hinzufügen
  const handleAddPosition = () => {
    const gesamtpreis = calculateGesamtpreis(newPosition.menge, newPosition.einzelpreis, newPosition.rabatt)

    const position: Position = {
      id: `pos-${Date.now()}`,
      name: newPosition.name,
      menge: newPosition.menge,
      einheit: newPosition.einheit,
      einzelpreis: newPosition.einzelpreis,
      rabatt: newPosition.rabatt,
      gesamtpreis,
      option: newPosition.option,
      blockId: newPosition.blockId,
    }

    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === position.blockId ? { ...block, positions: [...block.positions, position] } : block,
      ),
    )

    // Reset form
    setNewPosition({
      name: "",
      menge: 1,
      einheit: "Stück",
      einzelpreis: 0,
      rabatt: 0,
      option: false,
      blockId: selectedBlockId,
    })

    setIsAddingPosition(false)
  }

  // Position bearbeiten
  const handleEditPosition = () => {
    if (!editingPosition) return

    const gesamtpreis = calculateGesamtpreis(editingPosition.menge, editingPosition.einzelpreis, editingPosition.rabatt)

    const updatedPosition = {
      ...editingPosition,
      gesamtpreis,
    }

    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === updatedPosition.blockId
          ? {
              ...block,
              positions: block.positions.map((pos) => (pos.id === updatedPosition.id ? updatedPosition : pos)),
            }
          : block,
      ),
    )

    setEditingPosition(null)
  }

  // Position löschen
  const handleDeletePosition = (positionId: string, blockId: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              positions: block.positions.filter((pos) => pos.id !== positionId),
            }
          : block,
      ),
    )
  }

  // Gesamtpreis berechnen
  const calculateGesamtpreis = (menge: number, einzelpreis: number, rabatt: number) => {
    return menge * einzelpreis * (1 - rabatt / 100)
  }

  // Menge ändern
  const handleMengeChange = (positionId: string, blockId: string, menge: number) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              positions: block.positions.map((pos) => {
                if (pos.id === positionId) {
                  const gesamtpreis = calculateGesamtpreis(menge, pos.einzelpreis, pos.rabatt)
                  return { ...pos, menge, gesamtpreis }
                }
                return pos
              }),
            }
          : block,
      ),
    )
  }

  // Einzelpreis ändern
  const handleEinzelpreisChange = (positionId: string, blockId: string, einzelpreis: number) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              positions: block.positions.map((pos) => {
                if (pos.id === positionId) {
                  const gesamtpreis = calculateGesamtpreis(pos.menge, einzelpreis, pos.rabatt)
                  return { ...pos, einzelpreis, gesamtpreis }
                }
                return pos
              }),
            }
          : block,
      ),
    )
  }

  // Rabatt ändern
  const handleRabattChange = (positionId: string, blockId: string, rabatt: number) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              positions: block.positions.map((pos) => {
                if (pos.id === positionId) {
                  const gesamtpreis = calculateGesamtpreis(pos.menge, pos.einzelpreis, rabatt)
                  return { ...pos, rabatt, gesamtpreis }
                }
                return pos
              }),
            }
          : block,
      ),
    )
  }

  // Option ändern
  const handleOptionChange = (positionId: string, blockId: string, option: boolean) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              positions: block.positions.map((pos) => (pos.id === positionId ? { ...pos, option } : pos)),
            }
          : block,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kalkulation</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FileUp className="h-4 w-4 mr-1" />
            Excel Import
          </Button>
          <Button size="sm" variant="outline">
            <FileDown className="h-4 w-4 mr-1" />
            Excel Export
          </Button>
          <Dialog open={isAddingPosition} onOpenChange={setIsAddingPosition}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Position hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Position hinzufügen</DialogTitle>
                <DialogDescription>Fügen Sie eine neue Position zur Kalkulation hinzu.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="block" className="text-right">
                    Block
                  </Label>
                  <Select
                    value={newPosition.blockId}
                    onValueChange={(value) => setNewPosition({ ...newPosition, blockId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Block auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block.id} value={block.id}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Bezeichnung
                  </Label>
                  <Input
                    id="name"
                    value={newPosition.name}
                    onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="menge" className="text-right">
                    Menge
                  </Label>
                  <Input
                    id="menge"
                    type="number"
                    value={newPosition.menge}
                    onChange={(e) => setNewPosition({ ...newPosition, menge: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="einheit" className="text-right">
                    Einheit
                  </Label>
                  <Select
                    value={newPosition.einheit}
                    onValueChange={(value) => setNewPosition({ ...newPosition, einheit: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Einheit auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stück">Stück</SelectItem>
                      <SelectItem value="Stunde">Stunde</SelectItem>
                      <SelectItem value="Pauschal">Pauschal</SelectItem>
                      <SelectItem value="Meter">Meter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="einzelpreis" className="text-right">
                    Einzelpreis (€)
                  </Label>
                  <Input
                    id="einzelpreis"
                    type="number"
                    step="0.01"
                    value={newPosition.einzelpreis}
                    onChange={(e) => setNewPosition({ ...newPosition, einzelpreis: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rabatt" className="text-right">
                    Rabatt (%)
                  </Label>
                  <Input
                    id="rabatt"
                    type="number"
                    value={newPosition.rabatt}
                    onChange={(e) => setNewPosition({ ...newPosition, rabatt: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="option" className="text-right">
                    Option
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <input
                      type="checkbox"
                      id="option"
                      checked={newPosition.option}
                      onChange={(e) => setNewPosition({ ...newPosition, option: e.target.checked })}
                      className="mr-2"
                    />
                    <Label htmlFor="option">Als Option kennzeichnen</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingPosition(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddPosition}>Hinzufügen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Position</TableHead>
              <TableHead>Menge</TableHead>
              <TableHead>Einheit</TableHead>
              <TableHead>Einzelpreis (€)</TableHead>
              <TableHead>Rabatt (%)</TableHead>
              <TableHead>Gesamtpreis (€)</TableHead>
              <TableHead>Option</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <React.Fragment key={block.id}>
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={7}>{block.name}</TableCell>
                  <TableCell>
                    <input type="checkbox" disabled />
                  </TableCell>
                </TableRow>
                {block.positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="pl-8">{position.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={position.menge}
                        onChange={(e) => handleMengeChange(position.id, block.id, Number(e.target.value))}
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell>{position.einheit}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={position.einzelpreis}
                        onChange={(e) => handleEinzelpreisChange(position.id, block.id, Number(e.target.value))}
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={position.rabatt}
                        onChange={(e) => handleRabattChange(position.id, block.id, Number(e.target.value))}
                        className="h-8 w-16"
                      />
                    </TableCell>
                    <TableCell>{position.gesamtpreis.toFixed(2)} €</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={position.option}
                        onChange={(e) => handleOptionChange(position.id, block.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={editingPosition?.id === position.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setEditingPosition(position)
                            } else {
                              setEditingPosition(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Save className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Position bearbeiten</DialogTitle>
                              <DialogDescription>Bearbeiten Sie die Position in der Kalkulation.</DialogDescription>
                            </DialogHeader>
                            {editingPosition && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">
                                    Bezeichnung
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editingPosition.name}
                                    onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-menge" className="text-right">
                                    Menge
                                  </Label>
                                  <Input
                                    id="edit-menge"
                                    type="number"
                                    value={editingPosition.menge}
                                    onChange={(e) =>
                                      setEditingPosition({ ...editingPosition, menge: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-einheit" className="text-right">
                                    Einheit
                                  </Label>
                                  <Select
                                    value={editingPosition.einheit}
                                    onValueChange={(value) =>
                                      setEditingPosition({ ...editingPosition, einheit: value })
                                    }
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Einheit auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Stück">Stück</SelectItem>
                                      <SelectItem value="Stunde">Stunde</SelectItem>
                                      <SelectItem value="Pauschal">Pauschal</SelectItem>
                                      <SelectItem value="Meter">Meter</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-einzelpreis" className="text-right">
                                    Einzelpreis (€)
                                  </Label>
                                  <Input
                                    id="edit-einzelpreis"
                                    type="number"
                                    step="0.01"
                                    value={editingPosition.einzelpreis}
                                    onChange={(e) =>
                                      setEditingPosition({ ...editingPosition, einzelpreis: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-rabatt" className="text-right">
                                    Rabatt (%)
                                  </Label>
                                  <Input
                                    id="edit-rabatt"
                                    type="number"
                                    value={editingPosition.rabatt}
                                    onChange={(e) =>
                                      setEditingPosition({ ...editingPosition, rabatt: Number(e.target.value) })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-option" className="text-right">
                                    Option
                                  </Label>
                                  <div className="col-span-3 flex items-center">
                                    <input
                                      type="checkbox"
                                      id="edit-option"
                                      checked={editingPosition.option}
                                      onChange={(e) =>
                                        setEditingPosition({ ...editingPosition, option: e.target.checked })
                                      }
                                      className="mr-2"
                                    />
                                    <Label htmlFor="edit-option">Als Option kennzeichnen</Label>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingPosition(null)}>
                                Abbrechen
                              </Button>
                              <Button onClick={handleEditPosition}>Speichern</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeletePosition(position.id, block.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Zwischensumme:</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>MwSt. (19%):</span>
            <span>{mwst.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Gesamtsumme:</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  )
}
