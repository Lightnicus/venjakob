# System Updates: Timestamp Handling and Authentication Standardization

## Overview

This document summarizes the major changes made to timestamp handling and authentication methods across the codebase to resolve TypeScript compatibility issues and improve system consistency.

## Key Changes Made

### 1. Drizzle Schema Timestamp Modernization

**Problem**: Drizzle ORM schema defined timestamps as `Date` objects, but Next.js API JSON serialization converted them to strings, causing TypeScript type mismatches.

**Solution**: Updated all timestamp fields in the schema to use `{ mode: 'string' }`:

```typescript
// Before
createdAt: timestamp('created_at').defaultNow(),
updatedAt: timestamp('updated_at').defaultNow(),
blocked: timestamp('blocked'),

// After
createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
blocked: timestamp('blocked', { mode: 'string' }),
```

**Benefits**:
- TypeScript types now match runtime behavior after JSON serialization
- Eliminates timezone-related discrepancies between client and server
- Provides consistent string-based timestamp handling

### 2. PostgreSQL NOW() Function Adoption

**Problem**: JavaScript `new Date().toISOString()` generated timestamps on the client/server, leading to timezone inconsistencies.

**Solution**: Replaced JavaScript date generation with PostgreSQL's `sql`NOW()`` function:

```typescript
// Before
blocked: new Date().toISOString(),
updatedAt: new Date().toISOString(),

// After  
blocked: sql`NOW()`,
updatedAt: sql`NOW()`,
```

**Benefits**:
- All timestamps generated at database level in UTC
- Atomic timestamp operations
- Eliminates client/server timezone offset issues

### 3. Authentication Method Standardization

**Problem**: Mix of authentication methods across API routes - some using Supabase `createClient()`, others using DRY `requireAuth()` utility.

**Solution**: Standardized all lock API routes to use `requireAuth()`:

```typescript
// Before (blocks lock route)
const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

// After (blocks lock route)
const { dbUser } = await requireAuth();
```

**Benefits**:
- Consistent authentication handling across all routes
- Proper error handling and user context
- DRY principle applied to authentication logic

### 4. EditLockError Class Update

**Problem**: `EditLockError` class referenced `lockedAt` as `Date | null` but received strings.

**Solution**: Updated type signature to match string-based timestamps:

```typescript
// Before
public readonly lockedAt: Date | null = null

// After
public readonly lockedAt: string | null = null  // ISO string timestamp
```

## Documentation Updates

### Updated Files:

1. **`docs/edit-lock-system.md`**:
   - Updated EditLockError class timestamp type
   - Added comprehensive timestamp handling section
   - Updated database schema examples to show TIMESTAMP fields
   - Added authentication implementation details
   - Fixed EditLockButton component usage examples

2. **`docs/db.md`**:
   - Added detailed timestamp handling section
   - Explained Drizzle string mode configuration
   - Provided usage examples for PostgreSQL NOW() function
   - Highlighted benefits of the new approach

3. **`docs/use-edit-lock.md`**:
   - Updated database schema section
   - Added timestamp handling explanation
   - Fixed example schema definitions
   - Updated extending section with proper field types

## Files Modified

### Core System Files:
- `lib/db/schema.ts` - Updated all timestamp fields to string mode
- `lib/db/articles.ts` - Updated EditLockError constructor, replaced Date operations with sql`NOW()`
- `lib/db/blocks.ts` - Updated EditLockError constructor, replaced Date operations with sql`NOW()`
- `lib/db/queries.ts` - Updated timestamp operations
- `app/api/articles/[id]/lock/route.ts` - Already used requireAuth (no changes needed)
- `app/api/blocks/[id]/lock/route.ts` - Updated to use requireAuth instead of createClient
- All other API routes using timestamps - Updated to use sql`NOW()`

### Component Files:
- `project_components/edit-lock-button.tsx` - Updated to handle string timestamps
- `project_components/article-detail.tsx` - Removed unnecessary type conversions
- `project_components/block-detail.tsx` - Removed unnecessary type conversions

## Testing Verification

- ✅ Build successfully completes with no TypeScript errors
- ✅ All timestamp fields properly typed as strings
- ✅ EditLockButton works consistently for both articles and blocks
- ✅ Lock status displays correctly across all components
- ✅ Timezone issues resolved (timestamps now consistent across different timezones)

## Breaking Changes

**None for end users** - All changes are internal to the system and maintain the same external API surface.

**For developers extending the system**:
- Timestamp fields are now strings, not Date objects
- Use `sql`NOW()`` instead of `new Date().toISOString()` for database operations
- EditLockError constructor expects string timestamps

## Future Considerations

1. **Database Migration**: Current approach is backward compatible, but future migrations should use the new timestamp patterns
2. **New Resource Types**: Follow the updated patterns when adding edit lock functionality to new entities
3. **Timezone Display**: Consider adding user-specific timezone display preferences in the future

## Summary

These changes provide a robust, timezone-safe, and type-consistent foundation for timestamp handling throughout the application while standardizing authentication methods for better maintainability and consistency. 