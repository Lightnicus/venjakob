import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { OfferVersion } from "@/types/offer"

// Add the missing type to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Function to generate a PDF from an offer version
export async function generateOfferPDF(offerVersion: OfferVersion, language = "de", isDraft = true): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Add watermark if it's a draft
  if (isDraft) {
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(60)
    doc.setFont("helvetica", "bold")
    doc.text(language === "de" ? "ENTWURF" : "DRAFT", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 })
  }

  // Reset text color for content
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // Add header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(language === "de" ? "ANGEBOT" : "QUOTATION", pageWidth - 20, 20, { align: "right" })

  doc.setFontSize(12)
  doc.text(`${offerVersion.offer?.offerNumber || ""}${offerVersion.versionNumber}`, pageWidth - 20, 28, {
    align: "right",
  })

  doc.text(
    `${language === "de" ? "Datum" : "Date"}: ${new Date().toLocaleDateString(language === "de" ? "de-DE" : "en-US")}`,
    pageWidth - 20,
    36,
    { align: "right" },
  )

  // Add company logo (placeholder)
  doc.addImage("/generic-company-logo.png", "PNG", 20, 20, 40, 15)

  // Add company and customer information
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // Company info
  doc.text("Venjakob GmbH & Co. KG", 20, 50)
  doc.text("Industriestraße 1", 20, 55)
  doc.text("33397 Rheda-Wiedenbrück", 20, 60)
  doc.text("Deutschland", 20, 65)

  // Customer info
  doc.text(language === "de" ? "Kunde:" : "Customer:", pageWidth / 2, 50)
  doc.text("Schüller Möbelwerk KG", pageWidth / 2, 55)
  doc.text("Rother Straße 1", pageWidth / 2, 60)
  doc.text("91567 Herrieden", pageWidth / 2, 65)
  doc.text("Deutschland", pageWidth / 2, 70)

  // Add title and description
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(offerVersion.title, 20, 85)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(offerVersion.description || "", 20, 95)

  // Add recipient information if available
  if (offerVersion.recipientName) {
    doc.setFontSize(10)
    doc.text(`${language === "de" ? "Empfänger" : "Recipient"}: ${offerVersion.recipientName}`, 20, 105)
    if (offerVersion.recipientEmail) {
      doc.text(`Email: ${offerVersion.recipientEmail}`, 20, 110)
    }
    if (offerVersion.recipientPhone) {
      doc.text(`${language === "de" ? "Telefon" : "Phone"}: ${offerVersion.recipientPhone}`, 20, 115)
    }
  }

  // Add positions table
  const positions = offerVersion.positions || []
  if (positions.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(language === "de" ? "Positionen" : "Items", 20, 130)

    const tableColumn = [
      language === "de" ? "Position" : "Item",
      language === "de" ? "Menge" : "Quantity",
      language === "de" ? "Einheit" : "Unit",
      language === "de" ? "Einzelpreis" : "Unit Price",
      language === "de" ? "Gesamtpreis" : "Total Price",
    ]

    const tableRows = positions.map((position) => [
      position.name,
      position.quantity.toString(),
      position.unit,
      `${position.unitPrice.toFixed(2)} €`,
      `${position.totalPrice.toFixed(2)} €`,
    ])

    doc.autoTable({
      startY: 135,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
      margin: { top: 135 },
    })
  }

  // Add total calculation
  const totalY = doc.autoTable.previous.finalY + 10 || 200
  const total = positions.reduce((sum, pos) => sum + Number(pos.totalPrice), 0)
  const vat = total * 0.19 // 19% VAT

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(language === "de" ? "Zwischensumme:" : "Subtotal:", pageWidth - 60, totalY)
  doc.text(`${total.toFixed(2)} €`, pageWidth - 20, totalY, {
    align: "right",
  })

  doc.text(language === "de" ? "MwSt. (19%):" : "VAT (19%):", pageWidth - 60, totalY + 5)
  doc.text(`${vat.toFixed(2)} €`, pageWidth - 20, totalY + 5, {
    align: "right",
  })

  doc.setFont("helvetica", "bold")
  doc.text(language === "de" ? "Gesamtsumme:" : "Total:", pageWidth - 60, totalY + 10)
  doc.text(`${(total + vat).toFixed(2)} €`, pageWidth - 20, totalY + 10, {
    align: "right",
  })

  // Add terms and conditions
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(language === "de" ? "Bedingungen und Konditionen" : "Terms and Conditions", 20, totalY + 25)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(
    `${language === "de" ? "Zahlungsbedingungen" : "Payment terms"}: 30 ${
      language === "de" ? "Tage netto" : "days net"
    }`,
    20,
    totalY + 35,
  )
  doc.text(
    `${language === "de" ? "Lieferzeit" : "Delivery time"}: 4-6 ${
      language === "de" ? "Wochen nach Auftragsbestätigung" : "weeks after order confirmation"
    }`,
    20,
    totalY + 40,
  )
  doc.text(
    `${language === "de" ? "Gültigkeit" : "Validity"}: ${
      language === "de" ? "Dieses Angebot ist gültig bis zum" : "This offer is valid until"
    } ${new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleDateString(
      language === "de" ? "de-DE" : "en-US",
    )}`,
    20,
    totalY + 45,
  )

  // Add footer
  doc.setFontSize(8)
  doc.text(
    language === "de"
      ? "Dieses Angebot wurde elektronisch erstellt und ist ohne Unterschrift gültig."
      : "This offer was created electronically and is valid without signature.",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" },
  )

  // Return the PDF as a blob
  return doc.output("blob")
}
