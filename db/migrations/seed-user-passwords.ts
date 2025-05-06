import { db } from "../db"
import { users } from "../schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function seedUserPasswords() {
  try {
    // Get all existing users
    const existingUsers = await db.select().from(users)
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("password", salt)
    
    // Update each user with the hashed password
    for (const user of existingUsers) {
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id))
    }
    
    console.log(`Successfully updated ${existingUsers.length} users with hashed passwords`)
  } catch (error) {
    console.error("Error updating user passwords:", error)
    throw error
  }
} 