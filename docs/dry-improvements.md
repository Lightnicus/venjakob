# DRY Improvements to Edit Lock System

## Overview

The Edit Lock System has been refactored to eliminate code duplication and improve maintainability through several DRY (Don't Repeat Yourself) improvements. This document details the architectural changes and their benefits.

## Key Improvements

### 1. Generic Lock API Factory

**File**: `lib/api/create-lock-routes.ts`

**Problem**: Each resource type (articles, blocks, quote-versions) had duplicate API route code with nearly identical logic.

**Solution**: Created a generic factory function that generates standardized lock API routes for any resource type.

**Benefits**:
- **Eliminated Code Duplication**: Reduced from ~150 lines per resource to ~14 lines
- **Consistent Behavior**: All resource types now have identical lock behavior
- **Centralized Logic**: Lock logic is maintained in one place
- **Easier Testing**: Single codebase to test for all resource types

**Example Usage**:
```typescript
// Before: Duplicate code for each resource type
// app/api/articles/[id]/lock/route.ts (~150 lines)
// app/api/blocks/[id]/lock/route.ts (~150 lines)  
// app/api/quote-versions/[id]/lock/route.ts (~150 lines)

// After: Generic factory
import { createLockRoutes } from '@/lib/api/create-lock-routes';
import { blocks } from '@/lib/db/schema';

const { GET, POST, DELETE } = createLockRoutes({
  table: blocks,
  columns: {
    id: blocks.id,
    blocked: blocks.blocked,
    blockedBy: blocks.blockedBy,
  },
  entityName: 'block',
  messages: LOCK_ROUTE_CONFIGS.blocks,
});
```

### 2. Centralized Error Handling

**File**: `lib/db/edit-lock-error.ts`

**Problem**: Each resource type had its own error handling with slightly different implementations.

**Solution**: Created a unified `EditLockError` class with generic `resourceId` property.

**Benefits**:
- **Consistent Error Structure**: All lock errors follow the same pattern
- **Generic Resource Support**: Single error class works for all resource types
- **Better TypeScript Support**: Proper typing for all resource types
- **Simplified Error Handling**: API routes use consistent error catching

**Example**:
```typescript
// Before: Resource-specific error properties
class EditLockError extends Error {
  constructor(message: string, articleId: string, ...) // or blockId, quoteId
}

// After: Generic resource ID
class EditLockError extends Error {
  constructor(
    message: string,
    public readonly resourceId: string, // Works for all resource types
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}
```

### 3. Generic Lock Validation

**File**: `lib/db/lock-validation.ts`

**Problem**: Each resource type had duplicate lock validation logic.

**Solution**: Created a generic `checkResourceEditable()` function that works with any lockable resource.

**Benefits**:
- **Reusable Validation**: Single function validates locks for all resource types
- **Consistent Logic**: All resources use identical lock checking
- **Easier Maintenance**: Lock validation logic is centralized
- **Type Safety**: Proper TypeScript support for all resource types

**Example**:
```typescript
// Before: Duplicate validation in each database module
function checkArticleEditable(articleId: string, currentUserId: string) { ... }
function checkBlockEditable(blockId: string, currentUserId: string) { ... }
function checkQuoteVersionEditable(versionId: string, currentUserId: string) { ... }

// After: Generic validation
function checkResourceEditable(
  config: LockValidationConfig,
  resourceId: string,
  currentUserId: string
): void {
  // Generic lock validation logic
  // Works for articles, blocks, quote-versions, and future resources
}
```

### 4. Consistent Database Schema

**Problem**: Different resource types might have had inconsistent lock field implementations.

**Solution**: Standardized all lockable resources to use the same database schema pattern.

**Benefits**:
- **Predictable Structure**: All resources follow the same pattern
- **Generic API Support**: Factory functions work with any resource
- **Easier Queries**: Consistent field names across all tables
- **Future-Proof**: New resources can easily adopt the same pattern

**Schema Pattern**:
```sql
-- Common pattern for all lockable resources
blocked TIMESTAMP,     -- UTC timestamp when locked (NULL when not locked)
blockedBy UUID,        -- User ID who has the lock (REFERENCES auth.users(id))
```

## Implementation Details

### Lock Route Configuration

The generic factory uses configuration objects to define resource-specific behavior:

```typescript
export const LOCK_ROUTE_CONFIGS = {
  articles: {
    entityName: 'article',
    lockMessage: 'Article locked successfully',
    unlockMessage: 'Article unlocked successfully',
    alreadyLockedMessage: 'Article is already locked by',
    notLockedMessage: 'Article is not locked',
  },
  blocks: {
    entityName: 'block',
    lockMessage: 'Block locked successfully',
    unlockMessage: 'Block unlocked successfully',
    alreadyLockedMessage: 'Block is already locked by',
    notLockedMessage: 'Block is not locked',
  },
  'quote-versions': {
    entityName: 'quote version',
    lockMessage: 'Quote version locked successfully',
    unlockMessage: 'Quote version unlocked successfully',
    alreadyLockedMessage: 'Quote version is already locked by',
    notLockedMessage: 'Quote version is not locked',
  },
} as const;
```

### Type Safety

The system maintains full TypeScript support through:

```typescript
export type LockableResource = 'articles' | 'blocks' | 'quote-versions';

export interface LockValidationConfig {
  table: PgTable<any>;
  columns: {
    id: PgColumn<any>;
    blocked: PgColumn<any>;
    blockedBy: PgColumn<any>;
  };
  entityName: string;
  messages: {
    entityName: string;
    lockMessage: string;
    unlockMessage: string;
    alreadyLockedMessage: string;
    notLockedMessage: string;
  };
}
```

## Migration Impact

### Backward Compatibility
- All existing API endpoints maintain the same interface
- No changes required for client-side code
- Existing lock behavior is preserved

### Performance Impact
- **Improved**: Reduced bundle size due to eliminated code duplication
- **Neutral**: Runtime performance remains the same
- **Improved**: Faster development due to centralized logic

### Maintenance Benefits
- **Reduced Bugs**: Single codebase means fewer places for bugs to hide
- **Easier Testing**: Test once, works for all resource types
- **Faster Development**: New resource types can adopt lock system quickly
- **Consistent Behavior**: All resources behave identically

## Future Extensibility

The DRY improvements make it easy to add lock support to new resource types:

1. **Add Database Fields**: Follow the `blocked`/`blockedBy` pattern
2. **Create API Route**: Use the generic factory with appropriate configuration
3. **Update Hook**: Add new resource type to `LockableResource` union
4. **Add Validation**: Use the generic `checkResourceEditable()` function

**Example for a new resource**:
```typescript
// 1. Add to schema
export const newResources = pgTable('new_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... other fields
  blocked: timestamp('blocked'),
  blockedBy: uuid('blocked_by').references(() => users.id),
});

// 2. Create API route
const { GET, POST, DELETE } = createLockRoutes({
  table: newResources,
  columns: {
    id: newResources.id,
    blocked: newResources.blocked,
    blockedBy: newResources.blockedBy,
  },
  entityName: 'new resource',
  messages: LOCK_ROUTE_CONFIGS.newResources,
});

// 3. Update hook type
type LockableResource = 'articles' | 'blocks' | 'quote-versions' | 'new-resources';

// 4. Use in components
const { lockInfo } = useEditLock('new-resources', resourceId);
```

## Conclusion

The DRY improvements to the Edit Lock System have:

- **Eliminated ~400 lines of duplicate code**
- **Improved maintainability** through centralized logic
- **Enhanced consistency** across all resource types
- **Simplified future development** for new resource types
- **Maintained full backward compatibility**

These improvements follow software engineering best practices and make the system more robust and easier to maintain while preserving all existing functionality. 