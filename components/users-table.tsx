"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Edit, Search } from "lucide-react"

// Mock data
const users = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    status: true,
    lastLogin: "2023-01-15T10:30:00",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Manager",
    status: true,
    lastLogin: "2023-01-14T14:45:00",
  },
  {
    id: "USR-003",
    name: "Robert Johnson",
    email: "robert.johnson@company.com",
    role: "Sales",
    status: true,
    lastLogin: "2023-01-15T09:15:00",
  },
  {
    id: "USR-004",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "Sales",
    status: false,
    lastLogin: "2023-01-10T11:20:00",
  },
  {
    id: "USR-005",
    name: "Michael Wilson",
    email: "michael.wilson@company.com",
    role: "Manager",
    status: true,
    lastLogin: "2023-01-15T08:45:00",
  },
  {
    id: "USR-006",
    name: "Sarah Thompson",
    email: "sarah.thompson@company.com",
    role: "Sales",
    status: true,
    lastLogin: "2023-01-14T16:30:00",
  },
  {
    id: "USR-007",
    name: "David Martinez",
    email: "david.martinez@company.com",
    role: "Admin",
    status: false,
    lastLogin: "2023-01-05T13:10:00",
  },
  {
    id: "USR-008",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    role: "Sales",
    status: true,
    lastLogin: "2023-01-15T10:00:00",
  },
]

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Select defaultValue={user.role}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={user.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">{new Date(user.lastLogin).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/users/${user.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
