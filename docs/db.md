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

# Quote Configuration
QUOTE_NUMBER_START=1000  # Starting number for quote numbering (ANG-YYYY-XXXX)
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

#### Working with Soft Deletes

```typescript
// ✅ Correct - filter out soft deleted records in normal queries
const activeArticles = await db
  .select()
  .from(articles)
  .where(eq(articles.deleted, false));

// ✅ Correct - include soft deleted records when needed
const allArticles = await db
  .select()
  .from(articles)
  .where(eq(articles.deleted, true));

// ✅ Correct - soft delete a record
await db.update(articles).set({
  deleted: true,
  updatedAt: sql`NOW()`
}).where(eq(articles.id, articleId));

// ✅ Correct - restore a soft deleted record
await db.update(articles).set({
  deleted: false,
  updatedAt: sql`NOW()`
}).where(eq(articles.id, articleId));
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
  deleted: boolean('deleted').notNull().default(false),
  
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
- `deleted`: Soft delete flag (boolean, defaults to false)

### 4. Soft Delete Support
All major tables include soft delete functionality:
- `deleted`: Boolean flag (defaults to false)
- When `deleted = true`, the record is considered "soft deleted"
- Soft deleted records should be filtered out in normal queries
- Use `WHERE deleted = false` in queries to exclude soft deleted records

### 5. Lock Fields for Edit Protection
For tables that need edit protection:
- `blocked`: Timestamp when locked (null when not locked)
- `blockedBy`: User ID who has the lock

### 6. Proper Error Handling
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

## Change History / Audit System

The project includes a comprehensive audit system that tracks all changes to database entities using Drizzle transactions.

### Features

- **Transaction-based**: Ensures both the main operation and audit log are saved atomically
- **Entity-agnostic**: Works with any table (articles, blocks, users, etc.)
- **Detailed tracking**: Records exactly what changed, who made the change, and when
- **Performance optimized**: Uses proper indexing for fast queries
- **Type-safe**: Full TypeScript support with proper error handling
- **Soft Delete Integration**: Delete operations now perform soft deletes instead of hard deletes
- **Cascading Soft Deletes**: When articles or blocks are soft deleted, their associated `blockContent` records are also soft deleted to maintain referential integrity
- **Proper Entity ID Handling**: Audit logs are created with correct entity IDs after insert operations

### Usage

#### Audited Operations

Replace standard database operations with audited versions:

```typescript
import { 
  auditedArticleOperations, 
  auditedBlockOperations, 
  auditedBlockContentOperations 
} from '@/lib/db/audit';

// Create with audit
const newArticle = await auditedArticleOperations.create(
  { number: 'ART-001', price: '100.00', hideTitle: false },
  userId,
  { reason: 'New article creation', source: 'web-interface' }
);

// Update with audit
const updatedArticle = await auditedArticleOperations.update(
  articleId,
  { price: '120.00' },
  userId,
  { reason: 'Price adjustment' }
);

// Delete with audit
const deletedArticle = await auditedArticleOperations.delete(
  articleId,
  userId,
  { reason: 'Article discontinued' }
);

// Block content operations with audit
const newContent = await auditedBlockContentOperations.create(
  { blockId, title: 'New Title', content: 'Content...', languageId },
  userId,
  { reason: 'Content created', source: 'content-editor' }
);

// Bulk content replacement (used by save operations)
await auditedBlockContentOperations.replaceAll(
  'blocks', // or 'articles'
  blockId,
  contentArray,
  userId,
  { reason: 'Content updated' }
);
```

#### Query Change History

```typescript
import { auditQueries, ENTITY_TYPES } from '@/lib/db/audit';
import { 
  getArticleChangeHistory, 
  getArticleContentChangeHistory,
  getBlockChangeHistory,
  getBlockContentChangeHistory 
} from '@/lib/db/articles'; // or blocks

// Get all changes for a specific article
const history = await auditQueries.getEntityHistory(ENTITY_TYPES.ARTICLES, articleId);

// Get article-specific change history (convenient wrapper)
const articleHistory = await getArticleChangeHistory(articleId);
const articleContentHistory = await getArticleContentChangeHistory(articleId);

// Get block-specific change history
const blockHistory = await getBlockChangeHistory(blockId);
const blockContentHistory = await getBlockContentChangeHistory(blockId);

