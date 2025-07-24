# Quotes Save System & UI Flow Documentation

## Overview
This document describes the complete save system implementation and UI flow for quote position management, including data loading, node switching, change tracking, and saving processes.

## Architecture Overview

### State Management (State Lifting Pattern)
- **`QuoteDetail`**: Central owner of `useUnsavedChanges` hook and `treeData` state
- **`InteractiveSplitPanel`**: Receives change tracking functions as props
- **Position Components**: Receive change tracking functions and display current values
- **Data Flow**: Single source of truth with props-based communication

### Key Components
- **`QuoteDetail`**: Main container with save functionality
- **`InteractiveSplitPanel`**: Tree view with position editing
- **`OfferPositionText`**: Text position editor
- **`OfferPositionArticle`**: Article position editor
- **`useUnsavedChanges`**: Custom hook for change tracking

## Complete UI Flow

### 1. Initial Data Loading

#### QuoteDetail Component
```typescript
// 1. Component mounts with quoteId, variantId, versionId
const QuoteDetail: React.FC<QuoteDetailProps> = ({ quoteId, variantId, versionId }) => {
  // 2. Initialize state
  const [treeData, setTreeData] = useState<MyTreeNodeData[]>([]);
  const { hasUnsavedChanges, addChange, removeChange, getChangesForSave, clearAllChanges } = useUnsavedChanges();
  
  // 3. Fetch data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch quote positions from API
      const positions = await fetchQuotePositions(versionId);
      // Transform to tree data
      const transformedData = transformPositionsToTreeData(positions);
      setTreeData(transformedData);
    };
    fetchAllData();
  }, [versionId]);
}
```

#### Data Transformation
```typescript
// Transform database positions to tree structure
const transformPositionsToTreeData = (positions: QuotePositionWithDetails[]): MyTreeNodeData[] => {
  return positions.map(position => ({
    id: position.id,
    title: position.title,
    description: position.description,
    type: position.type,
    // ... other fields
  }));
};
```

### 2. Tree Display & Node Selection

#### InteractiveSplitPanel Component
```typescript
// 1. Display tree with current data
<ArboristTree
  data={treeData}
  onSelect={handleNodeSelect}
  // ... other props
/>

// 2. Handle node selection
const handleNodeSelect = useCallback((nodes: NodeApi<MyTreeNodeData>[]) => {
  if (nodes.length > 0) {
    const node = nodes[0];
    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setSelectedNodeType(node.data.type);
  }
}, []);
```

#### Node Selection Flow
1. **User clicks node** → `handleNodeSelect` called
2. **Node data stored** → `selectedNodeId`, `selectedNode`, `selectedNodeType` updated
3. **Right panel renders** → `renderFormContent()` called with selected node
4. **Position component mounts** → Receives node data and change tracking functions

### 3. Position Editing & Change Tracking

#### Position Component (OfferPositionText/OfferPositionArticle)
```typescript
// 1. Get current values (saved or unsaved)
const getCurrentTitle = useCallback(() => {
  if (hasPositionChanges && hasPositionChanges(positionId)) {
    const positionChanges = getPositionChanges(positionId);
    if (positionChanges?.title) {
      return positionChanges.title.newValue; // Show unsaved change
    }
  }
  return selectedNode?.data?.title || ''; // Show saved value
}, [positionId, hasPositionChanges, getPositionChanges, selectedNode]);

const getCurrentDescription = useCallback(() => {
  if (hasPositionChanges && hasPositionChanges(positionId)) {
    const positionChanges = getPositionChanges(positionId);
    if (positionChanges?.description) {
      return positionChanges.description.newValue; // Show unsaved change
    }
  }
  return selectedNode?.data?.description || ''; // Show saved value
}, [positionId, hasPositionChanges, getPositionChanges, selectedNode]);
```

#### Change Tracking Flow
1. **User types in title** → `handleTitleChange` called
2. **Compare with original** → `newTitle !== originalTitle`
3. **Track change** → `addChange(positionId, 'title', originalTitle, newTitle)`
4. **Visual indicator** → Orange dot appears next to "Überschrift"
5. **Save button updates** → Shows "Speichern*" with orange ring

#### Rich Text Editor Flow
1. **User types in RTE** → `handleDescriptionChange` called with PlateJS Value
2. **Convert to JSON** → `JSON.stringify(content)`
3. **Compare with original** → `newDescription !== oldDescription`
4. **Track change** → `addChange(positionId, 'description', oldDescription, newDescription)`
5. **Visual indicator** → Orange dot appears next to "Beschreibung"

### 4. Node Switching with Fresh Data

#### InteractiveSplitPanel - Fresh Data Access
```typescript
// Get current node data from treeData instead of using selectedNode
const renderFormContent = useCallback(() => {
  const currentNodeData = selectedNodeId ? findNodeById(treeData, selectedNodeId) : null;
  
  // Create updated selectedNode with fresh data
  const updatedSelectedNode = currentNodeData && selectedNode ? {
    ...selectedNode,
    data: currentNodeData
  } as NodeApi<MyTreeNodeData> : selectedNode;
  
  // Pass fresh data to position components
  return (
    <OfferPositionText
      selectedNode={updatedSelectedNode}
      // ... other props
    />
  );
}, [selectedNodeType, selectedNodeId, selectedNode, treeData, findNodeById, /* ... */]);
```

