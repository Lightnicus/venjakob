"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Printer, RefreshCw, AlertCircle } from "lucide-react"
import { generateOrderConfirmationPDF } from "@/lib/auftragsbestaetigung-pdf-service"
import { useToast } from "@/hooks/use-toast"

interface AuftragsbestaetigungPDFPreviewProps {
  auftragsbestaetigung: any
}

export function AuftragsbestaetigungPDFPreview({ auftragsbestaetigung }: AuftragsbestaetigungPDFPreviewProps) {
  const [language, setLanguage] = useState("de")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Generate PDF when language changes or order confirmation changes
  useEffect(() => {
    generatePDF()
    // Clean up the URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [language, auftragsbestaetigung])

  const generatePDF = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const pdfBlob = await generateOrderConfirmationPDF(auftragsbestaetigung, language)

      // Create a URL for the blob
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError(`Fehler bei der PDF-Generierung: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
      toast({
        title: "Fehler",
        description: `PDF-Vorschau konnte nicht generiert werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return

    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `${auftragsbestaetigung.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    if (!pdfUrl) return

    const printWindow = window.open(pdfUrl, "_blank")
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print()
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Auftragsbestätigungsvorschau</h3>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sprache wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="en">Englisch</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleDownload} disabled={!pdfUrl || isLoading}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint} disabled={!pdfUrl || isLoading}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={generatePDF} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white p-4 min-h-[600px] flex flex-col items-center">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2 p-4 text-center">
            <AlertCircle className="h-12 w-12" />
            <h3 className="text-lg font-medium">Fehler bei der PDF-Generierung</h3>
            <p>{error}</p>
            <Button onClick={generatePDF} variant="outline" className="mt-4">
              Erneut versuchen
            </Button>
          </div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-[600px] border-0" title="PDF Preview" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">PDF-Vorschau nicht verfügbar</div>
        )}
      </div>
    </div>
  )
}
