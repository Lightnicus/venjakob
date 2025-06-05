import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables - try multiple possible env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Ensure we have a database URL
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

let connectionString = process.env.POSTGRES_URL;

// Add SSL mode disable if not already present (for local development)
if (!connectionString.includes('sslmode')) {
  connectionString += connectionString.includes('?') 
    ? '&sslmode=disable' 
    : '?sslmode=disable';
}

console.log('Connecting to database with URL:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
