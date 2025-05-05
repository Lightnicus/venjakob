"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Copy, Search } from "lucide-react"

// Mock data
const quotations = [
  { id: "Q-2023-1001", title: "Office Equipment Supply", customer: "Acme Corp", date: "2023-01-15", status: "Draft" },
  {
    id: "Q-2023-1002",
    title: "IT Infrastructure Upgrade",
    customer: "TechGiant Inc",
    date: "2023-01-18",
    status: "Sent",
  },
  {
    id: "Q-2023-1003",
    title: "Annual Maintenance Contract",
    customer: "Global Services",
    date: "2023-01-22",
    status: "Confirmed",
  },
  {
    id: "Q-2023-1004",
    title: "Software Licenses",
    customer: "Innovate Solutions",
    date: "2023-01-25",
    status: "Draft",
  },
  {
    id: "Q-2023-1005",
    title: "Consulting Services",
    customer: "Strategic Consulting",
    date: "2023-01-28",
    status: "Sent",
  },
  {
    id: "Q-2023-1006",
    title: "Hardware Replacement",
    customer: "Manufacturing Inc",
    date: "2023-01-30",
    status: "Confirmed",
  },
  {
    id: "Q-2023-1007",
    title: "Cloud Migration Services",
    customer: "Digital Transformation",
    date: "2023-02-02",
    status: "Draft",
  },
  { id: "Q-2023-1008", title: "Security Assessment", customer: "Secure Systems", date: "2023-02-05", status: "Sent" },
]

export function QuotationsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search quotations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">{quotation.id}</TableCell>
                <TableCell>{quotation.title}</TableCell>
                <TableCell>{quotation.customer}</TableCell>
                <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      quotation.status === "Draft"
                        ? "bg-gray-100 text-gray-800"
                        : quotation.status === "Sent"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {quotation.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/quotations/${quotation.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
