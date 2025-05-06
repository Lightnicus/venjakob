import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import crypto from "crypto"

// In a real app, you would store these tokens in a database table
// For simplicity, we're using an in-memory store
const resetTokens = new Map<string, { email: string; expires: Date }>()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return NextResponse.json({
        message: "If your email is registered, you will receive password reset instructions"
      })
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

    return NextResponse.json({
      message: "If your email is registered, you will receive password reset instructions"
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { message: "An error occurred processing your request" },
      { status: 500 }
    )
  }
} 