// Get recent changes by a user
const userActivity = await auditQueries.getUserActivity(userId);

// Get recent changes across all entities
const recentChanges = await auditQueries.getRecentChanges();
```

### Enhanced Entity Queries with lastChangedBy

The main query functions now include information about who made the most recent change:

```typescript
// Enhanced article query with change information
const article = await getArticleWithCalculations('article-id');
if (article?.lastChangedBy) {
  console.log('Last changed by:', article.lastChangedBy.name || article.lastChangedBy.email);
  console.log('Change timestamp:', article.lastChangedBy.timestamp);
  console.log('Change type:', article.lastChangedBy.changeType); // 'article' or 'content'
}

// Enhanced block query with change information
const block = await getBlockWithContent('block-id');
if (block?.lastChangedBy) {
  console.log('Last changed by:', block.lastChangedBy.name || block.lastChangedBy.email);
  console.log('Change timestamp:', block.lastChangedBy.timestamp);
  console.log('Change type:', block.lastChangedBy.changeType); // 'block' or 'content'
}
```

The `lastChangedBy` object contains:
- `id`: User ID who made the change
- `name`: User's display name (can be null)
- `email`: User's email address  
- `timestamp`: When the change was made
- `changeType`: 'article'/'block' for entity changes, 'content' for content changes

This provides a complete picture of who last touched any part of the entity, considering both the main entity and its associated content.

### Transaction Guarantees

All audited operations use Drizzle transactions to ensure:
- Both the main operation AND audit log succeed together
- OR both fail together (no partial writes)
- Complete data consistency and reliability

### Audit Data Structure

Each audit entry contains:
- **entityType**: The table name ('articles', 'blocks', 'block_content', etc.)
- **entityId**: ID of the changed record
- **action**: INSERT, UPDATE, or DELETE
- **changedFields**: For UPDATE: `{field: {old: value, new: value}}`, for INSERT/DELETE: full record
- **userId**: Who made the change
- **timestamp**: When the change occurred (UTC)
- **metadata**: Additional context (IP, user agent, reason, etc.)

### Tracked Entities

- **Articles** (`articles`): Article properties (number, price, hideTitle)
- **Blocks** (`blocks`): Block properties (name, standard, mandatory, position, etc.)
- **Block Content** (`block_content`): Content for both blocks and articles (title, content, language)
- Ready to extend: Users, roles, permissions, and other entities

## Database Helper Functions

The project provides comprehensive helper functions for database operations, organized by entity type. All functions follow consistent patterns with proper error handling, authentication, and type safety.

### Articles (`lib/db/articles.ts`)

#### Core Operations
- `getArticles()` - Fetch all articles ordered by number
- `getArticleWithCalculations(articleId)` - Get single article with calculations and content
- `getArticlesWithCalculationCounts()` - Get all articles with calculation counts
- `getArticleList()` - Optimized query for table displays with titles and languages
- `createArticle(articleData)` - Create new article with audit
- `saveArticle(articleId, articleData)` - Update article properties with audit and edit lock check
- `deleteArticle(articleId)` - Delete article with audit and edit lock check

#### Calculation Management
- `saveArticleCalculations(articleId, calculations)` - Replace all calculations for an article
- `addCalculationToArticle(articleId, name, type, value, order)` - Add single calculation
- `removeCalculationFromArticle(calculationItemId)` - Remove specific calculation
- `getCalculationItems()` - Get global calculation items (not tied to articles)
- `createCalculationItem(itemData)` - Create global calculation item
- `saveCalculationItem(itemId, itemData)` - Update calculation item
- `deleteCalculationItem(itemId)` - Delete calculation item

#### Advanced Operations
- `createNewArticle(articleData)` - Create article with default calculations from config
- `createArticleWithDefaults(articleData)` - Alias for createNewArticle
- `copyArticle(originalArticleId)` - Copy article with all calculations and content
- `saveArticleContent(articleId, contentData)` - Save article content with audit

#### History & Auditing
- `getArticleChangeHistory(articleId, limit)` - Get change history for article
- `getArticleContentChangeHistory(articleId, limit)` - Get change history for article content

#### Types
- `ArticleWithCalculations` - Article with calculations, content, and lastChangedBy info
- `EditLockError` - Custom error for edit lock conflicts

### Blocks (`lib/db/blocks.ts`)

#### Core Operations
- `getBlocksWithContent()` - Fetch all blocks with their content
- `getBlockWithContent(blockId)` - Get single block with content and change info
- `getBlockList()` - Optimized query for table displays with language info
- `createBlock()` - Create new block with audit
- `saveBlockProperties(blockId, blockData)` - Update block properties with audit and edit lock check
- `deleteBlock(blockId)` - Delete block and content with audit and edit lock check

#### Content Management
- `saveBlockContent(blockId, blockContents)` - Save/replace all content for a block with audit
- `getLanguages()` - Fetch all available languages

#### Advanced Operations
- `copyBlock(originalBlockId)` - Copy block with all content and proper positioning

#### History & Auditing
- `getBlockChangeHistory(blockId, limit)` - Get change history for block
- `getBlockContentChangeHistory(blockId, limit)` - Get change history for block content

#### Types
- `BlockWithContent` - Block with content and lastChangedBy info
- `EditLockError` - Custom error for edit lock conflicts

### Sales Opportunities (`lib/db/sales-opportunities.ts`)

#### Core Operations
- `getSalesOpportunities()` - Fetch all sales opportunities ordered by creation date
- `getSalesOpportunityWithDetails(salesOpportunityId)` - Get single opportunity with client, contact, and sales rep details
- `getSalesOpportunitiesList()` - Optimized query for table displays with relationship counts
- `createSalesOpportunity(salesOpportunityData)` - Create new sales opportunity
- `saveSalesOpportunity(salesOpportunityId, salesOpportunityData)` - Update opportunity with edit lock check
- `deleteSalesOpportunity(salesOpportunityId)` - Delete opportunity (validates no related quotes exist)

#### Advanced Operations
- `copySalesOpportunity(originalSalesOpportunityId)` - Copy opportunity with reset status

#### History & Auditing
- `getSalesOpportunityChangeHistory(salesOpportunityId, limit)` - Get change history

#### Types
- `SalesOpportunityWithDetails` - Opportunity with client, contact person, sales rep, and quote count
- `EditLockError` - Custom error for edit lock conflicts

### Contact Persons (`lib/db/contact-persons.ts`)

#### Core Operations
- `getContactPersons()` - Fetch all contact persons ordered by name
- `getContactPersonsByClient(clientId)` - Get contact persons for specific client
- `getContactPersonWithDetails(contactPersonId)` - Get single contact person with client details
- `getContactPersonsList()` - Optimized query for table displays with sales opportunity counts
- `createContactPerson(contactPersonData)` - Create new contact person
- `saveContactPerson(contactPersonId, contactPersonData)` - Update contact person
- `deleteContactPerson(contactPersonId)` - Delete contact person (validates no related opportunities exist)

#### History & Auditing
- `getContactPersonChangeHistory(contactPersonId, limit)` - Get change history

#### Types
- `ContactPersonWithDetails` - Contact person with client info and sales opportunity count

### Quotes (`lib/db/quotes.ts`)

#### Core Operations
- `getQuotes()` - Fetch all quotes ordered by creation date
- `getQuotesBySalesOpportunity(salesOpportunityId)` - Get quotes for specific sales opportunity
- `getQuoteWithDetails(quoteId)` - Get complete quote with variants, versions, and positions
- `getQuotesList()` - Optimized query for table displays with variant counts
- `createQuote(quoteData)` - Create new quote
- `createNewQuote(quoteData)` - Create new quote with automatic numbering (uses QUOTE_NUMBER_START env variable)
- `createQuoteWithVariantAndVersion(quoteData)` - Create complete quote structure with first variant and version in single transaction
- `saveQuote(quoteId, quoteData)` - Update quote with edit lock check
- `deleteQuote(quoteId)` - Delete quote and all related data (cascade)

#### Variant Management
- `getQuoteVariantsByQuote(quoteId)` - Get variants for a quote with versions
- `createQuoteVariant(variantData)` - Create new quote variant
- `getNextVariantNumber(quoteId)` - Get next variant number (1, 2, 3, etc.) - returns integer
- `createVariantForQuote(quoteId, languageId)` - Create new variant with auto-incremented number and first version

#### Version Management
- `getQuoteVersionsByVariant(variantId)` - Get versions for a variant with positions
- `createQuoteVersion(versionData)` - Create new version (handles latest version flag)
- `getNextVersionNumber(variantId)` - Get next version number (1, 2, 3, etc.) - returns integer
- `createVersionForVariant(variantId)` - Create new version with auto-incremented number and proper latest flag handling

#### Position Management
- `getQuotePositionsByVersion(versionId)` - Get positions for a version with article/block details, ordered by parent and position number
- `addQuotePosition(positionData)` - Add position to quote version
- `updateQuotePositionsOrder(versionId, positionUpdates)` - Update position order and parent relationships for drag/drop functionality

**Quote Position Tree Structure**: Quote positions now support hierarchical tree structures through the `quotePositionParentId` field. This nullable field allows positions to reference other positions within the same quote version, enabling:
- Nested position structures (sub-positions under main positions)
- Hierarchical organization of quote content
- Parent-child relationships for complex quote structures
- Proper cascade deletion when parent positions are removed

**Drag & Drop Functionality**: The ArboristTree component in InteractiveSplitPanel supports drag and drop reordering with the following business rules:
- Articles cannot have children (only blocks can have children)
- Maximum nesting depth of 4 levels
- Position numbers are unique within each parent level (constraint: `version_id`, `quote_position_parent_id`, `position_number`)
- Visual grip indicator (GripVertical icon) shows when drag is enabled
- Chevron (>) and folder icons only show when node actually has children
- Optimistic UI updates with database synchronization
- Two-step database update to avoid constraint violations during reordering
- API endpoint: `PUT /api/quotes/versions/{versionId}/positions/reorder`

**Right Panel Node Details**: When a node is selected in the tree, the right panel displays:
- Input fields for title (from `quote_positions.title`) that are disabled when not in edit mode
- Rich text editor populated with description (from `quote_positions.description`) with read-only mode when not editing
- Tabbed interface with separate tabs for input, calculation (articles), and preview
- Data is loaded from database via `transformPositionsToTreeData` function

**Quote Numbering**: Quote numbers are generated in the format `ANG-YYYY-XXXX` where YYYY is the current year and XXXX is a zero-padded number starting from the `QUOTE_NUMBER_START` environment variable (defaults to 1). The numbering continues incrementally from `QUOTE_NUMBER_START + existing_quote_count`.

#### Advanced Operations
- `copyQuote(originalQuoteId)` - Copy quote (basic copy, full copy with variants/versions TODO)

#### History & Auditing
- `getQuoteChangeHistory(quoteId, limit)` - Get change history

#### Types
- `QuoteWithDetails` - Complete quote with sales opportunity, variants, and counts
- `QuoteVariantWithVersions` - Variant with language and versions (includes both variantDescriptor string and variantNumber integer)
- `QuoteVersionWithPositions` - Version with positions and counts (versionNumber is integer)
- `QuotePositionWithDetails` - Position with article or block details
- `EditLockError` - Custom error for edit lock conflicts

#### Schema Changes
- **variantNumber**: Added integer field to `quoteVariants` table alongside existing `variantDescriptor` text field
- **versionNumber**: Changed from text to integer type in `quoteVersions` table
- Both number fields are used internally for sorting and calculations, while descriptor fields maintain backward compatibility

### Common Patterns

#### Error Handling
All helper functions follow consistent error handling:
```typescript
try {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Benutzer nicht authentifiziert');
  }
  // ... operation
} catch (error) {
  if (error instanceof EditLockError) {
    throw error; // Re-throw edit lock errors as-is
  }
  console.error('Error description:', error);
  throw new Error('User-friendly error message');
}
```

#### Edit Lock Protection
Functions that modify data check edit locks:
```typescript
async function checkEntityEditable(entityId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', entityId);
  }
  
  // Check if entity is locked by another user
  if (entity.blocked && entity.blockedBy && entity.blockedBy !== user.dbUser.id) {
    throw new EditLockError('Entity locked by another user', entityId, entity.blockedBy, entity.blocked);
  }
}
```

#### List Functions
Optimized queries for table displays return minimal data:
```typescript
export async function getEntityList(): Promise<{
  id: string;
  name: string;
  // ... essential display fields
  relationshipCount: number;
  createdAt: string;
  updatedAt: string;
}[]> {
  // Efficient query with relationship counts
}
```

#### Enriched Detail Functions
Detail functions return complete entity information:
```typescript
export type EntityWithDetails = Entity & {
  relatedEntity: RelatedEntity;
  relationshipCount: number;
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
  } | null;
};
```

#### Authentication Integration
All functions use `getCurrentUser()` for authentication:
```typescript
const user = await getCurrentUser();
if (!user) {
  throw new Error('Benutzer nicht authentifiziert');
}
// Use user.dbUser.id for operations
```

#### Relationship Validation
Delete functions validate relationships:
```typescript
// Check if there are related records
const [relatedCount] = await db
  .select({ count: count(relatedTable.id) })
  .from(relatedTable)
  .where(eq(relatedTable.parentId, entityId));

