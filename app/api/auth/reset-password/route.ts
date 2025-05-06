import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// This should be imported from the forgot-password route in a real app
// For simplicity, we're declaring it here as well
const resetTokens = new Map<string, { email: string; expires: Date }>()

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      )
    }

    // Check if token exists and is valid
    const tokenData = resetTokens.get(token)
    if (!tokenData) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (tokenData.expires < new Date()) {
      resetTokens.delete(token)
      return NextResponse.json(
        { message: "Token has expired" },
        { status: 400 }
      )
    }

    // Get user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, tokenData.email),
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
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

    return NextResponse.json({
      message: "Password has been reset successfully"
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { message: "An error occurred resetting your password" },
      { status: 500 }
    )
  }
} 