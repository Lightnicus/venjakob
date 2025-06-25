# Edit Lock System Documentation

## Overview

The Edit Lock System prevents multiple users from editing the same resources (articles and blocks) simultaneously. It provides a DRY (Don't Repeat Yourself) solution with optimistic UI updates, automatic cleanup, and comprehensive user feedback.

## Architecture

### Core Components

1. **`useEditLock` Hook** (`hooks/use-edit-lock.tsx`)
   - Reusable hook for lock management
   - Supports 'articles' and 'blocks' resource types
   - Provides optimistic UI updates
   - Automatic cleanup on component unmount

2. **API Endpoints**
   - `/api/articles/[id]/lock` - GET, POST, DELETE
   - `/api/blocks/[id]/lock` - GET, POST, DELETE
   - Authentication and conflict handling
   - User information retrieval

3. **`EditLockButton` Component** (`project_components/edit-lock-button.tsx`)
   - Reusable UI component
   - Shows different states: normal, locked, editing
   - Automatic lock management

4. **Server-side Auth Utilities** (`lib/auth/server.ts`)
   - DRY authentication utilities for server
   - `getCurrentUser()`, `requireAuth()`, `requirePermission()`

## Usage

### Hook Usage

```typescript
import { useEditLock } from "@/hooks/use-edit-lock";

const MyComponent = ({ resourceId }: { resourceId: string }) => {
  const {
    lockInfo,
    isLoading,
    lockResource,
    unlockResource,
    lockResourceOptimistic,
    unlockResourceOptimistic,
    refreshLockStatus
  } = useEditLock('articles', resourceId);

  // Optimistic locking
  const handleStartEdit = async () => {
    await lockResourceOptimistic();
  };

  // Optimistic unlocking
  const handleStopEdit = async () => {
    await unlockResourceOptimistic();
  };

  return (
    <div>
      {lockInfo.isLocked && lockInfo.lockedByCurrentUser && (
        <p>You are editing this resource</p>
      )}
      {lockInfo.isLocked && !lockInfo.lockedByCurrentUser && (
        <p>Locked by: {lockInfo.lockedByUser?.name}</p>
      )}
    </div>
  );
};
```

### EditLockButton Component

```typescript
import { EditLockButton } from "@/project_components/edit-lock-button";

const MyDetailComponent = ({ resourceId }: { resourceId: string }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <EditLockButton
      resourceType="articles"
      resourceId={resourceId}
      isEditing={isEditing}
      onEditToggle={setIsEditing}
      onSave={handleSave}
      disabled={isSaving}
      initialUpdatedAt={resourceData?.updatedAt}
    />
  );
};
```

## API Reference

### Hook Return Values

```typescript
interface UseEditLockReturn {
  lockInfo: LockInfo;
  isLoading: boolean;
  lockResource: () => Promise<void>;
  unlockResource: () => Promise<void>;
  lockResourceOptimistic: () => Promise<void>;
  unlockResourceOptimistic: () => Promise<void>;
  refreshLockStatus: () => Promise<void>;
}

interface LockInfo {
  isLocked: boolean;
  lockedByCurrentUser: boolean;
  lockedByUser: User | null;
}
```

### EditLockButton Props

```typescript
interface EditLockButtonProps {
  resourceType: 'articles' | 'blocks';
  resourceId: string;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onSave?: () => Promise<void> | void;
  disabled?: boolean;
  initialUpdatedAt?: string; // Resource's last update timestamp for conflict detection
}
```

## API Endpoints

### GET `/api/[resource]/[id]/lock`
Returns the current lock status.

**Response:**
```json
{
  "success": true,
  "data": {
    "isLocked": true,
    "lockedByCurrentUser": false,
    "lockedByUser": {
      "id": "user-id",
      "name": "Username",
      "email": "user@example.com"
    }
  }
}
```

### POST `/api/[resource]/[id]/lock`
Locks the resource for the current user.

**Response:**
```json
{
  "success": true,
  "message": "Resource locked successfully"
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "error": "Resource already locked",
  "lockedByUser": "Username"
}
```

### DELETE `/api/[resource]/[id]/lock`
Unlocks the resource.

**Response:**
```json
{
  "success": true,
  "message": "Resource unlocked successfully"
}
```

## Edit Lock Error Handling

### EditLockError Class

The system includes a specialized error class for handling edit lock conflicts:

```typescript
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly articleId: string, // or blockId for blocks
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null  // ISO string timestamp
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}
```

### EDIT_LOCK_ERROR Response Type

When an edit lock conflict occurs during PUT/DELETE operations, the API returns a specialized error response:

**Error Response (409 Conflict):**
```json
{
  "error": "Resource is being edited by another user",
  "type": "EDIT_LOCK_ERROR",
  "articleId": "article-uuid", // or blockId for blocks
  "lockedBy": "user-uuid",
  "lockedAt": "2024-01-15T10:30:00.000Z"
}
```

### When EDIT_LOCK_ERROR is Thrown

The `EditLockError` is automatically thrown in these scenarios:

1. **Article Operations:**
   - `PUT /api/articles/[id]` - Update article
   - `DELETE /api/articles/[id]` - Delete article
   - `PUT /api/articles/[id]/calculations` - Update calculations
   - `PUT /api/articles/[id]/content` - Update content

2. **Block Operations:**
   - `PUT /api/blocks/[id]` - Update block
   - `DELETE /api/blocks/[id]` - Delete block

### Server-side Protection

The database modules automatically check edit locks before any modification:

```typescript
// Automatic protection in database operations
async function checkArticleEditable(articleId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('User not authenticated', articleId);
  }

  // Check if article is locked by another user
  if (article.blocked && article.blockedBy && article.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      'Article is being edited by another user',
      articleId,
      article.blockedBy,
      article.blocked
    );
  }
}
```

### Client-side Handling

When receiving an `EDIT_LOCK_ERROR`, clients should:

1. **Check the error type:**
```typescript
if (error.response?.data?.type === 'EDIT_LOCK_ERROR') {
  // Handle edit lock conflict
  const { lockedBy, lockedAt } = error.response.data;
  // Show appropriate UI feedback
}
```

2. **Refresh lock status:**
```typescript
// Refresh to get current lock information
await refreshLockStatus();
```

3. **Show user-friendly error message:**
```typescript
// The error message is already localized
toast.error(error.response.data.error);
```

## Automatic Cleanup

### Tab Closing
- Hook detects component unmount (tab closing)
- Automatic, silent unlocking
- No toast notification

### Logout
- `/api/users/current/unlock-all` endpoint
- Unlocks all user's resources
- Called before logout

## Toast Notifications

### Successful Actions
- **Lock**: "Bearbeitung gestartet - für andere gesperrt"
- **Unlock**: "Bearbeitung beendet - für andere freigegeben"
- **Save**: "Gespeichert und für andere freigegeben"

### Errors
- **Lock Conflict**: "Ressource wird bereits von [Username] bearbeitet"
- **Network Error**: "Fehler beim Sperren der Ressource"
- **Permission Error**: "Keine Berechtigung zum Sperren dieser Ressource"

## Database Schema

### Article Locks
```sql
-- articles table
blocked TIMESTAMP,  -- UTC timestamp when locked (NULL when not locked)
blockedBy TEXT REFERENCES auth.users(id)  -- User ID who has the lock
```

### Block Locks
```sql
-- blocks table  
blocked TIMESTAMP,  -- UTC timestamp when locked (NULL when not locked)
blockedBy TEXT REFERENCES auth.users(id)  -- User ID who has the lock
```

### Timestamp Handling

The system uses PostgreSQL's `NOW()` function for consistent UTC timestamps:

- **Database Level**: All timestamps are generated using `sql`NOW()`` for consistency
- **TypeScript Types**: Timestamps are handled as strings (ISO format) after JSON serialization
- **Drizzle Schema**: Configured with `{ mode: 'string' }` to match runtime behavior
- **Client Display**: Converted to local timezone for user-friendly display

This approach eliminates timezone-related issues and ensures atomic timestamp operations.

## Optimistic Updates

The system uses optimistic updates for better user experience:

1. **Immediate UI Update**: Button status changes immediately
2. **Background API Call**: Lock/unlock is processed asynchronously
3. **Rollback on Error**: Original state is restored on failure
4. **Error Feedback**: Toast notification on problems

## Best Practices

### 1. Use EditLockButton
```typescript
// ✅ Good - Use the pre-built component
<EditLockButton
  resourceType="articles"
  resourceId={articleId}
  isEditing={isEditing}
  onToggleEdit={setIsEditing}
  onSave={handleSave}
  initialUpdatedAt={articleData?.updatedAt}  // Already a string from Drizzle
/>

// ❌ Bad - Implement custom lock logic
<Button onClick={handleCustomLock}>Edit</Button>
```

### 2. Use Optimistic Updates
```typescript
// ✅ Good - Optimistic updates for better UX
await lockResourceOptimistic();

// ❌ Bad - Regular updates are slower
await lockResource();
```

### 3. Error Handling
```typescript
// ✅ Good - Catch and handle errors
try {
  await lockResourceOptimistic();
} catch (error) {
  // Error is automatically shown via toast
  // Additional error handling if needed
}
```

### 4. Use EditLockButton
```typescript
<EditLockButton
  resourceType="new-resource"
  resourceId={resourceId}
  isEditing={isEditing}
  onEditToggle={setIsEditing}
  initialUpdatedAt={resourceData?.updatedAt}
/>
```

## Extending for New Resource Types

### 1. Extend Database Schema
```sql
ALTER TABLE new_table 
ADD COLUMN blocked TIMESTAMP,  -- UTC timestamp when locked (NULL when not locked)
ADD COLUMN blockedBy TEXT REFERENCES auth.users(id);  -- User ID who has the lock
```

### 2. Create API Endpoints
```typescript
// app/api/new-resource/[id]/lock/route.ts
import { requireAuth } from "@/lib/auth/server";
import { sql } from 'drizzle-orm';

// GET - Check lock status
// POST - Lock resource using sql`NOW()` for timestamp
// DELETE - Unlock resource (set blocked to null)
```

### 3. Extend Hook Type
```typescript
// hooks/use-edit-lock.tsx
type ResourceType = 'articles' | 'blocks' | 'new-resource';
```

### 4. Use EditLockButton
```typescript
<EditLockButton
  resourceType="new-resource"
  resourceId={resourceId}
  isEditing={isEditing}
  isSaving={isSaving}
  onToggleEdit={setIsEditing}
  onSave={handleSave}
  initialUpdatedAt={resourceData?.updatedAt}  // Already a string from Drizzle
/>
```

## Troubleshooting

### Problem: Lock is not unlocked
**Solution:** Check browser console for errors, refresh lock status
```typescript
await refreshLockStatus();
```

### Problem: "Already locked" error
**Solution:** Another user is editing the resource
- Wait until the other user finishes
- Admin can manually unlock (if implemented)

### Problem: Locks persist after tab closing
**Solution:** Check useEffect cleanup in useEditLock hook
```typescript
useEffect(() => {
  return () => {
    // Cleanup should happen here
    unlockResource();
  };
}, []);
```

### Problem: Toast notifications are missing
**Solution:** Ensure Toaster is correctly configured
```typescript
// layout.tsx or similar
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

## Technical Details

### Dependencies
- `sonner` - Toast notifications
- Supabase Auth - User authentication
- Next.js 15 - API Routes

### Authentication Implementation
All lock API endpoints use the unified `requireAuth()` method from `@/lib/auth/server`:

```typescript
import { requireAuth } from '@/lib/auth/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();
    
    // Lock the resource
    await db.update(table).set({
      blocked: sql`NOW()`,
      blockedBy: dbUser.id,
    }).where(eq(table.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }
    // Handle other errors...
  }
}
```

### Performance
- Optimistic updates reduce perceived latency
- Minimal API calls through intelligent caching
- Automatic cleanup prevents "orphaned locks"

### Security
- All API endpoints require authentication
- Users can only unlock their own locks
- Server-side validation of all lock operations 