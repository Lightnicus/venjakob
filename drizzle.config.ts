import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!.includes('?')
      ? process.env.POSTGRES_URL! + '&sslmode=disable'
      : process.env.POSTGRES_URL! + '?sslmode=disable',
  },
  verbose: true,
  strict: true,
});
