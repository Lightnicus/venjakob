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

### Authentication in Database Operations

For API routes that require authentication, use the standardized `requireAuth()` pattern:

```typescript
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user using DRY server-side utility
    const { dbUser } = await requireAuth();
    
    const { id } = await params;
    const data = await request.json();
    
    // Update with proper timestamp handling
    await db.update(articles).set({
      ...data,
      updatedAt: sql`NOW()`,  // Use PostgreSQL NOW() for consistency
    }).where(eq(articles.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }
    
    console.error('Database operation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Benefits of `requireAuth()`**:
- Consistent authentication across all routes
- Proper error handling and user context
- DRY principle applied to authentication logic
- TypeScript-safe user information access

## Database Schema

The current schema is found in `/lib/db/schema.ts`

### Timestamp Handling

All timestamp fields in the schema use Drizzle's string mode for consistency and type safety.

#### Schema Configuration

```typescript
// Schema definition
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  blocked: timestamp('blocked', { mode: 'string' }),  // Lock timestamp
  blockedBy: text('blockedBy').references(() => users.id),
  // ... other fields
});

export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  blocked: timestamp('blocked', { mode: 'string' }),  // Lock timestamp
  blockedBy: text('blockedBy').references(() => users.id),
  // ... other fields
});
```

#### Why String Mode?

**Problem Solved**: Drizzle ORM previously defined timestamps as `Date` objects, but Next.js API JSON serialization converted them to strings, causing TypeScript type mismatches.

**Solution**: Using `{ mode: 'string' }` ensures TypeScript types match runtime behavior.

```typescript
// Before (Type mismatch)
createdAt: timestamp('created_at').defaultNow(),  // Type: Date
// But after JSON serialization: "2024-01-15T10:30:00.000Z" (string)

// After (Type consistency)
createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),  // Type: string
// Matches JSON serialization: "2024-01-15T10:30:00.000Z" (string)
```

#### Database Operations

**Always use PostgreSQL's `NOW()` function for timestamp generation**:

```typescript
import { sql } from 'drizzle-orm';

// ✅ Correct - use SQL NOW() for new timestamps
await db.update(articles).set({
  updatedAt: sql`NOW()`,
  blocked: sql`NOW()`
}).where(eq(articles.id, id));

// ✅ Correct - clear timestamps
await db.update(articles).set({
  blocked: null,
  blockedBy: null
}).where(eq(articles.id, id));

// ❌ Incorrect - don't use JavaScript dates
await db.update(articles).set({
  updatedAt: new Date().toISOString(),  // Timezone issues
  blocked: new Date().toISOString()     // Client/server inconsistency
});
```

#### Working with Timestamps

```typescript
// ✅ Correct - timestamps are strings
const article = await db.select().from(articles).where(eq(articles.id, id));
console.log(article.updatedAt); // "2024-01-15T10:30:00.000Z"
console.log(typeof article.updatedAt); // "string"

// ✅ Convert to Date for calculations if needed
const lastUpdate = new Date(article.updatedAt);
const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

// ✅ Display in user's timezone
const userFriendlyDate = new Date(article.updatedAt).toLocaleDateString('de-DE');
```

#### Benefits

- **Type Consistency**: TypeScript types match runtime behavior after JSON serialization
- **Timezone Safety**: All timestamps are UTC strings, avoiding client/server timezone issues
- **Database Atomicity**: PostgreSQL `NOW()` ensures consistent timestamps across operations
- **JSON Compatibility**: No conversion needed when sending data to/from client
- **Debugging Friendly**: Timestamps are human-readable strings in logs and API responses


## Adding New Tables

1. Define your table in `lib/db/schema.ts` using proper timestamp configuration
2. Add corresponding queries in `lib/db/queries.ts`
3. Generate and run migrations:
   ```bash
   pnpm run db:generate
   pnpm run db:push
   ```

### Example: Adding a New Table with Timestamps

```typescript
// lib/db/schema.ts
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  
  // Standard timestamp fields (always include these)
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
  
  // Optional: Lock management fields
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: text('blockedBy').references(() => users.id),
  
  // Other fields...
});

