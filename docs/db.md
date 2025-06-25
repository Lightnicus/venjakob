# Database Setup with Supabase and Drizzle

This project uses Supabase as the database provider and Drizzle ORM for type-safe database operations.

## Setup Instructions

### 1. Supabase Project Setup
1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy the following values:
   - Project URL
   - Project API keys (anon/public and service_role)
4. Go to Settings > Database and copy the Database URL

### 2. Environment Variables
Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration
DATABASE_URL=your_supabase_database_url_here
```

### 3. Database Migration
Run the following commands to set up your database:

```bash
# Generate migration files
pnpm run db:generate

# Push schema to database
pnpm run db:push
```

## Available Scripts

- `pnpm run db:generate` - Generate migration files from schema changes
- `pnpm run db:migrate` - Run pending migrations
- `pnpm run db:push` - Push schema directly to database (development)
- `pnpm run db:studio` - Open Drizzle Studio (database GUI)
- `pnpm run db:seed` - Run all SQL seed files to populate initial data

## Database Seeding

Initial data is managed through SQL seed files in `lib/db/seeds/`. These files:
- Run in alphabetical order (use numbered prefixes like `01_`, `02_`)
- Are idempotent (safe to run multiple times)
- Use `ON CONFLICT DO NOTHING` to prevent duplicate errors

To seed your database:
```bash
# After setting up schema
pnpm run db:push

# Populate with initial data
pnpm run db:seed
```

## Usage

### Client-side (React Components)
```typescript
import { supabase } from '@/lib/supabase/client';

// Use for authentication, real-time subscriptions, etc.
const { data, error } = await supabase.auth.getUser();
```

### Server-side (API Routes, Server Actions)
```typescript
import { db } from '@/lib/db';
import { createUser, getUserByEmail } from '@/lib/db/queries';

// Use database queries
const user = await getUserByEmail('user@example.com');
const newUser = await createUser({ email: 'new@example.com', name: 'John Doe' });
```

## Database Schema

The current schema is found in `/lib/db/schema.ts`

### Timestamp Handling

All timestamp fields in the schema use Drizzle's string mode for consistency:

```typescript
// Schema definition
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  blocked: timestamp('blocked', { mode: 'string' }),  // Lock timestamp
  // ... other fields
});
```

**Benefits:**
- **Type Consistency**: TypeScript types match runtime behavior after JSON serialization
- **Timezone Safety**: All timestamps are UTC strings, avoiding client/server timezone issues
- **Database Operations**: Use PostgreSQL's `sql`NOW()`` for atomic timestamp generation

**Usage:**
```typescript
// ✅ Correct - timestamps are strings
const article = await db.select().from(articles).where(eq(articles.id, id));
console.log(article.updatedAt); // "2024-01-15T10:30:00.000Z"

// ✅ Correct - use SQL NOW() for updates
await db.update(articles).set({
  updatedAt: sql`NOW()`,
  blocked: sql`NOW()`
}).where(eq(articles.id, id));
```


## Adding New Tables

1. Define your table in `lib/db/schema.ts`
2. Add corresponding queries in `lib/db/queries.ts`
3. Generate and run migrations:
   ```bash
   pnpm run db:generate
   pnpm run db:push
   ```

## File Structure

```
lib/
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Database schema definitions
│   ├── queries.ts        # Database query functions
│   ├── migrations/       # Generated migration files
│   └── seeds/            # SQL seed files for initial data
└── supabase/
    ├── client.ts         # Client-side Supabase instance
    └── server.ts         # Server-side Supabase instance
``` 