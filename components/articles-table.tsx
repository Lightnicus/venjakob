"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search } from "lucide-react"

// Mock data
const articles = [
  {
    id: "ART-001",
    name: "Dell XPS 13 Laptop",
    description: "13-inch premium laptop with Intel Core i7",
    category: "Hardware",
    price: 1299.99,
  },
  {
    id: "ART-002",
    name: "27-inch 4K Monitor",
    description: "Ultra HD monitor with USB-C connectivity",
    category: "Hardware",
    price: 399.99,
  },
  {
    id: "ART-003",
    name: "Office Suite Pro",
    description: "Professional office software suite (annual license)",
    category: "Software",
    price: 99.99,
  },
  {
    id: "ART-004",
    name: "Cloud Storage 1TB",
    description: "1TB secure cloud storage (annual subscription)",
    category: "Services",
    price: 120.0,
  },
  {
    id: "ART-005",
    name: "Wireless Keyboard",
    description: "Ergonomic wireless keyboard with numeric keypad",
    category: "Hardware",
    price: 59.99,
  },
  {
    id: "ART-006",
    name: "Project Management Software",
    description: "Enterprise project management solution (per user)",
    category: "Software",
    price: 25.0,
  },
  {
    id: "ART-007",
    name: "IT Support (Basic)",
    description: "8x5 IT support package (monthly)",
    category: "Services",
    price: 500.0,
  },
  {
    id: "ART-008",
    name: "IT Support (Premium)",
    description: "24x7 IT support package (monthly)",
    category: "Services",
    price: 1200.0,
  },
]

export function ArticlesTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search articles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Hardware">Hardware</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Services">Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.id}</TableCell>
                <TableCell>{article.name}</TableCell>
                <TableCell className="hidden md:table-cell">{article.description}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      article.category === "Hardware"
                        ? "bg-blue-100 text-blue-800"
                        : article.category === "Software"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {article.category}
                  </span>
                </TableCell>
                <TableCell>${article.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/articles/${article.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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
