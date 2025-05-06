'use server'

import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// In-memory token store (would be in database in production)
const resetTokens = new Map<string, { email: string; expires: Date }>()

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id))

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    return { 
      success: true,
      user: userWithoutPassword
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerUser(name: string, email: string, password: string) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: "Name, email, and password are required" }
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "user", // Default role
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })

    return { 
      success: true,
      user: newUser 
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { success: false, error: "Email is required" }
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return { success: true }
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex")
    
    // Store token with expiration (1 hour from now)
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)
    resetTokens.set(token, { email, expires })

    // In a real app, you would send an email with a link containing the token
    // For development, just log it
    console.log(`Password reset token for ${email}: ${token}`)
    console.log(`Reset URL would be: https://your-domain.com/reset-password?token=${token}`)

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    if (!token || !password) {
      return { success: false, error: "Token and password are required" }
    }

    // Check if token exists and is valid
    const tokenData = resetTokens.get(token)
    if (!tokenData) {
      return { success: false, error: "Invalid or expired token" }
    }

    // Check if token is expired
    if (tokenData.expires < new Date()) {
      resetTokens.delete(token)
      return { success: false, error: "Token has expired" }
    }

    // Get user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, tokenData.email),
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Remove used token
    resetTokens.delete(token)

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
} 