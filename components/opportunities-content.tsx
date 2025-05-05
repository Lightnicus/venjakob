"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, FileText, Plus, Search } from "lucide-react"

// Mock data
const opportunities = [
  {
    id: "OPP-2023-2001",
    title: "Office Expansion Project",
    customer: "Acme Corp",
    stage: "Qualification",
    value: 25000,
  },
  {
    id: "OPP-2023-2002",
    title: "IT Infrastructure Upgrade",
    customer: "TechGiant Inc",
    stage: "Proposal",
    value: 75000,
  },
  {
    id: "OPP-2023-2003",
    title: "Software Implementation",
    customer: "Global Services",
    stage: "Negotiation",
    value: 50000,
  },
  {
    id: "OPP-2023-2004",
    title: "Annual Maintenance Contract",
    customer: "Innovate Solutions",
    stage: "Closed Won",
    value: 15000,
  },
  {
    id: "OPP-2023-2005",
    title: "Hardware Replacement",
    customer: "Manufacturing Inc",
    stage: "Qualification",
    value: 35000,
  },
]

export function OpportunitiesContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState("all")

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStage = stageFilter === "all" || opportunity.stage === stageFilter

    return matchesSearch && matchesStage
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sales Opportunities</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Opportunity
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search opportunities..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="Qualification">Qualification</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Closed Won">Closed Won</SelectItem>
            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="font-medium">{opportunity.id}</TableCell>
                <TableCell>{opportunity.title}</TableCell>
                <TableCell>{opportunity.customer}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      opportunity.stage === "Qualification"
                        ? "bg-blue-100 text-blue-800"
                        : opportunity.stage === "Proposal"
                          ? "bg-purple-100 text-purple-800"
                          : opportunity.stage === "Negotiation"
                            ? "bg-yellow-100 text-yellow-800"
                            : opportunity.stage === "Closed Won"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                    }`}
                  >
                    {opportunity.stage}
                  </span>
                </TableCell>
                <TableCell>${opportunity.value.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/opportunities/${opportunity.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/quotations/new?opportunity=${opportunity.id}`}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Create Quotation</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-medium mb-4">Opportunity Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">ID</h3>
              <p className="mt-1">OPP-2023-2001</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1">Office Expansion Project</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="mt-1">Acme Corp</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stage</h3>
              <p className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Qualification
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Value</h3>
              <p className="mt-1">$25,000</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Expected Close Date</h3>
              <p className="mt-1">March 15, 2023</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Owner</h3>
              <p className="mt-1">John Doe</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">January 10, 2023</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Related Quotations</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Q-2023-1001</TableCell>
                  <TableCell>Office Equipment Supply</TableCell>
                  <TableCell>Jan 15, 2023</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Draft
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/quotations/Q-2023-1001">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href={`/quotations/new?opportunity=OPP-2023-2001`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quotation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
