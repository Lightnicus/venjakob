"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, FileText, Edit, RefreshCw } from "lucide-react"
import { IconButton } from "@/components/icon-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { fetchSalesOpportunities } from "@/lib/crm-service"

export function VerkaufschancenTable() {
  const router = useRouter()
  const [verkaufschancen, setVerkaufschancen] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVerkaufschancen()
  }, [])

  const loadVerkaufschancen = async () => {
    setIsLoading(true)
    try {
      const data = await fetchSalesOpportunities()
      setVerkaufschancen(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading sales opportunities:", error)
      setVerkaufschancen([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (id: string) => {
    router.push(`/verkaufschancen/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/verkaufschancen/${id}/bearbeiten`)
  }

  const handleCreateOffer = (id: string) => {
    console.log("Creating offer from sales opportunity with ID:", id)
    router.push(`/angebote/neu?verkaufschance=${id}`)
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

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge>Unbekannt</Badge>

    switch (status.toLowerCase()) {
      case "gewonnen":
        return <Badge className="bg-green-500">Gewonnen</Badge>
      case "verloren":
        return <Badge className="bg-red-500">Verloren</Badge>
      case "in bearbeitung":
        return <Badge className="bg-blue-500">In Bearbeitung</Badge>
      case "angeboten":
        return <Badge className="bg-yellow-500">Angeboten</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Verkaufschancen</CardTitle>
        <Button variant="outline" size="sm" onClick={loadVerkaufschancen} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Aktualisiere...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stichwort</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Volumen</TableHead>
                <TableHead>Liefertermin</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verkaufschancen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Keine Verkaufschancen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                verkaufschancen.map((verkaufschance) => (
                  <TableRow key={verkaufschance.ID}>
                    <TableCell className="font-medium">{verkaufschance.KEYWORD}</TableCell>
                    <TableCell>{verkaufschance.ACCOUNTINFORMATION}</TableCell>
                    <TableCell>{getStatusBadge(verkaufschance.STATUS)}</TableCell>
                    <TableCell>{verkaufschance.DISTRIBUTIONPHASE || "-"}</TableCell>
                    <TableCell>
                      {formatCurrency(verkaufschance.VJ_ANGEBOTSVOLUMEN, verkaufschance.CURRENCYNAT)}
                    </TableCell>
                    <TableCell>{formatDate(verkaufschance.VJ_LIEFERTERMIN)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          icon={Eye}
                          label="Verkaufschance ansehen"
                          onClick={() => handleView(verkaufschance.ID)}
                        />
                        <IconButton
                          icon={Edit}
                          label="Verkaufschance bearbeiten"
                          onClick={() => handleEdit(verkaufschance.ID)}
                        />
                        <IconButton
                          icon={FileText}
                          label="Angebot erstellen"
                          onClick={() => handleCreateOffer(verkaufschance.ID)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