#### Node Switching Flow
1. **User clicks different node** → `handleNodeSelect` called
2. **New node selected** → `selectedNodeId` updated
3. **renderFormContent re-runs** → `findNodeById(treeData, selectedNodeId)` gets fresh data
4. **Updated node created** → `updatedSelectedNode` with current data
5. **Position component re-mounts** → Receives fresh data via props
6. **RTE displays current content** → No stale data issues

### 5. Save Process

#### Save Button State
```typescript
// QuoteDetail component
<Button
  className={`${hasUnsavedChanges && isEditing ? 'ring-2 ring-orange-500' : ''}`}
  onClick={handleEditClick}
>
  {isEditing ? (
    <>
      {isSaving ? 'Speichere...' : hasUnsavedChanges ? 'Speichern*' : 'Speichern'}
    </>
  ) : (
    <>Bearbeiten</>
  )}
</Button>
```

#### Save Flow
1. **User clicks save** → `handleEditClick` calls `handleSaveChanges`
2. **Get changes** → `getChangesForSave()` returns array of modified positions
3. **API call** → `saveQuotePositions(versionId, changesToSave)`
4. **Update tree data** → `setTreeData()` with saved values
5. **Clear changes** → `clearAllChanges()` resets tracking
6. **UI updates** → Components re-render with saved data

#### Cancel Flow
1. **User clicks cancel** → `handleCancelClick` called
2. **Clear changes** → `clearAllChanges()` resets all unsaved changes
3. **Switch to view mode** → `setIsEditing(false)` exits editing mode
4. **UI updates** → Components re-render with original saved data
5. **Toast notification** → User informed that changes were discarded

#### Tree Data Update After Save
```typescript
// Inside handleSaveChanges after successful API call
setTreeData(prevData => {
  const updateNode = (nodes: MyTreeNodeData[]): MyTreeNodeData[] => {
    return nodes.map(node => {
      const change = changesToSave.find(c => c.id === node.id);
      if (change) {
        return {
          ...node,
          title: change.title || node.title,
          description: change.description || node.description,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNode(node.children),
        };
      }
      return node;
    });
  };
  return updateNode([...prevData]);
});
```

### 6. RTE Fix Implementation

#### Problem
Rich Text Editor content reverted to old values after saving, even though the data was saved correctly.

#### Root Cause
The `selectedNode` reference became stale and didn't reflect the updated `treeData` after saving.

#### Solution
Direct data access from `treeData` in `renderFormContent`:

```typescript
// Before (stale reference)
selectedNode={selectedNode} // Could be stale

// After (fresh data)
const currentNodeData = selectedNodeId ? findNodeById(treeData, selectedNodeId) : null;
const updatedSelectedNode = currentNodeData && selectedNode ? {
  ...selectedNode,
  data: currentNodeData
} as NodeApi<MyTreeNodeData> : selectedNode;

selectedNode={updatedSelectedNode} // Always fresh
```

#### RTE Data Flow After Save
1. **Save completes** → `setTreeData()` updates with saved values
2. **renderFormContent re-runs** → `findNodeById(treeData, selectedNodeId)` gets fresh data
3. **Updated node created** → `updatedSelectedNode` with saved description
4. **Position component receives** → Fresh data via `selectedNode` prop
5. **getCurrentDescription() returns** → Saved value (no unsaved changes)
6. **RTE displays** → Saved content immediately without revert

## API Integration

### Database Functions
```typescript
// lib/db/quotes.ts
export async function updateQuotePosition(
  positionId: string,
  positionData: Partial<Omit<QuotePosition, 'id' | 'versionId' | 'createdAt' | 'updatedAt'>>
): Promise<void>

export async function updateQuotePositions(
  positionUpdates: Array<{
    id: string;
    title?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    totalPrice?: string;
    articleCost?: string;
  }>
): Promise<void>
```

### API Endpoints
```typescript
// app/api/quotes/versions/[versionId]/positions/[positionId]/route.ts
export async function PUT(request: NextRequest, { params }: { params: Promise<{ versionId: string; positionId: string }> })

// app/api/quotes/versions/[versionId]/positions/batch/route.ts
export async function PUT(request: NextRequest, { params }: { params: Promise<{ versionId: string }> })
```

### Client API Functions
```typescript
// lib/api/quotes.ts
export async function saveQuotePosition(versionId: string, positionId: string, positionData: any): Promise<void>
export async function saveQuotePositions(versionId: string, positions: Array<any>): Promise<void>
```

## Change Tracking System

### Hook Usage in Components
The `useUnsavedChanges` hook is used in the following components:

1. **`QuoteDetail`**: Main owner of the hook state
   ```typescript
   const { hasUnsavedChanges, addChange, removeChange, getChangesForSave, clearAllChanges } = useUnsavedChanges();
   ```

