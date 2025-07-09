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
  const [isSaving, setIsSaving] = useState(false);
  const [resourceData, setResourceData] = useState(null);

  // Function to load fresh data from server
  const loadResourceData = async () => {
    const freshData = await fetchResourceData(resourceId);
    setResourceData(freshData);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveResourceData(resourceData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EditLockButton
      resourceType="articles"
      resourceId={resourceId}
      isEditing={isEditing}
      isSaving={isSaving}
      onToggleEdit={handleToggleEdit}
      onSave={handleSave}
      onRefreshData={loadResourceData} // Ensures fresh data before edit
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
  isSaving?: boolean;
  onToggleEdit: () => void;
  onSave: () => Promise<void>;
  onRefreshData?: () => Promise<void>; // Optional callback to refresh data from parent
  initialUpdatedAt?: string; // Resource's last update timestamp for conflict detection
}
```

**New Features:**
- **Data Refresh**: `onRefreshData` callback refreshes data before entering edit mode
- **Lock Validation**: Enhanced save process validates lock before saving
- **Force Override**: Override locks held by other users with data refresh
- **Loading States**: Specific loading indicators for data refresh operations

## Enhanced Edit Lock Features

### Data Refresh Before Edit Mode

The system now automatically refreshes data before entering edit mode to prevent conflicts from outdated information:

```typescript
// When user clicks "Bearbeiten" or "Überschreiben"
1. Data refresh (if onRefreshData provided) → "Aktualisiere..."
2. Lock acquisition → "Bitte warten..."
3. Enter edit mode → Success toast
```

**Benefits:**
- Prevents save conflicts from stale data
- Ensures users work with latest information
- Consistent behavior for both edit and override flows

### Enhanced Save Validation

The save process now includes comprehensive lock validation:

```typescript
// When user clicks "Speichern"
1. Lock validation → "Prüfe Sperre..."
2. Conflict detection → Check for data changes
3. Save operation → "Speichern..."
4. Unlock resource → Success toast
```

**Lock Validation Scenarios:**
- **Lock Lost**: Automatically exits edit mode, shows current lock holder
- **Data Conflicts**: Prevents save, shows conflict message
- **Lock Valid**: Proceeds with save operation

### Force Override Functionality

Users can override locks held by other users when necessary:

**Override Button Appearance:**
- Orange "Überschreiben" button with warning icon
- Shows when resource is locked by another user
- Includes lock holder name and timestamp

**Override Flow:**
1. Data refresh → "Aktualisiere..."
2. Force override → "Überschreibt..."
3. Enter edit mode → Success message with override confirmation

### Loading States

The system provides detailed loading feedback:

- **"Laden..."** - Initial lock status loading
- **"Aktualisiere..."** - Data refresh in progress
- **"Bitte warten..."** - Lock acquisition in progress
- **"Prüfe Sperre..."** - Save-time lock validation
- **"Speichern..."** - Save operation in progress
- **"Überschreibt..."** - Force override in progress

### Automatic UI State Management

The component automatically manages UI state based on actual lock status:

**State Synchronization:**
- Shows override button when lock is held by others
- Hides save button when user doesn't have lock
- Refreshes lock status after save failures
- Displays current lock holder information

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
- **Override**: "Bearbeitung von [Username] überschrieben"

### Errors
- **Lock Conflict**: "Wird bereits von [Username] bearbeitet"
- **Lock Lost**: "Die Sperre wurde von [Username] überschrieben. Bearbeitung wird beendet."
- **Lock Expired**: "Die Sperre ist abgelaufen. Bearbeitung wird beendet."
- **Data Conflicts**: "Dieser Datensatz hat Änderungen, bitte schliessen Sie das Tab und öffnen Sie es wieder."
- **Data Refresh Error**: "Fehler beim Aktualisieren der Daten"
- **Network Errors**: "Fehler beim Sperren für Bearbeitung" / "Fehler beim Entsperren"
- **Save Errors**: "Fehler beim Speichern" / "Fehler beim Entsperren nach dem Speichern"
- **Override Errors**: "Fehler beim Überschreiben der Sperre"

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

### 1. Use EditLockButton with Data Refresh
```typescript
// ✅ Good - Use the pre-built component with data refresh
<EditLockButton
  resourceType="articles"
  resourceId={articleId}
  isEditing={isEditing}
  isSaving={isSaving}
  onToggleEdit={handleToggleEdit}
  onSave={handleSave}
  onRefreshData={loadLatestData}  // Prevents conflicts from stale data
  initialUpdatedAt={articleData?.updatedAt}
/>

// ❌ Bad - Missing data refresh
<EditLockButton
  resourceType="articles"
  resourceId={articleId}
  isEditing={isEditing}
  onToggleEdit={handleToggleEdit}
  onSave={handleSave}
  // Missing onRefreshData - may cause save conflicts
/>
```

### 2. Implement Proper Data Loading
```typescript
// ✅ Good - Async data loading function
const loadArticleData = async () => {
  setIsLoading(true);
  try {
    const freshData = await fetchArticleData(articleId);
    setArticleData(freshData);
    // Update all relevant state with fresh data
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Fehler beim Laden der Daten');
  } finally {
    setIsLoading(false);
  }
};

// ❌ Bad - Synchronous or incomplete data loading
const loadData = () => {
  // Sync operation or missing error handling
};
```

### 3. Use Optimistic Updates
```typescript
// ✅ Good - Optimistic updates for better UX
await lockResourceOptimistic();

// ❌ Bad - Regular updates are slower
await lockResource();
```

### 4. Handle Lock Validation Properly
```typescript
// ✅ Good - Let EditLockButton handle validation
const handleSave = async () => {
  setIsSaving(true);
  try {
    await saveResourceData();
    // EditLockButton handles lock validation automatically
  } finally {
    setIsSaving(false);
  }
};

// ❌ Bad - Manual lock checking (redundant)
const handleSave = async () => {
  // Manual lock checks are unnecessary and error-prone
  const lockStatus = await checkLock();
  if (!lockStatus.valid) return;
  await saveResourceData();
};
```

### 5. Error Handling
```typescript
// ✅ Good - Catch and handle errors gracefully
try {
  await lockResourceOptimistic();
} catch (error) {
  // Error is automatically shown via toast
  // Additional error handling if needed
  console.error('Lock error:', error);
}
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
  onToggleEdit={handleToggleEdit}
  onSave={handleSave}
  onRefreshData={loadResourceData}  // Include data refresh
  initialUpdatedAt={resourceData?.updatedAt}
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