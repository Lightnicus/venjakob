"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, UserPlus, X, Upload, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/lib/hooks/use-toast"

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
      avatarUrl: "",
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
      avatarUrl: "",
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
      avatarUrl: "",
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
      avatarUrl: "",
    },
  ]

  return users.find((user) => user.id === id)
}

interface UserEditorProps {
  userId?: string
  mode: "create" | "edit"
}

export function UserEditor({ userId, mode }: UserEditorProps) {
  const router = useRouter()
  const { toast } = useToast() // Korrigierter Import
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(mode === "edit")
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Sales",
    department: "Sales",
    phone: "",
    status: true,
    avatarUrl: "",
    permissions: {
      create: false,
      edit: false,
      delete: false,
      publish: false,
      admin: false,
    },
  })

  useEffect(() => {
    if (mode === "edit" && userId) {
      // In a real app, this would be an API call
      const user = getUserById(userId)
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          status: user.status,
          avatarUrl: user.avatarUrl,
          permissions: {
            create: user.permissions.includes("create"),
            edit: user.permissions.includes("edit"),
            delete: user.permissions.includes("delete"),
            publish: user.permissions.includes("publish"),
            admin: user.permissions.includes("admin"),
          },
        })
      }
      setLoading(false)
    }
  }, [userId, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (avatarFile) {
      try {
        setUploadingAvatar(true)

        // Create form data for the API request
        const formData = new FormData()
        formData.append("file", avatarFile)

        // Upload the file to our API endpoint
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to upload avatar")
        }

        // Update the form data with the new avatar URL
        setFormData((prev) => ({
          ...prev,
          avatarUrl: result.filePath,
        }))

        // In a real app, you would also update the user record in the database
        // with the new avatar URL

        toast({
          title: "Avatar uploaded",
          description: "Your profile picture has been updated successfully",
        })

        setAvatarDialogOpen(false)
      } catch (error) {
        console.error("Error uploading avatar:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload avatar",
          variant: "destructive",
        })
      } finally {
        setUploadingAvatar(false)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be an API call to save the user
    console.log("Saving user:", formData)

    toast({
      title: "User saved",
      description: "User information has been updated successfully",
    })

    // Redirect back to users list
    router.push("/benutzer")
  }

  if (loading) {
    return <div>Loading...</div>
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
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Basic user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24 relative group">
                  <AvatarImage
                    src={formData.avatarUrl || `/placeholder.svg?key=il9y7&height=96&width=96&query=user profile`}
                    alt={formData.name || "New User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {formData.name
                      ? formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "NU"}
                  </AvatarFallback>
                </Avatar>

                <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Avatar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Profile Picture</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture. The image will be cropped to fit a square.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview || "/placeholder.svg"}
                              alt="Avatar preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-4 text-gray-500">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm">Click to select an image</p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center"
                          >
                            <span className="sr-only">Select image</span>
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="text-sm text-gray-500">Supported formats: JPEG, PNG, GIF. Max size: 5MB</div>
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAvatarPreview(null)
                          setAvatarFile(null)
                          setAvatarDialogOpen(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAvatarUpload} disabled={!avatarFile || uploadingAvatar}>
                        {uploadingAvatar ? (
                          <>
                            <span className="mr-2">Uploading...</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          </>
                        ) : (
                          "Upload & Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="status"
                      checked={formData.status}
                      onCheckedChange={(checked) => handleSwitchChange("status", checked)}
                    />
                    <Label htmlFor="status">{formData.status ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>Additional information about the user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange("department", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                    <CardDescription>Manage what this user can do in the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="create"
                          checked={formData.permissions.create}
                          onCheckedChange={(checked) => handlePermissionChange("create", checked)}
                        />
                        <Label htmlFor="create">Create Offers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit"
                          checked={formData.permissions.edit}
                          onCheckedChange={(checked) => handlePermissionChange("edit", checked)}
                        />
                        <Label htmlFor="edit">Edit Offers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="delete"
                          checked={formData.permissions.delete}
                          onCheckedChange={(checked) => handlePermissionChange("delete", checked)}
                        />
                        <Label htmlFor="delete">Delete Offers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="publish"
                          checked={formData.permissions.publish}
                          onCheckedChange={(checked) => handlePermissionChange("publish", checked)}
                        />
                        <Label htmlFor="publish">Publish Offers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="admin"
                          checked={formData.permissions.admin}
                          onCheckedChange={(checked) => handlePermissionChange("admin", checked)}
                        />
                        <Label htmlFor="admin">Admin Access</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/benutzer">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button type="submit">
            {mode === "create" ? (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
