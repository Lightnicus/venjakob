# Edit Lock System Documentation

## Overview

The Edit Lock System provides a DRY (Don't Repeat Yourself) solution for preventing multiple users from editing the same dataset simultaneously. It uses optimistic UI updates for fast response times while maintaining data integrity through database locks.

## DRY Architecture

### Generic Lock API Factory
- **Location**: `lib/api/create-lock-routes.ts`
- **Purpose**: Single factory function that generates lock API routes for any resource type
- **Benefits**: Consistent behavior, reduced maintenance, centralized logic

### Centralized Error Handling
- **Location**: `lib/db/edit-lock-error.ts`
- **Purpose**: Unified error class for all lock-related conflicts
- **Features**: Generic `resourceId` property, consistent error structure

### Generic Lock Validation
- **Location**: `lib/db/lock-validation.ts`
- **Purpose**: Reusable validation logic for any lockable resource
- **Usage**: `checkResourceEditable()` function works with all resource types

## Components

### 1. `useEditLock` Hook
The core hook that manages lock state and provides locking/unlocking functions.

### 2. `EditLockButton` Component
A reusable UI component that handles all edit/lock interactions.

### 3. Generic API Endpoints
- `/api/articles/[id]/lock` - Lock management for articles
- `/api/blocks/[id]/lock` - Lock management for blocks
- `/api/quote-versions/[id]/lock` - Lock management for quote versions

All endpoints use the same generic factory for consistent behavior.

## Supported Resource Types

The system now supports three resource types with identical behavior:

```typescript
type LockableResource = 'articles' | 'blocks' | 'quote-versions';
```

### Resource Type Examples

#### Articles
```typescript
const { lockInfo } = useEditLock('articles', articleId);
```

#### Blocks  
```typescript
const { lockInfo } = useEditLock('blocks', blockId);
```

#### Quote Versions
```typescript
const { lockInfo } = useEditLock('quote-versions', versionId);
```

## Quick Start

### Basic Usage with EditLockButton

```tsx
import EditLockButton from '@/project_components/edit-lock-button';

const MyComponent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resourceData, setResourceData] = useState(null);

  // Function to refresh data from server
  const loadResourceData = async () => {
    try {
      const freshData = await fetchResourceData(resourceId);
      setResourceData(freshData);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error; // Let EditLockButton handle the error
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Your save logic here
      await saveData(resourceData);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <EditLockButton
      resourceType="articles" // or "blocks" or "quote-versions"
      resourceId="your-resource-id"
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

### Advanced Usage with useEditLock Hook

```tsx
import { useEditLock } from '@/hooks/use-edit-lock';

const MyAdvancedComponent = () => {
  const {
    lockInfo,
    isLoading,
    canEdit,
    lockResourceOptimistic,
    unlockResourceOptimistic,
    refreshLockStatus
  } = useEditLock('articles', 'article-id-123');

  const handleStartEdit = async () => {
    if (canEdit) {
      const locked = await lockResourceOptimistic();
      if (locked) {
        // Enter edit mode
        setEditMode(true);
      }
    }
  };

  return (
    <div>
      {lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && (
        <div className="alert">
          Wird bearbeitet von: {lockInfo.lockedByName}
        </div>
      )}
      
      <button 
        onClick={handleStartEdit}
        disabled={!canEdit}
      >
        {canEdit ? 'Bearbeiten' : 'Gesperrt'}
      </button>
    </div>
  );
};
```

## API Reference

### useEditLock Hook

```tsx
const {
  lockInfo,
  isLoading,
  canEdit,
  lockResource,
  unlockResource,
  lockResourceOptimistic,
  unlockResourceOptimistic,
  refreshLockStatus
} = useEditLock(resourceType, resourceId);
```

#### Parameters
- `resourceType: 'articles' | 'blocks'` - The type of resource to lock
- `resourceId: string` - The unique ID of the resource

#### Returns

##### `lockInfo: LockInfo`
```tsx
interface LockInfo {
  isLocked: boolean;                // Whether the resource is currently locked
  lockedBy: string | null;          // User ID who has the lock
  lockedByName: string | null;      // Display name of the user who has the lock
  lockedAt: string | null;          // ISO timestamp when lock was acquired
  isLockedByCurrentUser: boolean;   // Whether current user holds the lock
}
```

##### Functions
- `isLoading: boolean` - Whether lock status is being fetched
- `canEdit: boolean` - Whether current user can edit (not locked by others)
- `lockResource(): Promise<boolean>` - Lock resource (waits for server confirmation)
- `unlockResource(): Promise<boolean>` - Unlock resource (waits for server confirmation)
- `lockResourceOptimistic(): Promise<boolean>` - Lock with optimistic UI update
- `unlockResourceOptimistic(): Promise<boolean>` - Unlock with optimistic UI update
- `refreshLockStatus(): Promise<void>` - Manually refresh lock status

### EditLockButton Component

```tsx
<EditLockButton
  resourceType="articles" // or "blocks"
  resourceId="resource-id"
  isEditing={boolean}
  isSaving={boolean}
  onToggleEdit={() => void}
  onSave={() => Promise<void>}
  onRefreshData={() => Promise<void>} // Optional
  initialUpdatedAt={string} // Optional
/>
```

#### Props
- `resourceType: 'articles' | 'blocks'` - Type of resource
- `resourceId: string` - Resource ID
- `isEditing: boolean` - Current edit state
- `isSaving?: boolean` - Whether save operation is in progress
- `onToggleEdit: () => void` - Callback when edit mode toggles
- `onSave: () => Promise<void>` - Callback when save button is clicked
- `onRefreshData?: () => Promise<void>` - Optional callback to refresh data before edit
- `initialUpdatedAt?: string` - Resource's last update timestamp for conflict detection

## Enhanced Features

### Automatic Data Refresh

The EditLockButton now supports automatic data refresh before entering edit mode:

```tsx
const ArticleDetail = ({ articleId }) => {
  const [articleData, setArticleData] = useState(null);
  
  const loadArticleData = async () => {
    // Fetch fresh data from server
    const data = await fetchArticle(articleId);
    setArticleData(data);
  };

  return (
    <EditLockButton
      resourceType="articles"
      resourceId={articleId}
      // ... other props
      onRefreshData={loadArticleData} // Refreshes before edit
    />
  );
};
```

**Benefits:**
- Prevents save conflicts from stale data
- Ensures users always work with current information
- Automatically triggered for both edit and override actions

### Enhanced Save Process

The save process includes comprehensive validation:

1. **Lock Validation** - Checks if user still has the lock
2. **Conflict Detection** - Compares current data with baseline
3. **Automatic Recovery** - Exits edit mode if lock is lost

```tsx
// Save process flow:
"Prüfe Sperre..." → "Speichern..." → "Gespeichert und für andere freigegeben"

// If lock is lost:
"Prüfe Sperre..." → Exit edit mode → Show current lock holder
```

### Force Override Capability

Users can override locks held by other users:

- **Visual Indicator**: Orange "Überschreiben" button with warning icon
- **Data Refresh**: Automatically refreshes data before override
- **Clear Feedback**: Shows who was overridden in success message

### Comprehensive Loading States

The component provides specific loading indicators for each operation:

- **"Laden..."** - Initial lock status loading
- **"Aktualisiere..."** - Data refresh in progress  
- **"Bitte warten..."** - Lock acquisition in progress
- **"Prüfe Sperre..."** - Save-time lock validation
- **"Speichern..."** - Save operation in progress
- **"Überschreibt..."** - Force override in progress

## Behavior & Flow

### Enhanced Edit Flow with Data Refresh

1. **User clicks "Bearbeiten"**:
   - Data refresh (if `onRefreshData` provided) → "Aktualisiere..."
   - Lock request sent to server → "Bitte warten..."
   - UI enters edit mode
   - Success: ✅ "Bearbeitung gestartet - für andere gesperrt"
   - Failure: ❌ Error shown, edit mode not entered

2. **User clicks "Abbrechen"**:
   - UI immediately exits edit mode
   - Unlock request sent to server
   - Success: ✅ "Bearbeitung beendet - für andere freigegeben"
   - Failure: ❌ Error shown (but stays in non-edit mode)

3. **User clicks "Speichern"**:
   - Lock validation → "Prüfe Sperre..."
   - Save operation if lock valid → "Speichern..."
   - Unlock resource → Success: ✅ "Gespeichert und für andere freigegeben"
   - Lock lost: ❌ Exit edit mode, show current lock holder

### Force Override Flow

1. **User clicks "Überschreiben"**:
   - Data refresh (if `onRefreshData` provided) → "Aktualisiere..."
   - Force override request → "Überschreibt..."
   - UI enters edit mode
   - Success: ✅ "Bearbeitung von [Username] überschrieben"
   - Failure: ❌ Error shown, edit mode not entered

### Lock Conflict Handling

- If resource is locked by another user, "Bearbeiten" button shows "Gesperrt"
- Displays: "wird bearbeitet von **[User Name]** (vor X Min.)"
- Shows orange "Überschreiben" button for force override
- User cannot enter edit mode until lock is released or overridden

### Save Validation Process

The enhanced save process includes multiple validation steps:

1. **Lock Ownership Check**: Verifies user still has the lock
2. **Data Conflict Detection**: Checks for changes since edit started
3. **Automatic Recovery**: If lock lost, exits edit mode and refreshes lock status
4. **Error Handling**: Provides specific error messages for different scenarios

## Database Schema

The system uses `blocked` and `blockedBy` fields for lock management:

```sql
-- Articles table  
blocked TIMESTAMP,      -- UTC timestamp when locked (NULL when not locked)
blockedBy TEXT REFERENCES auth.users(id);  -- User ID who has the lock

-- Blocks table
blocked TIMESTAMP,      -- UTC timestamp when locked (NULL when not locked)
blockedBy TEXT REFERENCES auth.users(id);  -- User ID who has the lock
```

### Timestamp Handling
- All timestamps use PostgreSQL's `NOW()` function for consistency
- Drizzle schema configured with `{ mode: 'string' }` for type safety
- Client receives timestamps as ISO strings after JSON serialization

## Error Handling

### Network Errors
- Optimistic updates provide immediate feedback
- Failed operations revert UI state appropriately
- Clear error messages guide user actions

### Lock Conflicts
- Real-time conflict detection
- Graceful degradation when locks conflict
- User-friendly conflict messages

## Toast Notifications

The system provides comprehensive feedback through toast notifications:

### Success Messages
- 🟢 **"Bearbeitung gestartet - für andere gesperrt"** - Edit mode started
- 🟢 **"Bearbeitung beendet - für andere freigegeben"** - Edit mode cancelled  
- 🟢 **"Gespeichert und für andere freigegeben"** - Save completed successfully
- 🟢 **"Bearbeitung von [Username] überschrieben"** - Force override successful

### Error Messages
- 🔴 **"Wird bereits von [Name] bearbeitet"** - Lock conflict when trying to edit
- 🔴 **"Die Sperre wurde von [Username] überschrieben. Bearbeitung wird beendet."** - Lock lost during edit
- 🔴 **"Die Sperre ist abgelaufen. Bearbeitung wird beendet."** - Lock expired during edit
- 🔴 **"Dieser Datensatz hat Änderungen, bitte schliessen Sie das Tab und öffnen Sie es wieder."** - Data conflicts detected
- 🔴 **"Fehler beim Aktualisieren der Daten"** - Data refresh failed
- 🔴 **"Fehler beim Sperren für Bearbeitung"** - Lock acquisition failed
- 🔴 **"Fehler beim Entsperren"** - Unlock operation failed
- 🔴 **"Fehler beim Entsperren nach dem Speichern"** - Unlock after save failed
- 🔴 **"Fehler beim Speichern"** - Save operation failed
- 🔴 **"Fehler beim Überschreiben der Sperre"** - Force override failed

## Adding New Resource Types

To extend the system for new resource types:

### 1. Update Hook Types
```tsx
// In hooks/use-edit-lock.tsx
export type LockableResource = 'articles' | 'blocks' | 'your-new-type';
```

### 2. Create API Endpoint
Create `/api/your-new-type/[id]/lock/route.ts` following the same pattern as articles/blocks.

### 3. Database Schema
Add `blocked` and `blockedBy` columns to your table:
```sql
ALTER TABLE your_table 
ADD COLUMN blocked TIMESTAMP,  -- UTC timestamp when locked (NULL when not locked)
ADD COLUMN blockedBy TEXT REFERENCES auth.users(id);  -- User ID who has the lock
```

And update your Drizzle schema:
```typescript
export const yourTable = pgTable('your_table', {
  // ... other fields
  blocked: timestamp('blocked', { mode: 'string' }),
  blockedBy: text('blockedBy').references(() => users.id),
});
```

### 4. Usage
```tsx
<EditLockButton
  resourceType="your-new-type"
  resourceId="some-id"
  // ... other props
/>
```

## Automatic Lock Cleanup

The system provides automatic cleanup in several scenarios:

### 1. Tab Closing
When a component using `useEditLock` unmounts (e.g., tab is closed), the hook automatically unlocks any resources locked by the current user in that component.

### 2. User Logout
When a user logs out, all resources locked by that user are automatically unlocked across all articles and blocks.

### 3. Save/Cancel Actions
- **Save**: Resource is unlocked after successful save
- **Cancel**: Resource is unlocked immediately when canceling edit mode

## Best Practices

### 1. Always Use EditLockButton for Consistency
Prefer the `EditLockButton` component over manual hook usage for consistent UX.

### 2. Automatic Cleanup
The system handles cleanup automatically - no manual intervention needed for:
- Component unmount (tab closing)
- User logout
- Save/cancel operations

### 3. Refresh Lock Status
Use `refreshLockStatus()` when:
- Returning to a page after navigation
- Reconnecting after network issues
- Periodic health checks

### 4. Optimistic vs Regular Operations
- Use **optimistic** methods for user-initiated actions (button clicks)
- Use **regular** methods for programmatic operations where you need confirmation

## Performance Considerations

### Caching
- Lock status is cached in component state
- Automatic refresh on user/resource changes
- Manual refresh available when needed

### Network Optimization
- Optimistic updates reduce perceived latency
- Debounced refresh calls prevent API spam
- Efficient error recovery mechanisms

## Troubleshooting

### Common Issues

**Lock not releasing after save:**
- Check that `onSave` callback completes successfully
- Verify API endpoint returns 200 status
- Check network connectivity

**UI not updating after lock changes:**
- Ensure `refreshLockStatus()` is called after manual lock operations
- Check that component re-renders on state changes

**Permission errors:**
- Verify user authentication
- Check database user ID matches auth user ID
- Ensure proper foreign key relationships

### Debug Mode
Enable debug logging by adding to hook:
```tsx
useEffect(() => {
  console.log('Lock status changed:', lockInfo);
}, [lockInfo]);
``` 