if (Number(relatedCount?.count || 0) > 0) {
  throw new Error('Cannot delete: related records exist');
}
```

## Soft Delete and Restore Functions

The following functions are available for soft deleting and restoring entities:

### Articles
- `softDeleteArticle(articleId: string): Promise<void>` - Soft delete an article
- `restoreArticle(articleId: string): Promise<void>` - Restore a soft deleted article
- **Cascading Delete**: When an article is soft deleted, all its associated `blockContent` records are also soft deleted
- **Cascading Restore**: When an article is restored, all its associated soft-deleted `blockContent` records are also restored

### Blocks
- `softDeleteBlock(blockId: string): Promise<void>` - Soft delete a block
- `restoreBlock(blockId: string): Promise<void>` - Restore a soft deleted block
- **Cascading Delete**: When a block is soft deleted, all its associated `blockContent` records are also soft deleted
- **Cascading Restore**: When a block is restored, all its associated soft-deleted `blockContent` records are also restored

### Sales Opportunities
- `softDeleteSalesOpportunity(salesOpportunityId: string): Promise<void>` - Soft delete a sales opportunity
- `restoreSalesOpportunity(salesOpportunityId: string): Promise<void>` - Restore a soft deleted sales opportunity

### Contact Persons
- `softDeleteContactPerson(contactPersonId: string): Promise<void>` - Soft delete a contact person
- `restoreContactPerson(contactPersonId: string): Promise<void>` - Restore a soft deleted contact person

### Quotes
- `softDeleteQuote(quoteId: string): Promise<void>` - Soft delete a quote
- `restoreQuote(quoteId: string): Promise<void>` - Restore a soft deleted quote
- **Cascading Delete**: When a quote is soft deleted, all its associated `quoteVariants`, `quoteVersions`, and `quotePositions` are also soft deleted
- **Cascading Restore**: When a quote is restored, all its associated soft-deleted `quoteVariants`, `quoteVersions`, and `quotePositions` are also restored

### Usage Examples

```typescript
// Soft delete an article
await softDeleteArticle('article-id-123');

