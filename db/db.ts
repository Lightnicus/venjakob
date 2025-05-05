import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Database connection string
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/b2b_portal"

// Create postgres client
const client = postgres(connectionString)

// Create drizzle instance
export const db = drizzle(client, { schema })
