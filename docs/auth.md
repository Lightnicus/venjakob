# Server-Side Authentication Utilities

This module provides DRY (Don't Repeat Yourself) server-side authentication utilities that mirror the client-side `useUser` hook functionality.

## Overview

The server-side authentication utilities consolidate user authentication and database fetching logic across API routes, eliminating code duplication and ensuring consistent error handling.

## Functions

### `getCurrentUser()`

Server-side equivalent of the `useUser` hook. Gets the current authenticated user with database info and permissions.

```typescript
import { getCurrentUser } from '@/lib/auth/server';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Access user data
  console.log('Auth User:', user.authUser);
  console.log('DB User:', user.dbUser);
  console.log('Has admin permission:', user.hasPermission(undefined, 'admin'));
  
  return NextResponse.json({ data: 'success' });
}
```

**Returns:** `CurrentUserResult | null`
- `authUser`: Supabase auth user object
- `dbUser`: Database user with permissions
- `hasPermission(permissionName?, resource?)`: Helper function to check permissions
- Returns `null` if not authenticated

### `requireAuth()`

Utility function that requires authentication in API routes. Throws a 401 response if user is not authenticated.

```typescript
import { requireAuth } from '@/lib/auth/server';

export async function POST() {
  try {
    const { authUser, dbUser, hasPermission } = await requireAuth();
    
    // User is guaranteed to be authenticated here
    // Proceed with your logic
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }
    
    // Handle other errors
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Returns:** `NonNullable<CurrentUserResult>`
**Throws:** 401 Response if not authenticated

### `requirePermission(permissionName?, resource?)`

Utility function that requires specific permission in API routes. Throws appropriate response if user doesn't have permission.

```typescript
import { requirePermission } from '@/lib/auth/server';

export async function DELETE() {
  try {
    const { authUser, dbUser } = await requirePermission('delete', 'articles');
    
    // User is guaranteed to have the required permission here
    // Proceed with deletion logic
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    // Handle other errors
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Returns:** `NonNullable<CurrentUserResult>`
**Throws:** 
- 401 Response if not authenticated
- 403 Response if insufficient permissions

## Migration Guide

### Before (Duplicated Logic)

```typescript
// OLD: Each API route duplicated this logic
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Fetch database user record
    const dbUser = await getUserByEmail(user.email!);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch user permissions
    const permissions = await getUserPermissions(dbUser.id);
    
    // Your business logic here...
  } catch (error) {
    // Complex error handling...
  }
}
```

### After (DRY Approach)

```typescript
// NEW: Clean, DRY approach
import { requireAuth } from '@/lib/auth/server';

export async function POST() {
  try {
    const { authUser, dbUser, hasPermission } = await requireAuth();
    
    // Your business logic here...
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Benefits

1. **DRY Principle**: Eliminates code duplication across API routes
2. **Consistent Error Handling**: Unified authentication error responses
3. **Type Safety**: Full TypeScript support with proper typing
4. **Permission Helpers**: Built-in permission checking functionality
5. **Maintainability**: Single source of truth for authentication logic
6. **Performance**: Efficient database queries with proper caching considerations

## Best Practices

1. **Error Handling**: Always handle `Response` errors thrown by `requireAuth`/`requirePermission`
2. **Permissions**: Use `hasPermission()` for conditional logic, `requirePermission()` for access control
3. **Logging**: Add proper error logging for unexpected errors
4. **Migration**: Gradually migrate existing endpoints to use the new utilities

## Example Endpoints

See the following files for real-world usage examples:
- `app/api/users/current/route.ts` - Basic user info endpoint
- `app/api/users/current/unlock-all/route.ts` - Simple authentication requirement
- `app/api/articles/[id]/lock/route.ts` - Complex authentication with business logic 