2. **`InteractiveSplitPanel`**: Receives hook functions as props
   ```typescript
   interface InteractiveSplitPanelProps {
     hasUnsavedChanges?: boolean;
     addChange?: (positionId: string, field: string, oldValue: any, newValue: any) => void;
     removeChange?: (positionId: string, field?: string) => void;
     hasPositionChanges?: (positionId: string) => boolean;
     getPositionChanges?: (positionId: string) => { [field: string]: { oldValue: any; newValue: any } };
   }
   ```

3. **Position Components**: Use hook functions for change tracking
   ```typescript
   // In OfferPositionText/OfferPositionArticle
   const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     if (newTitle !== originalTitle) {
       addChange(positionId, 'title', originalTitle, newTitle);
     } else {
       removeChange(positionId, 'title');
     }
   }, [positionId, addChange, removeChange, originalTitle]);
   ```

### useUnsavedChanges Hook
```typescript
// hooks/use-unsaved-changes.ts
interface UnsavedChange {
  oldValue: any;
  newValue: any;
}

interface PositionChanges {
  [field: string]: UnsavedChange;
}

export const useUnsavedChanges = () => {
  const [changes, setChanges] = useState<PositionChanges>({});

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(changes).length > 0;
  }, [changes]);

  const getPositionChanges = useCallback((positionId: string) => {
    return changes[positionId] || {};
  }, [changes]);

  const hasPositionChanges = useCallback((positionId: string) => {
    return positionId in changes && Object.keys(changes[positionId]).length > 0;
  }, [changes]);

  const addChange = useCallback((
    positionId: string, 
    field: string, 
    oldValue: any, 
    newValue: any
  ) => {
    setChanges(prev => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        [field]: { oldValue, newValue }
      }
    }));
  }, []);

  const removeChange = useCallback((positionId: string, field?: string) => {
    setChanges(prev => {
      const newChanges = { ...prev };
      if (field) {
        // Remove specific field change
        if (newChanges[positionId]) {
          const { [field]: removed, ...remaining } = newChanges[positionId];
          if (Object.keys(remaining).length === 0) {
            delete newChanges[positionId];
          } else {
            newChanges[positionId] = remaining;
          }
        }
      } else {
        // Remove all changes for this position
        delete newChanges[positionId];
      }
      return newChanges;
    });
  }, []);

  const clearAllChanges = useCallback(() => {
    setChanges({});
  }, []);

  const getChangesForSave = useCallback(() => {
    const saveData: Array<{
      id: string;
      [field: string]: any;
    }> = [];

    Object.entries(changes).forEach(([positionId, fieldChanges]) => {
      const positionData: any = { id: positionId };
      
      Object.entries(fieldChanges).forEach(([field, { newValue }]) => {
        positionData[field] = newValue;
      });
      
      saveData.push(positionData);
    });

    return saveData;
  }, [changes]);

  return {
    changes,
    hasUnsavedChanges,
    getPositionChanges,
    hasPositionChanges,
    addChange,
    removeChange,
    clearAllChanges,
    getChangesForSave,
  };
};
```

## Visual Indicators

### Button States in Editing Mode
- **Save Button**:
  - **Default**: "Speichern" (no changes)
  - **Has changes**: "Speichern*" with orange ring
  - **Saving**: "Speichere..." (disabled)
- **Cancel Button**: "Verwerfen" (always available in editing mode)
- **Edit Button**: "Bearbeiten" (only visible in view mode)

### Field Indicators
- **Orange dots**: Next to field labels when position has unsaved changes
- **Real-time updates**: Indicators appear/disappear as user types

### Change Tracking
- **Per-position**: Each position tracks its own changes independently
- **Per-field**: Title and description tracked separately
- **Batch save**: All changes saved together when user clicks save

## Error Handling

### Save Failures
- **Keep changes**: Failed saves don't clear change tracking
- **Allow retry**: User can try saving again
- **Error messages**: Toast notifications for failed operations

### Network Issues
- **Graceful degradation**: UI remains responsive during network issues
- **Retry mechanism**: Save button remains available for retry

## Performance Considerations

### Memoization
- **useCallback**: Prevents unnecessary re-renders of event handlers
- **useMemo**: Memoizes expensive computations like data transformations
- **React.memo**: Prevents unnecessary re-renders of position components

### Data Access
- **Direct tree access**: `findNodeById(treeData, selectedNodeId)` gets fresh data
- **No stale references**: Always reads from current `treeData`
- **Efficient updates**: Only modified positions included in save operations

## Testing Considerations

### Unit Tests
- **Change tracking**: Test `useUnsavedChanges` hook behavior
- **Data transformation**: Test `transformPositionsToTreeData`
- **Component rendering**: Test position components with different states

### Integration Tests
- **Save flow**: Test complete save process from UI to database
- **Node switching**: Test switching between nodes with unsaved changes
- **Error scenarios**: Test save failures and retry mechanisms

### Manual Testing
- **RTE behavior**: Verify no revert issues after saving
- **Visual indicators**: Confirm orange dots and save button states
- **Change persistence**: Verify changes remain when switching nodes 