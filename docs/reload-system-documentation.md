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

### 3. useTabTitle Hook

```typescript
const { updateTitle } = useTabTitle('article-detail-123');
```

- `tabId`: The unique identifier of the tab to update
- Returns: `{ updateTitle }` function to update the tab's title

### 4. Tab Interface Types

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

Detail components trigger reloads and update tab titles when data is saved:

```typescript
// ArticleDetail.tsx
import { useTabReload, useTabTitle } from './tabbed-interface-provider';

const ArticleDetail = ({ articleId }) => {
  // ... existing state ...

  // Set up reload functionality - no callback needed as this component loads its own data
  const { triggerReload } = useTabReload('articles', () => {});
  
  // Set up tab title functionality
  const { updateTitle } = useTabTitle(`article-detail-${articleId}`);

  const handleSaveChanges = async () => {
    try {
      // Save data...
      
      toast.success('Artikel gespeichert');
      
      // Update tab title if article name changed
      if (editedAllgemeineData.name !== article.name) {
        updateTitle(`Artikel: ${editedAllgemeineData.name}`);
      }
      
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

### Quote System
- **QuotesManagement**: Listens for `'quotes'` reload signals
- **QuoteDetail**: Triggers `'quotes'` reload when saved or when variants are copied

## Benefits

1. **Real-time Synchronization**: Changes in one tab immediately reflect in other open tabs
2. **Dynamic Tab Titles**: Tab names automatically update when entity names change
3. **Performance**: Only affected components reload, not the entire interface
4. **Scalability**: Easy to add new reload groups for different data types
5. **Type Safety**: TypeScript interfaces ensure proper usage

## Usage Workflow

### Article System Example
1. User opens ArticleManagement tab (loads article list)
2. User opens ArticleDetail tab for a specific article (tab shows "Artikel: Original Name")
3. User edits the article name and other properties in ArticleDetail
4. User saves the changes
5. ArticleDetail updates its tab title to "Artikel: New Name"
6. ArticleDetail triggers a reload signal for 'articles'
7. ArticleManagement automatically reloads its data
8. Updated article information is now visible in the management tab

### Quote System Example
1. User opens QuotesManagement tab (loads quote variants list)
2. User opens QuoteDetail tab for a specific variant (tab shows quote details)
3. User edits quote positions and saves the changes
4. QuoteDetail triggers a reload signal for 'quotes'
5. QuotesManagement automatically reloads its data
6. Updated quote information is now visible in the management tab
7. When user copies a variant, the new variant appears in the management tab immediately

## Extension

To add reload and tab title functionality to new components:

1. Import `useTabReload` and `useTabTitle` hooks
2. For management components: Use `useTabReload(reloadKey, loadDataFunction)`
3. For detail components: 
   - Use `const { triggerReload } = useTabReload(reloadKey, () => {})`
   - Use `const { updateTitle } = useTabTitle(tabId)`
4. Call `triggerReload()` after successful save operations
5. Call `updateTitle(newTitle)` when entity names change

This system provides seamless data synchronization and dynamic tab titles across the tabbed interface without requiring manual refreshes or complex state management. 