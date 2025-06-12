# Tab Reload System Documentation

## Overview

The tabbed interface now includes a powerful reload system that allows components in different tabs to trigger data reloads in other tabs. This is particularly useful when saving data in one tab should refresh the data displayed in management/list views in other tabs.

## Key Components

### 1. TabbedInterfaceProvider

The provider now manages reload signals with:
- `reloadSignals`: A Map storing reload signals with timestamps
- `triggerReload(reloadKey: string)`: Function to trigger a reload for a specific key
- `getReloadSignal(reloadKey: string)`: Function to get the latest reload signal

### 2. useTabReload Hook

```typescript
const { triggerReload } = useTabReload('articles', onReload);
```

- `reloadKey`: Identifier for the reload group (e.g., 'articles', 'blocks')
- `onReload`: Callback function to execute when a reload is triggered
- Returns: `{ triggerReload }` function to trigger reloads for other tabs

### 3. Tab Interface Types

```typescript
export interface Tab {
  id: string;
  title: string;
  content: ReactNode;
  closable?: boolean;
  reloadKey?: string; // Optional: key to identify which tabs should reload
}

export interface ReloadSignal {
  key: string;
  timestamp: number;
}
```

## Implementation Examples

### Management Components (Data Lists)

Management components listen for reload signals:

```typescript
// ArticleManagement.tsx
import { useTabReload } from './tabbed-interface-provider';

const ArticleManagement = () => {
  // ... existing state ...

  const loadData = async () => {
    // Load articles and languages
  };

  // Set up reload functionality - listens for 'articles' reload signals
  useTabReload('articles', loadData);

  // ... rest of component
};
```

### Detail Components (Editors)

Detail components trigger reloads when data is saved:

```typescript
// ArticleDetail.tsx
import { useTabReload } from './tabbed-interface-provider';

const ArticleDetail = () => {
  // ... existing state ...

  // Set up reload functionality - no callback needed as this component loads its own data
  const { triggerReload } = useTabReload('articles', () => {});

  const handleSaveChanges = async () => {
    try {
      // Save data...
      
      toast.success('Artikel gespeichert');
      
      // Trigger reload for other tabs (like ArticleManagement)
      triggerReload();
    } catch (error) {
      // Handle error...
    }
  };

  // ... rest of component
};
```

## Current Implementation

### Article System
- **ArticleManagement**: Listens for `'articles'` reload signals
- **ArticleDetail**: Triggers `'articles'` reload when saved

### Block System
- **BlockManagement**: Listens for `'blocks'` reload signals
- **BlockDetail**: Triggers `'blocks'` reload when saved

## Benefits

1. **Real-time Synchronization**: Changes in one tab immediately reflect in other open tabs
2. **Performance**: Only affected components reload, not the entire interface
3. **Scalability**: Easy to add new reload groups for different data types
4. **Type Safety**: TypeScript interfaces ensure proper usage

## Usage Workflow

1. User opens ArticleManagement tab (loads article list)
2. User opens ArticleDetail tab for a specific article
3. User edits and saves the article in ArticleDetail
4. ArticleDetail triggers a reload signal for 'articles'
5. ArticleManagement automatically reloads its data
6. Updated article information is now visible in the management tab

## Extension

To add reload functionality to new components:

1. Import `useTabReload` hook
2. For management components: Use `useTabReload(reloadKey, loadDataFunction)`
3. For detail components: Use `const { triggerReload } = useTabReload(reloadKey, () => {})`
4. Call `triggerReload()` after successful save operations

This system provides seamless data synchronization across the tabbed interface without requiring manual refreshes or complex state management. 