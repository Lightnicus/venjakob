export type CRMSalesOpportunity = {
  ID: string
  KEYWORD: string
  ACCOUNTINFORMATION: string
  STATUS: string
  DISTRIBUTIONPHASE: string
  VJ_ANGEBOTSVOLUMEN?: number
  VJ_LIEFERTERMIN?: string
  VJ_WAHRSCHEINLICHKEIT?: number
  CURRENCYNAT: string
  GGUID: string
  INSERTDATE: string
  CHANGEDATE: string
  PERSONINCHARGE: string
  DESCRIPTION: string
}

// Simulierte CRM-Daten für Verkaufschancen
const salesOpportunities: CRMSalesOpportunity[] = [
  {
    ID: "1",
    KEYWORD: "Neues ERP-System",
    ACCOUNTINFORMATION: "Kunde A GmbH",
    STATUS: "In Bearbeitung",
    DISTRIBUTIONPHASE: "Angebotserstellung",
    VJ_ANGEBOTSVOLUMEN: 75000,
    VJ_LIEFERTERMIN: "2023-12-15",
    VJ_WAHRSCHEINLICHKEIT: 70,
    CURRENCYNAT: "EUR",
    GGUID: "123e4567-e89b-12d3-a456-426614174000",
    INSERTDATE: "2023-01-01",
    CHANGEDATE: "2023-01-02",
    PERSONINCHARGE: "Max Mustermann",
    DESCRIPTION: "Implementierung eines neuen ERP-Systems für die Buchhaltung und Lagerverwaltung.",
  },
  {
    ID: "2",
    KEYWORD: "Webshop-Erweiterung",
    ACCOUNTINFORMATION: "Online Shop B",
    STATUS: "Angeboten",
    DISTRIBUTIONPHASE: "Verhandlung",
    VJ_ANGEBOTSVOLUMEN: 25000,
    VJ_LIEFERTERMIN: "2023-10-30",
    VJ_WAHRSCHEINLICHKEIT: 60,
    CURRENCYNAT: "EUR",
    GGUID: "550e8400-e29b-41d4-a716-446655440000",
    INSERTDATE: "2023-02-01",
    CHANGEDATE: "2023-02-03",
    PERSONINCHARGE: "Erika Mustermann",
    DESCRIPTION: "Erweiterung des bestehenden Webshops um neue Funktionen und Zahlungsmethoden.",
  },
  {
    ID: "3",
    KEYWORD: "IT-Infrastruktur Modernisierung",
    ACCOUNTINFORMATION: "Produktion C AG",
    STATUS: "Gewonnen",
    DISTRIBUTIONPHASE: "Abgeschlossen",
    VJ_ANGEBOTSVOLUMEN: 120000,
    VJ_LIEFERTERMIN: "2023-08-15",
    VJ_WAHRSCHEINLICHKEIT: 100,
    CURRENCYNAT: "EUR",
    GGUID: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    INSERTDATE: "2023-03-05",
    CHANGEDATE: "2023-03-10",
    PERSONINCHARGE: "Hans Schmidt",
    DESCRIPTION: "Komplette Modernisierung der IT-Infrastruktur inklusive Serverhardware und Netzwerkkomponenten.",
  },
  {
    ID: "4",
    KEYWORD: "CRM-System Einführung",
    ACCOUNTINFORMATION: "Dienstleister D",
    STATUS: "Verloren",
    DISTRIBUTIONPHASE: "Abgebrochen",
    VJ_ANGEBOTSVOLUMEN: 45000,
    VJ_LIEFERTERMIN: "2023-07-01",
    VJ_WAHRSCHEINLICHKEIT: 0,
    CURRENCYNAT: "EUR",
    GGUID: "7427b810-9dad-11d1-80b4-00c04fd430c8",
    INSERTDATE: "2023-04-10",
    CHANGEDATE: "2023-04-12",
    PERSONINCHARGE: "Peter Müller",
    DESCRIPTION: "Einführung eines CRM-Systems zur Verwaltung von Kundenbeziehungen und Vertriebsprozessen.",
  },
]

const documents = [
  {
    GGUID: "123e4567-e89b-12d3-a456-426614174000",
    fields: {
      DOCDATE: "2023-11-01",
      GWSTYPE: "Angebot",
      KEYWORD: "ERP Angebot",
      INSERTUSER: "Max",
      OWNERNAME: "Max Mustermann",
    },
  },
  {
    GGUID: "123e4567-e89b-12d3-a456-426614174000",
    fields: {
      DOCDATE: "2023-11-15",
      GWSTYPE: "Vertrag",
      KEYWORD: "ERP Vertrag",
      INSERTUSER: "Max",
      OWNERNAME: "Max Mustermann",
    },
  },
  {
    GGUID: "550e8400-e29b-41d4-a716-446655440000",
    fields: {
      DOCDATE: "2023-10-01",
      GWSTYPE: "Angebot",
      KEYWORD: "Webshop Angebot",
      INSERTUSER: "Erika",
      OWNERNAME: "Erika Mustermann",
    },
  },
]

// Funktion zum Abrufen aller Verkaufschancen
export async function fetchSalesOpportunities(): Promise<CRMSalesOpportunity[]> {
  // Simuliere API-Aufruf mit Verzögerung
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(salesOpportunities)
    }, 800)
  })
}

// Funktion zum Abrufen einer einzelnen Verkaufschance anhand der ID
export async function fetchSalesOpportunityById(id: string): Promise<CRMSalesOpportunity | undefined> {
  // Simuliere API-Aufruf mit Verzögerung
  return new Promise((resolve) => {
    setTimeout(() => {
      const opportunity = salesOpportunities.find((opp) => opp.ID === id)
      resolve(opportunity)
    }, 500)
  })
}

export async function fetchDocumentsByOpportunityId(gguid: string): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const relevantDocs = documents.filter((doc) => doc.GGUID === gguid)
      resolve(relevantDocs)
    }, 500)
  })
}
