import { jsPDF } from "jspdf"
// Importiere die autoTable-Erweiterung korrekt
import autoTable from "jspdf-autotable"

// Function to generate a PDF from an order confirmation
export async function generateOrderConfirmationPDF(orderConfirmation: any, language = "de"): Promise<Blob> {
  // Create a new PDF document
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Reset text color for content
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  // Add header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(language === "de" ? "AUFTRAGSBESTÄTIGUNG" : "ORDER CONFIRMATION", pageWidth - 20, 20, { align: "right" })

  doc.setFontSize(12)
  doc.text(`${orderConfirmation.id}`, pageWidth - 20, 28, {
    align: "right",
  })

  doc.text(
    `${language === "de" ? "Datum" : "Date"}: ${new Date(orderConfirmation.datum).toLocaleDateString(
      language === "de" ? "de-DE" : "en-US",
    )}`,
    pageWidth - 20,
    36,
    { align: "right" },
  )

  // Instead of using an image, draw a placeholder for the logo
  doc.setFillColor(200, 200, 200)
  doc.rect(20, 20, 40, 15, "F")
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("VENJAKOB", 40, 30, { align: "center" })

  // Add company and customer information
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)

  // Company info
  doc.text("Venjakob GmbH & Co. KG", 20, 50)
  doc.text("Industriestraße 1", 20, 55)
  doc.text("33397 Rheda-Wiedenbrück", 20, 60)
  doc.text("Deutschland", 20, 65)

  // Customer info
  doc.text(language === "de" ? "Kunde:" : "Customer:", pageWidth / 2, 50)
  doc.text(orderConfirmation.kunde.name, pageWidth / 2, 55)
  doc.text(`${orderConfirmation.kunde.address}`, pageWidth / 2, 60)
  doc.text(`${orderConfirmation.kunde.postalCode} ${orderConfirmation.kunde.city}`, pageWidth / 2, 65)
  doc.text(orderConfirmation.kunde.country, pageWidth / 2, 70)

  // Add title and description
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(orderConfirmation.titel, 20, 85)

  // Add positions table
  const positions = orderConfirmation.positionen || []
  if (positions.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(language === "de" ? "Positionen" : "Items", 20, 100)

    const tableColumn = [
      language === "de" ? "Position" : "Item",
      language === "de" ? "Menge" : "Quantity",
      language === "de" ? "Einheit" : "Unit",
      language === "de" ? "Einzelpreis" : "Unit Price",
      language === "de" ? "Gesamtpreis" : "Total Price",
    ]

    const tableRows = positions.map((position) => [
      position.name,
      position.menge.toString(),
      position.einheit,
      `${position.einzelpreis.toFixed(2)} €`,
      `${position.gesamtpreis.toFixed(2)} €`,
    ])

    // Verwende autoTable als importierte Funktion statt als Methode
    autoTable(doc, {
      startY: 105,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [66, 66, 66] },
      margin: { top: 105 },
    })
  }

  // Add total calculation
  // Verwende eine sichere Methode, um die Y-Position zu bestimmen
  let totalY = 200
  try {
    // @ts-ignore - Zugriff auf die letzte Tabellenposition, falls vorhanden
    const lastTable = (doc as any)["lastAutoTable"]
    if (lastTable && lastTable.finalY) {
      totalY = lastTable.finalY + 10
    }
  } catch (e) {
    console.warn("Could not determine table position, using default", e)
  }

  const total = orderConfirmation.betrag
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
  doc.text(language === "de" ? "Lieferung und Zahlung" : "Delivery and Payment", 20, totalY + 25)

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

  // Add footer
  doc.setFontSize(8)
  doc.text(
    language === "de"
      ? "Diese Auftragsbestätigung wurde elektronisch erstellt und ist ohne Unterschrift gültig."
      : "This order confirmation was created electronically and is valid without signature.",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" },
  )

  // Return the PDF as a blob
  return doc.output("blob")
}
