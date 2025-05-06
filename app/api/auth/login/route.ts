import { db } from "@/db/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id))

    // Here you would typically generate a JWT token or session
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    )
  }
} 