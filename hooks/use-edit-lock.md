# Edit Lock System Documentation

## Overview

The Edit Lock System provides a DRY (Don't Repeat Yourself) solution for preventing multiple users from editing the same dataset simultaneously. It uses optimistic UI updates for fast response times while maintaining data integrity through database locks.

## Components

### 1. `useEditLock` Hook
The core hook that manages lock state and provides locking/unlocking functions.

### 2. `EditLockButton` Component
A reusable UI component that handles all edit/lock interactions.

### 3. API Endpoints
- `/api/articles/[id]/lock` - Lock management for articles
- `/api/blocks/[id]/lock` - Lock management for blocks

## Quick Start

### Basic Usage with EditLockButton

```tsx
import EditLockButton from '@/project_components/edit-lock-button';

const MyComponent = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Your save logic here
      await saveData();
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <EditLockButton
      resourceType="articles" // or "blocks"
      resourceId="your-resource-id"
      isEditing={isEditing}
      isSaving={isSaving}
      onToggleEdit={handleToggleEdit}
      onSave={handleSave}
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
  onSave={() => void}
/>
```

#### Props
- `resourceType: 'articles' | 'blocks'` - Type of resource
- `resourceId: string` - Resource ID
- `isEditing: boolean` - Current edit state
- `isSaving: boolean` - Whether save operation is in progress
- `onToggleEdit: () => void` - Callback when edit mode toggles
- `onSave: () => void` - Callback when save button is clicked

## Behavior & Flow

### Optimistic Locking Flow

1. **User clicks "Bearbeiten"**:
   - UI immediately enters edit mode
   - Lock request sent to server
   - Success: ✅ "Bearbeitung gestartet - für andere gesperrt"
   - Failure: ❌ Edit mode reverted, error shown

2. **User clicks "Abbrechen"**:
   - UI immediately exits edit mode
   - Unlock request sent to server
   - Success: ✅ "Bearbeitung beendet - für andere freigegeben"
   - Failure: ❌ Error shown (but stays in non-edit mode)

3. **User clicks "Speichern"**:
   - Save operation completes first
   - Then unlocks resource
   - Success: ✅ "Gespeichert und für andere freigegeben"
   - Failure: ❌ Error shown

### Lock Conflict Handling

- If resource is locked by another user, "Bearbeiten" button shows "Gesperrt"
- Displays: "wird bearbeitet von **[User Name]**"
- User cannot enter edit mode until lock is released

## Database Schema

The system uses existing `blocked` and `blockedBy` fields:

```sql
-- Articles table
ALTER TABLE articles ADD COLUMN blocked timestamp;
ALTER TABLE articles ADD COLUMN blocked_by uuid REFERENCES users(id);

-- Blocks table  
ALTER TABLE blocks ADD COLUMN blocked timestamp;
ALTER TABLE blocks ADD COLUMN blocked_by uuid REFERENCES users(id);
```

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
- 🟢 **"Bearbeitung gestartet - für andere gesperrt"**
- 🟢 **"Bearbeitung beendet - für andere freigegeben"**  
- 🟢 **"Gespeichert und für andere freigegeben"**

### Error Messages
- 🔴 **"Fehler beim Sperren für Bearbeitung"**
- 🔴 **"Fehler beim Entsperren"**
- 🔴 **"Fehler beim Entsperren nach dem Speichern"**
- 🔴 **"Wird bereits von [Name] bearbeitet"**

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
Add `blocked` and `blocked_by` columns to your table:
```sql
ALTER TABLE your_table ADD COLUMN blocked timestamp;
ALTER TABLE your_table ADD COLUMN blocked_by uuid REFERENCES users(id);
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