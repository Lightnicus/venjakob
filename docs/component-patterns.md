# Component Patterns & Reusable Components

This document covers reusable component patterns and design principles used throughout the Venjakob application.

## Overview

The application follows DRY (Don't Repeat Yourself) principles by creating reusable components and patterns that eliminate code duplication while maintaining consistency across the UI.

## Management Components

### ManagementWrapper Component

A reusable wrapper component that standardizes permission checking, loading states, and layout for all management pages.

#### Purpose

Eliminates duplicate code across management pages by centralizing:
- Permission checking logic
- Loading state management
- Consistent page layout and titles
- Error state handling

#### Usage

```typescript
import ManagementWrapper from './management-wrapper';

const YourManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Your data loading logic...
  
  return (
    <ManagementWrapper title="Your Management Page" permission="your-permission" loading={loading}>
      <YourListTable 
        data={data}
        // ... other props
      />
    </ManagementWrapper>
  );
};
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title displayed in header |
| `permission` | `string` | Required permission to access the page |
| `loading` | `boolean` | Loading state for data fetching |
| `children` | `ReactNode` | Content to render when access is granted |

#### States Handled

1. **Permission Loading**: Shows "Prüfe Berechtigungen..." while checking user permissions
2. **Access Denied**: Renders `AccessDeniedComponent` when user lacks permission
3. **Data Loading**: Shows "Lade Daten..." while fetching data
4. **Ready**: Renders the main content with title and layout

#### Benefits

- **Consistency**: Ensures uniform UX across all management pages
- **Maintainability**: Single source of truth for permission and loading patterns
- **Type Safety**: Full TypeScript support with proper interfaces
- **Accessibility**: Consistent loading indicators and error messages

#### Current Usage

The `ManagementWrapper` is implemented across all management components:

##### Core Management Components
- **ArticleManagement** - Article management with `artikel` permission
- **BlockManagement** - Block management with `blocks` permission
- **SalesOpportunitiesManagement** - Sales opportunities with `verkaufschancen` permission
- **QuotesManagement** - Quote management with `angebote` permission

##### Admin Management Components  
- **UserManagement** - User administration with `admin` permission
- **RoleManagement** - Role administration with `admin` permission
- **PermissionManagement** - Permission administration with `admin` permission

### Before/After Comparison

#### Before (Duplicated Pattern)

Each management component had identical permission checking and loading state logic:

```typescript
const ArticleManagement = () => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent } = usePermissionGuard('artikel');
  const [loading, setLoading] = useState(true);
  
  // Duplicated permission checking logic
  if (permissionLoading) {
    return <LoadingView title="Artikelverwaltung" message="Prüfe Berechtigungen..." />;
  }

  if (!hasAccess && !permissionLoading && !loading) {
    return <AccessDeniedComponent />;
  }

  if (loading && !permissionLoading) {
    return <LoadingView title="Artikelverwaltung" message="Lade Daten..." />;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Artikelverwaltung</h2>
      <ArticleListTable data={articles} /* ... */ />
    </div>
  );
};
```

#### After (Centralized Pattern)

Components now use the wrapper and focus on their specific logic:

```typescript
const ArticleManagement = () => {
  const [loading, setLoading] = useState(true);
  
  return (
    <ManagementWrapper title="Artikelverwaltung" permission="artikel" loading={loading}>
      <ArticleListTable data={articles} /* ... */ />
    </ManagementWrapper>
  );
};
```

### Implementation Details

The `ManagementWrapper` internally uses:
- `usePermissionGuard` hook for permission checking
- Consistent CSS classes from Tailwind
- German UI text with appropriate loading messages
- Proper component composition patterns

### Migration Guide

To migrate existing management components:

1. **Import the wrapper**:
   ```typescript
   import ManagementWrapper from './management-wrapper';
   ```

2. **Remove permission logic**:
   - Remove `usePermissionGuard` import and usage
   - Remove permission checking render logic
   - Keep only data loading state management

3. **Wrap your content**:
   ```typescript
   return (
     <ManagementWrapper title="Your Title" permission="your-permission" loading={loading}>
       {/* Your existing table/content */}
     </ManagementWrapper>
   );
   ```

4. **Update data loading**:
   - Remove permission dependencies from `useEffect`
   - Simplify to load data on component mount

#### Implementation Pattern

All management components follow the same implementation pattern:

1. Import the `ManagementWrapper` component
2. Remove direct `usePermissionGuard` usage
3. Wrap the main content with permission and loading props
4. Simplify data loading logic to remove permission dependencies

## Best Practices

### Component Design

1. **Composition over Inheritance**: Use wrapper components for shared functionality
2. **Single Responsibility**: Each component should have one clear purpose
3. **Props Interface**: Define clear TypeScript interfaces for all props
4. **Error Boundaries**: Handle error states gracefully and consistently

### Permission Patterns

1. **Declarative Permissions**: Use wrapper components to declare required permissions
2. **Centralized Logic**: Keep permission checking logic in reusable hooks/components
3. **Graceful Degradation**: Always provide appropriate fallback UI for denied access
4. **Loading States**: Show appropriate loading indicators during async operations

### State Management

1. **Local State First**: Use component-level state for simple cases
2. **Shared Patterns**: Extract common state patterns into reusable hooks
3. **Error Handling**: Implement consistent error handling across components
4. **Performance**: Avoid unnecessary re-renders with proper state management

## Extended Creation Patterns

### Multi-Parameter Creation Functions

For complex entities with hierarchical relationships (like quotes → variants → versions), use extended parameter signatures that support multiple creation flows:

```typescript
// Extended signature supports multiple creation scenarios
const handleCreateQuote = async (
  salesOpportunityId?: string,  // Required base parameter
  quoteId?: string,            // Optional: create variant for existing quote
  variantId?: string,          // Optional: create version for existing variant
  versionId?: string,          // Reserved for future flows
  languageId?: string          // Optional: language selection context
): Promise<QuoteListItem> => {
  // Flow 1: Complete new structure
  if (!quoteId && !variantId && !versionId && languageId) {
    return await createCompleteQuoteStructure(salesOpportunityId, languageId);
  }
  
  // Flow 2: New variant for existing quote
  if (quoteId && !variantId && !versionId && languageId) {
    return await createVariantForExistingQuote(quoteId, languageId);
  }
  
  // Flow 3: New version for existing variant
  if (quoteId && variantId && !versionId) {
    return await createVersionForExistingVariant(variantId);
  }
  
  // Fallback for backward compatibility
  return await createBasicQuote(salesOpportunityId);
};
```

#### Key Principles

1. **Progressive Enhancement**: Start with basic functionality, add complexity gradually
2. **Backward Compatibility**: Always maintain existing function signatures
3. **Clear Flow Logic**: Use parameter presence to determine creation flow
4. **Single Responsibility**: Each flow handles one specific creation scenario

#### Dialog Integration Pattern

For creation flows involving user input dialogs:

```typescript
// Dialog component passes selected data to creation function
const LanguageSelectionDialog: FC<{
  onCreateQuote: (salesOpportunityId?: string, quoteId?: string, variantId?: string, versionId?: string, languageId?: string) => Promise<any>;
}> = ({ onCreateQuote }) => {
  const handleLanguageSelected = async (languageId: string) => {
    // Pass language ID to creation function
    await onCreateQuote(salesOpportunityId, undefined, undefined, undefined, languageId);
    closeDialog();
  };
  
  return <LanguageSelector onSelect={handleLanguageSelected} />;
};
```

#### Tab Opening with Context

After successful creation, open tabs with complete context:

```typescript
// Open tab with all necessary IDs for proper context
const result = await createQuoteWithVariantAndVersion(data);

openNewTab({
  id: `quote-${result.quote.id}`,
  title: `${result.quote.title} (${languageLabel})`,
  content: <QuoteDetail 
    quoteId={result.quote.id}
    variantId={result.variant.id}     // Pass created variant ID
    language={languageLabel} 
  />,
  closable: true
});
```

#### Benefits

- **Flexibility**: Single function handles multiple creation scenarios
- **Maintainability**: Clear parameter-based flow control
- **User Experience**: Context-aware tab opening with proper data
- **Type Safety**: Full TypeScript support for all parameters

## Related Documentation

- [Authentication System](./auth.md) - Server-side authentication utilities
- [Dialog Manager System](./dialog-manager-docs.md) - Modal and dialog patterns
- [Smart Dialog Flows](./smart-dialog-flows.md) - Advanced dialog routing patterns
- [useEditLock Hook](./use-edit-lock.md) - Edit conflict prevention patterns
- [Database Schema](./db.md) - Database operations and quote creation functions

---

For questions about component patterns or suggestions for new reusable components, please refer to the project maintainers or create an issue in the project repository. 