// Restore a soft deleted article
await restoreArticle('article-id-123');

// Soft delete a sales opportunity
await softDeleteSalesOpportunity('sales-opp-id-456');

// Restore a soft deleted sales opportunity
await restoreSalesOpportunity('sales-opp-id-456');
```

**Note**: All soft delete and restore functions require user authentication and will update the `updatedAt` timestamp automatically.

## File Structure

```
lib/
├── db/
│   ├── index.ts              # Database connection
│   ├── schema.ts             # Database schema definitions (with string timestamps)
│   ├── queries.ts            # Database query functions
│   ├── articles.ts           # Article-specific database operations
│   ├── blocks.ts             # Block-specific database operations
│   ├── sales-opportunities.ts # Sales opportunity database operations
│   ├── contact-persons.ts    # Contact person database operations
│   ├── quotes.ts             # Quote, variant, version, position operations
│   ├── audit.ts              # Transaction-based audit system
│   ├── audit-examples.ts     # Usage examples for audit system
│   ├── migrations/           # Generated migration files
│   └── seeds/                # SQL seed files for initial data
├── auth/
│   └── server.ts             # Server-side authentication utilities (requireAuth)
└── supabase/
    ├── client.ts             # Client-side Supabase instance
    └── server.ts             # Server-side Supabase instance
``` 