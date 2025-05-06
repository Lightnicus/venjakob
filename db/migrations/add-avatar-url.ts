import { db } from "../db"
import { sql } from "drizzle-orm"

export async function addAvatarUrlColumn() {
  try {
    // Add avatarUrl column to users table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255)
    `)

    console.log("Successfully added avatar_url column to users table")
  } catch (error) {
    console.error("Error adding avatar_url column:", error)
    throw error
  }
}

// Run this migration if needed
// addAvatarUrlColumn()
