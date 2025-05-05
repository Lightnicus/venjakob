"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Printer, RefreshCw } from "lucide-react"
import { generateOfferPDF } from "@/lib/pdf-service"
import type { OfferVersion } from "@/types/offer"
import { useToast } from "@/hooks/use-toast"

interface PDFPreviewProps {
  offerVersion: OfferVersion
  isDraft?: boolean
}

export function PDFPreview({ offerVersion, isDraft = true }: PDFPreviewProps) {
  const [language, setLanguage] = useState("de")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Generate PDF when language changes or offer version changes
  useEffect(() => {
    generatePDF()
    // Clean up the URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [language, offerVersion])

  const generatePDF = async () => {
    setIsLoading(true)
    try {
      const pdfBlob = await generateOfferPDF(offerVersion, language, isDraft)

      // Create a URL for the blob
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF preview",
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
    link.download = `${offerVersion.offer?.offerNumber || "offer"}-${offerVersion.versionNumber}.pdf`
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
          <Button variant="outline" size="icon" onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint} disabled={!pdfUrl}>
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
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-[600px] border-0" title="PDF Preview" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">PDF preview not available</div>
        )}
      </div>
    </div>
  )
}
