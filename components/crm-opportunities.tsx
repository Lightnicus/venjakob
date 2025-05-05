"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, LinkIcon } from "lucide-react"
import { fetchSalesOpportunities, type CRMSalesOpportunity } from "@/lib/crm-service"
import { useToast } from "@/hooks/use-toast"

interface CRMOpportunitiesProps {
  onSelectOpportunity?: (opportunity: CRMSalesOpportunity) => void
}

export function CRMOpportunities({ onSelectOpportunity }: CRMOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<CRMSalesOpportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<CRMSalesOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [phaseFilter, setPhaseFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadOpportunities()
  }, [])

  useEffect(() => {
    filterOpportunities()
  }, [opportunities, searchTerm, statusFilter, phaseFilter])

  const loadOpportunities = async () => {
    setIsLoading(true)
    try {
      const data = await fetchSalesOpportunities()
      setOpportunities(data)
    } catch (error) {
      console.error("Error loading sales opportunities:", error)
      toast({
        title: "Error",
        description: "Failed to load sales opportunities from CRM",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOpportunities = () => {
    let filtered = [...opportunities]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (opp) =>
          opp.KEYWORD.toLowerCase().includes(term) ||
          opp.ACCOUNTINFORMATION.toLowerCase().includes(term) ||
          opp.PERSONINCHARGE.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((opp) => opp.STATUS === statusFilter)
    }

    // Apply phase filter
    if (phaseFilter !== "all") {
      filtered = filtered.filter((opp) => opp.DISTRIBUTIONPHASE === phaseFilter)
    }

    setFilteredOpportunities(filtered)
  }

  const handleRefresh = () => {
    loadOpportunities()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "offen":
        return "default"
      case "gewonnen":
        return "success"
      case "verloren":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPhaseBadgeVariant = (phase: string) => {
    switch (phase) {
      case "Anfrage":
        return "outline"
      case "Angebot":
        return "secondary"
      case "Beauftragt":
        return "success"
      default:
        return "outline"
    }
  }

  const formatCurrency = (value?: number, currency = "EUR") => {
    if (value === undefined) return "-"

    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"

    return new Date(dateString).toLocaleDateString("de-DE")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Verkaufschancen aus CRM</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Verkaufschancen durchsuchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="offen">Offen</SelectItem>
            <SelectItem value="gewonnen">Gewonnen</SelectItem>
            <SelectItem value="verloren">Verloren</SelectItem>
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Phase filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Phasen</SelectItem>
            <SelectItem value="Anfrage">Anfrage</SelectItem>
            <SelectItem value="Angebot">Angebot</SelectItem>
            <SelectItem value="Beauftragt">Beauftragt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Verantwortlich</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Liefertermin</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Lade Verkaufschancen...</p>
                </TableCell>
              </TableRow>
            ) : filteredOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-gray-500">Keine Verkaufschancen gefunden</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.GGUID}>
                  <TableCell className="font-medium">{opportunity.KEYWORD}</TableCell>
                  <TableCell>{opportunity.ACCOUNTINFORMATION}</TableCell>
                  <TableCell>{opportunity.PERSONINCHARGE}</TableCell>
                  <TableCell>
                    <Badge variant={getPhaseBadgeVariant(opportunity.DISTRIBUTIONPHASE) as any}>
                      {opportunity.DISTRIBUTIONPHASE}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(opportunity.STATUS) as any}>{opportunity.STATUS}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(opportunity.VJ_ANGEBOTSVOLUMEN, opportunity.CURRENCYNAT)}</TableCell>
                  <TableCell>{formatDate(opportunity.VJ_LIEFERTERMIN)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onSelectOpportunity?.(opportunity)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Verknüpfen
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