export type NewTable = typeof newTable.$inferSelect;
export type InsertNewTable = typeof newTable.$inferInsert;
```

```typescript
// lib/db/queries.ts
import { NewTable, InsertNewTable } from './schema';

export async function createNewItem(data: Omit<InsertNewTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewTable> {
  const [result] = await db.insert(newTable).values(data).returning();
  return result;
}

export async function updateNewItem(id: string, data: Partial<NewTable>): Promise<void> {
  await db.update(newTable).set({
    ...data,
    updatedAt: sql`NOW()`  // Always update the timestamp
  }).where(eq(newTable.id, id));
}
```

## Best Practices

### 1. Always Use String Mode for Timestamps
```typescript
// ✅ Correct
createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),

// ❌ Incorrect
createdAt: timestamp('created_at').defaultNow(),  // Will cause type issues
```

### 2. Use PostgreSQL NOW() for Updates
```typescript
// ✅ Correct
await db.update(table).set({
  updatedAt: sql`NOW()`,
  modifiedField: newValue
});

// ❌ Incorrect
await db.update(table).set({
  updatedAt: new Date().toISOString(),  // Timezone inconsistencies
});
```

### 3. Include Standard Fields
Every table should have:
- `id`: Primary key (UUID recommended)
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

### 4. Lock Fields for Edit Protection
For tables that need edit protection:
- `blocked`: Timestamp when locked (null when not locked)
- `blockedBy`: User ID who has the lock

### 5. Proper Error Handling
```typescript
// ✅ Correct error handling
try {
  const { dbUser } = await requireAuth();
  await db.update(table).set({ /* ... */ });
} catch (error) {
  if (error instanceof Response) {
    return error;  // Authentication error
  }
  // Handle database errors
}
```

## Troubleshooting

### Common Issues

#### TypeScript Errors with Timestamps
```typescript
// Error: Type 'string' is not assignable to type 'Date'
// Solution: Ensure schema uses { mode: 'string' }
createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
```

#### Timezone Display Issues
```typescript
// Problem: Timestamps showing wrong time
// Solution: Remember timestamps are UTC strings
const userTime = new Date(article.createdAt).toLocaleString('de-DE', {
  timeZone: 'Europe/Berlin'  // Or user's preferred timezone
});
```

#### Lock Conflicts in Development
```typescript
// Problem: Resources stuck in locked state
// Solution: Clear locks manually or use unlock-all endpoint
await db.update(articles).set({
  blocked: null,
  blockedBy: null
}).where(eq(articles.blockedBy, userId));
```

#### Migration Issues
```bash
# Problem: Schema changes not reflected
# Solution: Generate and push migrations
pnpm run db:generate
pnpm run db:push

# For development, you can also reset completely
# WARNING: This will delete all data
pnpm run db:push --force
```

### Performance Tips

1. **Use Indexes**: Add indexes for frequently queried fields
2. **Batch Operations**: Use transactions for multiple related operations
3. **Proper Pagination**: Use limit/offset for large datasets
4. **Connection Pooling**: Supabase handles this automatically

## File Structure

```
lib/
├── db/
│   ├── index.ts          # Database connection
│   ├── schema.ts         # Database schema definitions (with string timestamps)
│   ├── queries.ts        # Database query functions
│   ├── articles.ts       # Article-specific database operations
│   ├── blocks.ts         # Block-specific database operations  
│   ├── migrations/       # Generated migration files
│   └── seeds/            # SQL seed files for initial data
├── auth/
│   └── server.ts         # Server-side authentication utilities (requireAuth)
└── supabase/
    ├── client.ts         # Client-side Supabase instance
    └── server.ts         # Server-side Supabase instance
``` 