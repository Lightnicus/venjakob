// Simple authentication and authorization system

export type UserRole = "admin" | "vertrieb" | "viewer"

export interface AuthUser {
  id: number
  email: string
  name: string
  role: UserRole
}

// Permissions for different actions
export interface Permissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
  canCreateOrderConfirmation: boolean
  canViewAll: boolean
}

// Mock current user (in a real app, this would come from a session)
export const getCurrentUser = (): AuthUser => {
  return {
    id: 1,
    email: "e.pietig@venjakob.de",
    name: "Enrica Pietig",
    role: "vertrieb",
  }
}

// Get permissions based on user role
export const getUserPermissions = (user: AuthUser): Permissions => {
  switch (user.role) {
    case "admin":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canPublish: true,
        canCreateOrderConfirmation: true,
        canViewAll: true,
      }
    case "vertrieb":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canPublish: true,
        canCreateOrderConfirmation: true,
        canViewAll: false,
      }
    case "viewer":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canCreateOrderConfirmation: false,
        canViewAll: true,
      }
    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canPublish: false,
        canCreateOrderConfirmation: false,
        canViewAll: false,
      }
  }
}

// Document locking system
interface LockedDocument {
  id: string
  type: "offer" | "block" | "article"
  userId: number
  userName: string
  lockedAt: Date
}

// In-memory store for locked documents (in a real app, this would be in a database)
const lockedDocuments: LockedDocument[] = []

// Lock a document for editing
export const lockDocument = (id: string, type: "offer" | "block" | "article", user: AuthUser): boolean => {
  // Check if document is already locked
  const existingLock = lockedDocuments.find((doc) => doc.id === id && doc.type === type)

  if (existingLock) {
    // Document is locked by someone else
    if (existingLock.userId !== user.id) {
      return false
    }
    // Document is already locked by this user, update timestamp
    existingLock.lockedAt = new Date()
    return true
  }

  // Lock the document
  lockedDocuments.push({
    id,
    type,
    userId: user.id,
    userName: user.name,
    lockedAt: new Date(),
  })

  return true
}

// Unlock a document
export const unlockDocument = (id: string, type: "offer" | "block" | "article", user: AuthUser): boolean => {
  const index = lockedDocuments.findIndex((doc) => doc.id === id && doc.type === type)

  if (index === -1) {
    return false
  }

  // Only the user who locked it or an admin can unlock
  if (lockedDocuments[index].userId !== user.id && user.role !== "admin") {
    return false
  }

  lockedDocuments.splice(index, 1)
  return true
}

// Get lock information
export const getDocumentLock = (id: string, type: "offer" | "block" | "article"): LockedDocument | null => {
  const lock = lockedDocuments.find((doc) => doc.id === id && doc.type === type)

  return lock || null
}

// Clean up expired locks (locks older than 30 minutes)
export const cleanupExpiredLocks = (): void => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

  const expiredLocks = lockedDocuments.filter((lock) => lock.lockedAt < thirtyMinutesAgo)

  expiredLocks.forEach((lock) => {
    const index = lockedDocuments.findIndex((doc) => doc.id === lock.id && doc.type === lock.type)
    if (index !== -1) {
      lockedDocuments.splice(index, 1)
    }
  })
}
