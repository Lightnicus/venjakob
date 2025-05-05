"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Link,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text here...",
  minHeight = "150px",
  disabled = false,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState("3")
  const [tableCols, setTableCols] = useState("3")

  const handleCommand = (command: string, value?: string) => {
    if (disabled) return

    document.execCommand(command, false, value)

    // Get the updated content from the contentEditable div
    const content = document.getElementById("rich-text-editor")?.innerHTML || ""
    onChange(content)
  }

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      handleCommand("insertHTML", `<a href="${linkUrl}" target="_blank">${linkText}</a>`)
      setLinkDialogOpen(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  const handleInsertTable = () => {
    const rows = Number.parseInt(tableRows, 10)
    const cols = Number.parseInt(tableCols, 10)

    if (rows > 0 && cols > 0) {
      let tableHTML = '<table style="width:100%; border-collapse: collapse;">'

      // Create header row
      tableHTML += "<thead><tr>"
      for (let i = 0; i < cols; i++) {
        tableHTML += '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header ' + (i + 1) + "</th>"
      }
      tableHTML += "</tr></thead><tbody>"

      // Create data rows
      for (let i = 0; i < rows - 1; i++) {
        tableHTML += "<tr>"
        for (let j = 0; j < cols; j++) {
          tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cell ' + (i + 1) + "-" + (j + 1) + "</td>"
        }
        tableHTML += "</tr>"
      }

      tableHTML += "</tbody></table><p></p>"

      handleCommand("insertHTML", tableHTML)
      setTableDialogOpen(false)
      setTableRows("3")
      setTableCols("3")
    }
  }

  const handleInsertPlaceholder = (placeholder: string) => {
    handleCommand("insertText", `{${placeholder}}`)
  }

  return (
    <div className="border rounded-md bg-white">
      <div className="flex flex-wrap gap-1 border-b p-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("bold")} disabled={disabled}>
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("italic")} disabled={disabled}>
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("underline")} disabled={disabled}>
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommand("insertUnorderedList")}
                disabled={disabled}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("insertOrderedList")} disabled={disabled}>
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyLeft")} disabled={disabled}>
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyCenter")} disabled={disabled}>
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyRight")} disabled={disabled}>
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={disabled}>
                <Link className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
                <DialogDescription>Enter the URL and text for your link.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="link-url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="link-text" className="text-right">
                    Text
                  </Label>
                  <Input
                    id="link-text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInsertLink}>Insert Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={disabled}>
                <Table className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Table</DialogTitle>
                <DialogDescription>Specify the number of rows and columns for your table.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="table-rows" className="text-right">
                    Rows
                  </Label>
                  <Input
                    id="table-rows"
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="table-cols" className="text-right">
                    Columns
                  </Label>
                  <Input
                    id="table-cols"
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInsertTable}>Insert Table</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInsertPlaceholder("Customer.Name")}
                disabled={disabled}
              >
                {"{Customer}"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Customer Placeholder</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInsertPlaceholder("Offer.Number")}
                disabled={disabled}
              >
                {"{Offer}"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Offer Placeholder</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => handleInsertPlaceholder("Date")} disabled={disabled}>
                {"{Date}"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Date Placeholder</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        id="rich-text-editor"
        contentEditable={!disabled}
        className={`p-3 min-h-[${minHeight}] focus:outline-none`}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        placeholder={placeholder}
      />
    </div>
  )
}
