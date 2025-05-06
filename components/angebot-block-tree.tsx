"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronRight, Plus, Trash2, MoveVertical } from "lucide-react"

interface Block {
  id: string
  title: string
  type: string
  content?: string
  price?: number
  children?: Block[]
  expanded?: boolean
}

interface AngebotBlockTreeProps {
  blocks?: Block[]
  onChange?: (blocks: Block[]) => void
  onSelectBlock?: (blockId: string | null) => void
  onSelectArticle?: (articleId: string | null) => void
}

export function AngebotBlockTree({
  blocks = [],
  onChange = () => {},
  onSelectBlock = () => {},
  onSelectArticle = () => {},
}: AngebotBlockTreeProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({})
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  // Initial blocks if none provided
  const initialBlocks: Block[] =
    blocks.length > 0
      ? blocks
      : [
          {
            id: "block-1",
            title: "Introduction",
            type: "text",
            content: "This is an introduction",
          },
          {
            id: "block-2",
            title: "Products",
            type: "product",
            children: [
              {
                id: "block-2-1",
                title: "Product A",
                type: "product",
                price: 100,
              },
            ],
          },
        ]

  const [blockList, setBlockList] = useState<Block[]>(initialBlocks)

  const handleAddBlock = (parentId?: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      title: "Neuer Block",
      type: "text",
      content: "",
      expanded: true,
    }

    let updatedBlocks

    if (!parentId) {
      updatedBlocks = [...blockList, newBlock]
      setBlockList(updatedBlocks)
      onChange(updatedBlocks)
      return
    }

    const updateBlocksRecursive = (items: Block[]): Block[] => {
      return items.map((block) => {
        if (block.id === parentId) {
          return {
            ...block,
            children: [...(block.children || []), newBlock],
            expanded: true,
          }
        }
        if (block.children) {
          return {
            ...block,
            children: updateBlocksRecursive(block.children),
          }
        }
        return block
      })
    }

    updatedBlocks = updateBlocksRecursive(blockList)
    setBlockList(updatedBlocks)
    onChange(updatedBlocks)
  }

  const handleRemoveBlock = (blockId: string) => {
    const removeBlockRecursive = (items: Block[]): Block[] => {
      return items
        .filter((block) => block.id !== blockId)
        .map((block) => {
          if (block.children) {
            return {
              ...block,
              children: removeBlockRecursive(block.children),
            }
          }
          return block
        })
    }

    const updatedBlocks = removeBlockRecursive(blockList)
    setBlockList(updatedBlocks)
    onChange(updatedBlocks)
  }

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    const updateBlockRecursive = (items: Block[]): Block[] => {
      return items.map((block) => {
        if (block.id === blockId) {
          return { ...block, ...updates }
        }
        if (block.children) {
          return {
            ...block,
            children: updateBlockRecursive(block.children),
          }
        }
        return block
      })
    }

    const updatedBlocks = updateBlockRecursive(blockList)
    setBlockList(updatedBlocks)
    onChange(updatedBlocks)
  }

  const handleToggleExpand = (blockId: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }))
  }

  const handleSelectBlock = (blockId: string) => {
    setSelectedBlockId(blockId)
    onSelectBlock(blockId)
    onSelectArticle(null)
  }

  const renderBlock = (block: Block, depth = 0) => {
    const isExpanded = expandedBlocks[block.id] !== false // Default to expanded if not set
    const isSelected = selectedBlockId === block.id

    return (
      <div key={block.id} className="mb-2">
        <div
          className={`flex items-center p-2 rounded-md ${isSelected ? "bg-blue-100" : depth === 0 ? "bg-gray-100" : ""}`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => handleSelectBlock(block.id)}
        >
          {block.children && block.children.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleExpand(block.id)
              }}
              className="mr-2 p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-8"></div>
          )}

          <div className="flex-grow font-medium cursor-pointer">{block.title}</div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleAddBlock(block.id)
              }}
              aria-label="Add child block"
            >
              <Plus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveBlock(block.id)
              }}
              aria-label="Remove block"
            >
              <Trash2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Move block">
              <MoveVertical size={16} />
            </Button>
          </div>
        </div>

        {isExpanded && isSelected && (
          <Card className="mt-2 mb-4" style={{ marginLeft: `${depth * 20 + 20}px` }}>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${block.id}`}>Titel</Label>
                <Input
                  id={`title-${block.id}`}
                  value={block.title}
                  onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`type-${block.id}`}>Typ</Label>
                <Select value={block.type} onValueChange={(value) => handleUpdateBlock(block.id, { type: value })}>
                  <SelectTrigger id={`type-${block.id}`}>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Bild</SelectItem>
                    <SelectItem value="table">Tabelle</SelectItem>
                    <SelectItem value="product">Produkt</SelectItem>
                    <SelectItem value="service">Dienstleistung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {block.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor={`content-${block.id}`}>Inhalt</Label>
                  <Textarea
                    id={`content-${block.id}`}
                    value={block.content || ""}
                    onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                  />
                </div>
              )}

              {(block.type === "product" || block.type === "service") && (
                <div className="space-y-2">
                  <Label htmlFor={`price-${block.id}`}>Preis</Label>
                  <Input
                    id={`price-${block.id}`}
                    type="number"
                    value={block.price || 0}
                    onChange={(e) => handleUpdateBlock(block.id, { price: Number.parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isExpanded && block.children && block.children.length > 0 && (
          <div className="ml-4">{block.children.map((child) => renderBlock(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Angebotsstruktur</h3>
        <Button size="sm" onClick={() => handleAddBlock()} aria-label="Add block">
          <Plus className="h-4 w-4 mr-1" />
          Block hinzufügen
        </Button>
      </div>

      <div className="border rounded-md p-4 bg-white">
        {blockList.map((block) => renderBlock(block))}
        {blockList.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Keine Blöcke vorhanden. Klicken Sie auf "Block hinzufügen", um einen neuen Block zu erstellen.
          </div>
        )}
      </div>
    </div>
  )
}
