import { generatePDF } from "@/lib/pdf-service"
import { vi } from "vitest"

// Mock the PDF generation functionality
vi.mock("jspdf", () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
      addImage: vi.fn(),
      addPage: vi.fn(),
      save: vi.fn(),
      output: vi.fn().mockReturnValue("mock-pdf-data"),
    })),
  }
})

describe("PDF Service", () => {
  test("generatePDF should create a PDF document with offer data", async () => {
    const offerData = {
      id: 1,
      offerNumber: "AB-12345",
      title: "Test Offer",
      customer: {
        name: "Test Customer",
        address: "Test Address",
      },
      currentVersion: {
        versionNumber: "V1",
        positions: [
          {
            name: "Test Position",
            quantity: 2,
            unitPrice: 100,
            totalPrice: 200,
          },
        ],
      },
    }

    const result = await generatePDF(offerData)

    expect(result).toBe("mock-pdf-data")
  })
})
