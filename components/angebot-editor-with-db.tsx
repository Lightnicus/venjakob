"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AngebotEditor, type Angebot } from "./angebot-editor"
import { useToast as useToastLib } from "@/lib/hooks/use-toast"
import { fetchSalesOpportunityById } from "@/lib/crm-service"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AngebotEditorWithDbProps {
  angebotId?: string
  isNew?: boolean
  verkaufschanceId?: string
}

interface VersionChangeData {
  title: string
  description: string
}

interface OrderConfirmationData {
  confirmationNumber: string
  confirmationDate: string
  notes: string
}

// Leeres Angebot-Objekt für neue Angebote
const emptyAngebot: Angebot = {
  id: "",
  title: "Neues Angebot",
  customer: {
    id: "",
    name: "",
    contactPerson: "",
  },
  status: "Entwurf",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  blocks: [],
  positions: [],
}

export function AngebotEditorWithDb({ angebotId, isNew = false, verkaufschanceId }: AngebotEditorWithDbProps) {
  const [activeTab, setActiveTab] = useState("bloecke")
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isCreatingOrderConfirmation, setIsCreatingOrderConfirmation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingVerkaufschance, setIsLoadingVerkaufschance] = useState(!!verkaufschanceId)
  const [offer, setOffer] = useState<any>(null)
  const [currentVersion, setCurrentVersion] = useState<any>(null)
  const [verkaufschance, setVerkaufschance] = useState<any>(null)
  const [versionChangeData, setVersionChangeData] = useState<VersionChangeData>({
    title: "",
    description: "",
  })
  const [orderConfirmationData, setOrderConfirmationData] = useState<OrderConfirmationData>({
    confirmationNumber: "",
    confirmationDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [angebot, setAngebotState] = useState<Angebot | null>(isNew ? { ...emptyAngebot } : null)
  const [loading, setLoadingState] = useState(true)
  const [saving, setSavingState] = useState(false)
  const router = useRouter()
  const { toast: toastLib } = useToastLib()

  // Debug-Ausgabe
  useEffect(() => {
    console.log("AngebotEditorWithDb props:", { angebotId, isNew, verkaufschanceId })
  }, [angebotId, isNew, verkaufschanceId])

  // Lade Verkaufschance, wenn eine ID übergeben wurde
  useEffect(() => {
    if (verkaufschanceId) {
      console.log("Loading Verkaufschance with ID:", verkaufschanceId)
      loadVerkaufschance(verkaufschanceId)
    } else {
      setIsLoadingVerkaufschance(false)
      if (isNew) {
        // Wenn kein verkaufschanceId vorhanden ist, aber ein neues Angebot erstellt wird,
        // initialisieren wir mit einem leeren Angebot
        setAngebotState({ ...emptyAngebot })
        setLoadingState(false)
        setIsLoading(false)
      }
    }
  }, [verkaufschanceId, isNew])

  // Lade Angebot, wenn eine ID übergeben wurde
  useEffect(() => {
    if (!isNew && angebotId) {
      fetchAngebot()
    } else if (!verkaufschanceId && isNew) {
      // Nur wenn keine Verkaufschance geladen wird, setzen wir loading auf false
      setLoadingState(false)
      setIsLoading(false)
    }
  }, [angebotId, isNew, verkaufschanceId])

  const loadVerkaufschance = async (id: string) => {
    try {
      setIsLoadingVerkaufschance(true)
      console.log("Fetching sales opportunity with ID:", id)
      const data = await fetchSalesOpportunityById(id)
      console.log("Fetched sales opportunity:", data)

      if (data) {
        setVerkaufschance(data)

        // Erstelle ein neues Angebot mit Daten aus der Verkaufschance
        if (isNew) {
          console.log("Creating new offer from sales opportunity:", data)

          // Erstelle ein neues Angebot-Objekt mit den Daten aus der Verkaufschance
          const newAngebot: Angebot = {
            ...emptyAngebot,
            title: data.KEYWORD || "Neues Angebot",
            customer: {
              id: data.ID || "",
              name: data.ACCOUNTINFORMATION || "",
              contactPerson: data.PERSONINCHARGE || "",
            },
            verkaufschanceId: id,
            // Weitere Felder aus der Verkaufschance übernehmen
            liefertermin: data.VJ_LIEFERTERMIN || "",
            waehrung: data.CURRENCYNAT || "EUR",
            gesamtbetrag: data.VJ_ANGEBOTSVOLUMEN || 0,
          }

          console.log("Created new offer object:", newAngebot)
          setAngebotState(newAngebot)
        }
      } else {
        console.error("Sales opportunity not found")
        toastLib({
          title: "Fehler",
          description: "Die Verkaufschance konnte nicht gefunden werden.",
          variant: "destructive",
        })
        // Wenn keine Verkaufschance gefunden wurde, initialisieren wir mit einem leeren Angebot
        setAngebotState({ ...emptyAngebot })
      }
    } catch (error) {
      console.error("Error loading sales opportunity:", error)
      toastLib({
        title: "Fehler",
        description: "Die Verkaufschance konnte nicht geladen werden.",
        variant: "destructive",
      })
      // Bei einem Fehler initialisieren wir mit einem leeren Angebot
      setAngebotState({ ...emptyAngebot })
    } finally {
      setIsLoadingVerkaufschance(false)
      setLoadingState(false)
      setIsLoading(false)
    }
  }

  const fetchAngebot = async () => {
    try {
      setLoadingState(true)
      const response = await fetch(`/api/offers/${angebotId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch offer")
      }
      const data = await response.json()
      setAngebotState(data)
      setOffer(data)
      setCurrentVersion(data.currentVersion)
    } catch (error) {
      console.error("Error fetching offer:", error)
      toastLib({
        title: "Fehler",
        description: "Das Angebot konnte nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoadingState(false)
      setIsLoading(false)
    }
  }

  // Aktualisiere die Auftragsbestätigungsnummer, wenn sich das Angebot ändert
  useEffect(() => {
    if (offer) {
      setOrderConfirmationData((prev) => ({
        ...prev,
        confirmationNumber: `AB-${offer.offerNumber || "00000"}`,
      }))
    }
  }, [offer])

  const handleSave = async (updatedAngebot: Angebot) => {
    try {
      setSavingState(true)
      const url = isNew ? "/api/offers" : `/api/offers/${angebotId}`
      const method = isNew ? "POST" : "PUT"

      // Füge Verkaufschance-ID hinzu, wenn vorhanden
      if (verkaufschance && isNew) {
        updatedAngebot.verkaufschanceId = verkaufschanceId
      }

      console.log("Saving offer:", updatedAngebot)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAngebot),
      })

      if (!response.ok) {
        throw new Error("Failed to save offer")
      }

      const savedAngebot = await response.json()
      console.log("Saved offer:", savedAngebot)

      toastLib({
        title: "Erfolg",
        description: `Angebot wurde ${isNew ? "erstellt" : "aktualisiert"}.`,
      })

      if (isNew) {
        // Redirect to the edit page for the newly created offer
        router.push(`/angebote/${savedAngebot.id}`)
      } else {
        // Update the local state
        setAngebotState(savedAngebot)
        setOffer(savedAngebot)
        setCurrentVersion(savedAngebot.currentVersion)
      }
    } catch (error) {
      console.error("Error saving offer:", error)
      toastLib({
        title: "Fehler",
        description: `Das Angebot konnte nicht ${isNew ? "erstellt" : "aktualisiert"} werden.`,
        variant: "destructive",
      })
    } finally {
      setSavingState(false)
      setIsSaving(false)
    }
  }

  const handleChange = (updatedAngebot: Angebot) => {
    setAngebotState(updatedAngebot)
    setOffer(updatedAngebot)
    setCurrentVersion(updatedAngebot.currentVersion)
  }

  if (loading || isLoading || isLoadingVerkaufschance) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size={40} />
        <p className="mt-4 text-muted-foreground">
          {isLoadingVerkaufschance ? "Verkaufschance wird geladen..." : "Angebot wird geladen..."}
        </p>
      </div>
    )
  }

  // Debug-Ausgabe vor dem Rendern
  console.log("Rendering AngebotEditor with angebot:", angebot)

  return <AngebotEditor angebot={angebot || undefined} isNew={isNew} onSave={handleSave} onChange={handleChange} />
}

// Stelle sicher, dass die Komponente keine eigene Layout-Struktur hat, die mit dem MainLayout kollidieren könnte

// Entferne jegliche Container-Elemente, die mit dem MainLayout kollidieren könnte
// und stelle sicher, dass die Komponente nur ihren eigenen Inhalt rendert

// Wenn die Komponente einen eigenen Container hat, entferne ihn oder passe ihn an
// Beispiel: Wenn es einen Container mit "container mx-auto py-6" gibt, entferne ihn,
// da dieser bereits in der Page-Komponente definiert ist
