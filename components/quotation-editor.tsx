"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight, Save, Send, CheckCircle, FileText, Calculator, Eye, Settings } from "lucide-react"

interface QuotationEditorProps {
  id: string
}

export function QuotationEditor({ id }: QuotationEditorProps) {
  const [activeTab, setActiveTab] = useState("description")
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Mock data for a quotation
  const quotation = {
    id: id === "new" ? "Q-2023-NEW" : id,
    title: id === "new" ? "" : "Office Equipment Supply",
    customer: id === "new" ? "" : "Acme Corp",
    validUntil: id === "new" ? "" : "2023-03-15",
    status: id === "new" ? "Draft" : "Draft",
    description:
      id === "new" ? "" : "This quotation covers the supply of office equipment as per the customer's requirements.",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {id === "new" ? "New Quotation" : `Edit Quotation: ${id}`}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Create Confirmation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <h3 className="font-medium">Structure</h3>
              {sidebarExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>

            {sidebarExpanded && (
              <div className="mt-4 space-y-2">
                <div className="pl-2 border-l-2 border-gray-300">
                  <div className="flex items-center py-1 font-medium">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Main Section
                  </div>

                  <div className="pl-6 space-y-1">
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Introduction</div>
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Scope of Work</div>
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Deliverables</div>
                  </div>
                </div>

                <div className="pl-2 border-l-2 border-gray-300">
                  <div className="flex items-center py-1 font-medium">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Products
                  </div>

                  <div className="pl-6 space-y-1">
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Hardware</div>
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Software</div>
                    <div className="py-1 text-sm hover:bg-gray-100 rounded px-2 cursor-pointer">Services</div>
                  </div>
                </div>

                <div className="pl-2 border-l-2 border-gray-300">
                  <div className="flex items-center py-1 font-medium">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Terms & Conditions
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic info */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quotation-no">Quotation No.</Label>
                <Input id="quotation-no" value={quotation.id} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" defaultValue={quotation.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select defaultValue={quotation.customer || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acme Corp">Acme Corp</SelectItem>
                    <SelectItem value="TechGiant Inc">TechGiant Inc</SelectItem>
                    <SelectItem value="Global Services">Global Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input id="valid-until" type="date" defaultValue={quotation.validUntil} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={quotation.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg border shadow-sm">
            <TabsList className="border-b rounded-none p-0">
              <TabsTrigger
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger
                value="calculation"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculation
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-3 px-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={8}
                    defaultValue={quotation.description}
                    placeholder="Enter quotation description..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calculation" className="p-6">
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Laptops</TableCell>
                        <TableCell>Dell XPS 13</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>$1,200.00</TableCell>
                        <TableCell>$6,000.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monitors</TableCell>
                        <TableCell>27" 4K Display</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>$400.00</TableCell>
                        <TableCell>$2,000.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Software</TableCell>
                        <TableCell>Office Suite (Annual)</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>$100.00</TableCell>
                        <TableCell>$500.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$8,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>$850.00</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$9,350.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold">Quotation: {quotation.id}</h2>
                  <p className="text-gray-500">{quotation.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">From:</h3>
                    <p>Your Company Name</p>
                    <p>123 Business Street</p>
                    <p>Business City, 12345</p>
                    <p>contact@yourcompany.com</p>
                  </div>

                  <div>
                    <h3 className="font-medium">To:</h3>
                    <p>{quotation.customer}</p>
                    <p>Customer Address Line 1</p>
                    <p>Customer City, 54321</p>
                    <p>contact@customer.com</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Description:</h3>
                  <p>{quotation.description}</p>
                </div>

                <div>
                  <h3 className="font-medium">Items:</h3>
                  <div className="rounded-md border mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Laptops</TableCell>
                          <TableCell>Dell XPS 13</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>$1,200.00</TableCell>
                          <TableCell>$6,000.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Monitors</TableCell>
                          <TableCell>27" 4K Display</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>$400.00</TableCell>
                          <TableCell>$2,000.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Software</TableCell>
                          <TableCell>Office Suite (Annual)</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>$100.00</TableCell>
                          <TableCell>$500.00</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$8,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>$850.00</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>$9,350.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="created-by">Created By</Label>
                    <Input id="created-by" value="John Doe" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="created-date">Created Date</Label>
                    <Input id="created-date" value="2023-01-15" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modified-by">Last Modified By</Label>
                    <Input id="modified-by" value="John Doe" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modified-date">Last Modified Date</Label>
                    <Input id="modified-date" value="2023-01-15" readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Enter tags separated by commas" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea id="notes" rows={4} placeholder="Enter internal notes (not visible to customer)..." />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
