"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AngebotEditor, type Angebot } from "./angebot-editor"
import { useToast as useToastLib } from "@/lib/hooks/use-toast"

interface AngebotEditorWithDbProps {
  angebotId?: string
  isNew?: boolean
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

export function AngebotEditorWithDb({ angebotId, isNew = false }: AngebotEditorWithDbProps) {
  const [activeTab, setActiveTab] = useState("bloecke")
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isCreatingOrderConfirmation, setIsCreatingOrderConfirmation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [offer, setOffer] = useState<any>(null)
  const [currentVersion, setCurrentVersion] = useState<any>(null)
  const { toast } = useToast()
  const [versionChangeData, setVersionChangeData] = useState<VersionChangeData>({
    title: "",
    description: "",
  })
  const [orderConfirmationData, setOrderConfirmationData] = useState<OrderConfirmationData>({
    confirmationNumber: "",
    confirmationDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [angebot, setAngebotState] = useState<Angebot | null>(null)
  const [loading, setLoadingState] = useState(true)
  const [saving, setSavingState] = useState(false)
  const router = useRouter()
  const { toast: toastLib } = useToastLib()

  useEffect(() => {
    if (!isNew && angebotId) {
      fetchAngebot()
    } else {
      setLoadingState(false)
    }
  }, [angebotId, isNew])

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

  const handleCreateVersion = () => {
    setIsCreatingVersion(true)
  }

  const handleSave = async (updatedAngebot: Angebot) => {
    try {
      setSavingState(true)
      const url = isNew ? "/api/offers" : `/api/offers/${angebotId}`
      const method = isNew ? "POST" : "PUT"

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

  const handleSaveOld = async () => {
    setIsSaving(true)

    // Simuliere eine Speicheroperation
    setTimeout(() => {
      toast({
        title: "Gespeichert",
        description: "Änderungen wurden erfolgreich gespeichert",
      })
      setIsSaving(false)
    }, 1000)
  }

  const handleCreateOrderConfirmation = () => {
    setIsCreatingOrderConfirmation(true)
  }

  const handleOrderConfirmationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderConfirmationData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVersionChangeDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVersionChangeData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const createOrderConfirmation = async () => {
    try {
      // Simuliere die Erstellung einer Auftragsbestätigung
      setTimeout(() => {
        toast({
          title: "Auftragsbestätigung erstellt",
          description: `Die Auftragsbestätigung ${orderConfirmationData.confirmationNumber} wurde erfolgreich erstellt`,
        })
        setIsCreatingOrderConfirmation(false)
      }, 1000)
    } catch (error) {
      console.error("Error creating order confirmation:", error)
      toast({
        title: "Fehler",
        description: "Auftragsbestätigung konnte nicht erstellt werden",
        variant: "destructive",
      })
    }
  }

  const createNewVersion = async () => {
    try {
      // Get the latest version number and increment it
      const latestVersion = offer?.versions?.[0]
      const versionNumber = latestVersion
        ? `V${Number.parseInt(latestVersion.versionNumber.replace("V", "")) + 1}`
        : "V1"

      const response = await fetch(`/api/offers/${angebotId}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          versionNumber,
          title: offer?.currentVersion?.title || "",
          description: offer?.currentVersion?.description || "",
          status: "Veröffentlicht",
          recipientName: offer?.currentVersion?.recipientName || "",
          recipientEmail: offer?.currentVersion?.recipientEmail || "",
          recipientPhone: offer?.currentVersion?.recipientPhone || "",
          changeTitle: versionChangeData.title,
          changeDescription: versionChangeData.description,
          publishedById: 1, // In a real app, this would be the current user's ID
          copyFromVersionId: offer?.currentVersion?.id,
          copyPositions: true,
        }),
      })

      if (!response.ok) throw new Error("Failed to create version")

      const newVersion = await response.json()

      // Update the UI
      setOffer({
        ...offer,
        currentVersion: newVersion,
        versions: [newVersion, ...(offer?.versions || [])],
      })
      setCurrentVersion(newVersion)

      toast({
        title: "Erfolg",
        description: `Version ${versionNumber} wurde erfolgreich erstellt und veröffentlicht`,
      })

      setIsCreatingVersion(false)
      setVersionChangeData({ title: "", description: "" })
    } catch (error) {
      console.error("Error creating version:", error)
      toast({
        title: "Fehler",
        description: "Neue Version konnte nicht erstellt werden",
        variant: "destructive",
      })
    }
  }

  const viewVersion = async (versionNumber) => {
    // Finde die Version im Offer-Objekt
    const versionToView = offer?.versions?.find((v) => v.versionNumber === versionNumber)
    if (versionToView) {
      setCurrentVersion(versionToView)
      // Wechseln Sie zur Blöcke-Registerkarte, um die Version anzuzeigen
      setActiveTab("bloecke")
    }
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center h-64">Angebot wird geladen...</div>
  }

  return <AngebotEditor angebot={angebot || undefined} isNew={isNew} onSave={handleSave} onChange={handleChange} />
}
