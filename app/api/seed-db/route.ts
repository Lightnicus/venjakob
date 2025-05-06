/**
 * API Endpoint: /api/seed-db
 * 
 * Description:
 * This endpoint executes the database seed function that populates the database with initial data.
 * It's secured with a secret key that must be passed as a GET parameter.
 * 
 * Usage:
 * GET /api/seed-db?secret=your-secret-key-here
 * 
 * Environment Variables:
 * - DB_SEED_SECRET: Secret key required to authorize access to this endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { seed } from "@/db/migrations/seed";
import { seedUserPasswords } from "@/db/migrations/seed-user-passwords";

export async function GET(request: NextRequest) {
  try {
    // Get the secret from the URL parameters
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");
    
    // Check if the secret matches the environment variable
    const dbSeedSecret = process.env.DB_SEED_SECRET;
    
    if (!dbSeedSecret) {
      return NextResponse.json(
        { error: "DB_SEED_SECRET environment variable is not set" },
        { status: 500 }
      );
    }
    
    if (!secret || secret !== dbSeedSecret) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Execute the seed function
    await seed();
    await seedUserPasswords();
    
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 