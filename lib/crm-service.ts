// Mock CRM service for integration with CAS genesisWorld

import { v4 as uuidv4 } from "uuid"

// Types for CRM data
export interface CRMSalesOpportunity {
  GGUID: string
  ACCOUNTINFORMATION: string
  PERSONINCHARGE: string
  CURRENCYNAT: string
  KEYWORD: string
  DISTRIBUTIONPHASE: string
  STATUS: string
  VJ_LIEFERTERMIN?: string
  VJ_ANGEBOTSVOLUMEN?: number
  VJ_TESTNOTWENDIG?: boolean
  VJ_GEHEIMHALTUNGSVEREINBARUNG?: boolean
  INSERTDATE: string
  CHANGEDATE: string
}

export interface CRMDocument {
  objectType: string
  fields: {
    DOCDATE: string
    GWFILETYPE: string
    GWSTYPE: string
    KEYWORD: string
    INSERTUSER: string
    OWNERNAME: string
  }
}

// Mock data for sales opportunities
const mockSalesOpportunities: CRMSalesOpportunity[] = [
  {
    GGUID: uuidv4(),
    ACCOUNTINFORMATION: "Schüller Möbelwerk KG",
    PERSONINCHARGE: "Enrica Pietig",
    CURRENCYNAT: "EUR",
    KEYWORD: "Schüller Umbau 2024",
    DISTRIBUTIONPHASE: "Angebot",
    STATUS: "offen",
    VJ_LIEFERTERMIN: "2024-06-30",
    VJ_ANGEBOTSVOLUMEN: 45000,
    VJ_TESTNOTWENDIG: true,
    VJ_GEHEIMHALTUNGSVEREINBARUNG: true,
    INSERTDATE: "2023-11-15T10:30:00",
    CHANGEDATE: "2024-01-20T14:45:00",
  },
  {
    GGUID: uuidv4(),
    ACCOUNTINFORMATION: "TechGiant GmbH",
    PERSONINCHARGE: "Max Mustermann",
    CURRENCYNAT: "EUR",
    KEYWORD: "TechGiant Büroausstattung",
    DISTRIBUTIONPHASE: "Anfrage",
    STATUS: "offen",
    VJ_LIEFERTERMIN: "2024-08-15",
    VJ_ANGEBOTSVOLUMEN: 28500,
    VJ_TESTNOTWENDIG: false,
    VJ_GEHEIMHALTUNGSVEREINBARUNG: false,
    INSERTDATE: "2024-01-05T09:15:00",
    CHANGEDATE: "2024-01-10T11:20:00",
  },
  {
    GGUID: uuidv4(),
    ACCOUNTINFORMATION: "Global Services AG",
    PERSONINCHARGE: "Anna Schmidt",
    CURRENCYNAT: "USD",
    KEYWORD: "Global Services Expansion",
    DISTRIBUTIONPHASE: "Beauftragt",
    STATUS: "gewonnen",
    VJ_LIEFERTERMIN: "2024-05-20",
    VJ_ANGEBOTSVOLUMEN: 120000,
    VJ_TESTNOTWENDIG: true,
    VJ_GEHEIMHALTUNGSVEREINBARUNG: true,
    INSERTDATE: "2023-09-22T14:30:00",
    CHANGEDATE: "2024-02-01T16:45:00",
  },
  {
    GGUID: uuidv4(),
    ACCOUNTINFORMATION: "Möbel Meyer GmbH",
    PERSONINCHARGE: "Enrica Pietig",
    CURRENCYNAT: "EUR",
    KEYWORD: "Meyer Showroom 2024",
    DISTRIBUTIONPHASE: "Angebot",
    STATUS: "offen",
    VJ_LIEFERTERMIN: "2024-07-15",
    VJ_ANGEBOTSVOLUMEN: 65000,
    VJ_TESTNOTWENDIG: false,
    VJ_GEHEIMHALTUNGSVEREINBARUNG: true,
    INSERTDATE: "2023-12-10T11:30:00",
    CHANGEDATE: "2024-01-15T09:45:00",
  },
  {
    GGUID: uuidv4(),
    ACCOUNTINFORMATION: "Bürokonzept Schneider",
    PERSONINCHARGE: "Max Mustermann",
    CURRENCYNAT: "EUR",
    KEYWORD: "Schneider Komplettausstattung",
    DISTRIBUTIONPHASE: "Anfrage",
    STATUS: "offen",
    VJ_LIEFERTERMIN: "2024-09-30",
    VJ_ANGEBOTSVOLUMEN: 32000,
    VJ_TESTNOTWENDIG: true,
    VJ_GEHEIMHALTUNGSVEREINBARUNG: false,
    INSERTDATE: "2024-01-20T13:30:00",
    CHANGEDATE: "2024-01-25T10:15:00",
  },
]

// Mock documents
const mockDocuments: Record<string, CRMDocument[]> = {
  [mockSalesOpportunities[0].GGUID]: [
    {
      objectType: "DOCUMENT",
      fields: {
        DOCDATE: "2024-01-20",
        GWFILETYPE: "PDF",
        GWSTYPE: "Angebot",
        KEYWORD: "A-21581A",
        INSERTUSER: "EPietig",
        OWNERNAME: "Vertrieb",
      },
    },
    {
      objectType: "DOCUMENT",
      fields: {
        DOCDATE: "2024-01-25",
        GWFILETYPE: "PDF",
        GWSTYPE: "Angebot",
        KEYWORD: "A-21581B",
        INSERTUSER: "EPietig",
        OWNERNAME: "Vertrieb",
      },
    },
  ],
}

// Mock CRM API functions
export async function fetchSalesOpportunities(): Promise<CRMSalesOpportunity[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return mockSalesOpportunities
}

export async function fetchSalesOpportunityById(id: string): Promise<CRMSalesOpportunity | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const opportunity = mockSalesOpportunities.find((opp) => opp.GGUID === id)
  return opportunity || null
}

export async function fetchDocumentsByOpportunityId(opportunityId: string): Promise<CRMDocument[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  return mockDocuments[opportunityId] || []
}

// Synchronization function to be called by a background job
export async function synchronizeSalesOpportunities() {
  try {
    // In a real implementation, this would:
    // 1. Fetch opportunities from CRM API
    // 2. Compare with local database
    // 3. Update/insert as needed

    console.log("Synchronizing sales opportunities from CRM...")
    const opportunities = await fetchSalesOpportunities()
    console.log(`Synchronized ${opportunities.length} sales opportunities`)

    return {
      success: true,
      count: opportunities.length,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error synchronizing sales opportunities:", error)
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    }
  }
}
