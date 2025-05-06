"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, UserCog } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock data - in a real app, this would come from an API
const getUserById = (id: string) => {
  const users = [
    {
      id: "USR-001",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      status: true,
      lastLogin: "2023-01-15T10:30:00",
      department: "IT",
      phone: "+49 123 456789",
      createdAt: "2022-05-10T08:30:00",
      permissions: ["create", "edit", "delete", "publish", "admin"],
      avatarUrl: null,
    },
    {
      id: "USR-002",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Manager",
      status: true,
      lastLogin: "2023-01-14T14:45:00",
      department: "Sales",
      phone: "+49 123 456790",
      createdAt: "2022-06-15T09:45:00",
      permissions: ["create", "edit", "publish"],
      avatarUrl: null,
    },
    {
      id: "USR-003",
      name: "Robert Johnson",
      email: "robert.johnson@company.com",
      role: "Sales",
      status: true,
      lastLogin: "2023-01-15T09:15:00",
      department: "Sales",
      phone: "+49 123 456791",
      createdAt: "2022-07-20T11:15:00",
      permissions: ["create", "edit"],
      avatarUrl: null,
    },
    {
      id: "USR-004",
      name: "Emily Davis",
      email: "emily.davis@company.com",
      role: "Sales",
      status: false,
      lastLogin: "2023-01-10T11:20:00",
      department: "Sales",
      phone: "+49 123 456792",
      createdAt: "2022-08-05T14:30:00",
      permissions: ["create", "edit"],
      avatarUrl: null,
    },
  ]

  return users.find((user) => user.id === id)
}

// Activity log mock data
const activityLog = [
  { id: 1, action: "Login", timestamp: "2023-01-15T10:30:00", details: "Successful login from 192.168.1.1" },
  { id: 2, action: "Edit Offer", timestamp: "2023-01-15T11:45:00", details: "Modified offer OFF-2023-001" },
  { id: 3, action: "Create Block", timestamp: "2023-01-14T09:15:00", details: "Created new block 'Introduction'" },
  { id: 4, action: "Publish Offer", timestamp: "2023-01-13T16:30:00", details: "Published offer OFF-2023-002" },
  { id: 5, action: "Login", timestamp: "2023-01-13T08:45:00", details: "Successful login from 192.168.1.1" },
]

export function UserDetails({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchedUser = getUserById(userId)
    setUser(fetchedUser)
    setLoading(false)
  }, [userId])

  const handleDelete = () => {
    // In a real app, this would be an API call
    if (confirm("Are you sure you want to delete this user?")) {
      // Delete user logic
      router.push("/benutzer")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-gray-500 mb-4">The user you are looking for does not exist or has been deleted.</p>
        <Button asChild>
          <Link href="/benutzer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/benutzer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/benutzer/${userId}/bearbeiten`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user.avatarUrl || `/placeholder.svg?key=il9y7&height=96&width=96&query=user profile`}
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "NU"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <Badge variant={user.status ? "default" : "secondary"}>{user.status ? "Active" : "Inactive"}</Badge>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p>{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p>{user.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p>{user.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <p>{new Date(user.lastLogin).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="permissions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            <TabsContent value="permissions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Permissions</CardTitle>
                  <CardDescription>Manage what this user can do in the system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="create" checked={user.permissions.includes("create")} />
                      <Label htmlFor="create">Create Offers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="edit" checked={user.permissions.includes("edit")} />
                      <Label htmlFor="edit">Edit Offers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="delete" checked={user.permissions.includes("delete")} />
                      <Label htmlFor="delete">Delete Offers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="publish" checked={user.permissions.includes("publish")} />
                      <Label htmlFor="publish">Publish Offers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="admin" checked={user.permissions.includes("admin")} />
                      <Label htmlFor="admin">Admin Access</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <UserCog className="mr-2 h-4 w-4" />
                    Update Permissions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent user activity in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLog.map((log) => (
                      <div key={log.id} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-500">{log.details}</p>
                          </div>
                          <p className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View Full Activity Log
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
