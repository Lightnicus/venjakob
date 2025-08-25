# Component Patterns

This document outlines common component patterns and best practices used in the project.

## Rich Text Editor (PlateJS) Integration

### Implementation Pattern
Our `PlateRichTextEditor` component uses a **separate components architecture** to solve React DnD conflicts and ensure reliable toolbar rendering:

```typescript
// Separate read-only component - pure HTML display
const PlateRichTextViewer = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  ({ defaultValue, className, id }, ref) => {
    return (
      <div 
        className={cn('min-h-[200px] rounded-md prose prose-sm max-w-none', className)} 
        id={id}
        dangerouslySetInnerHTML={{ __html: defaultValue || '' }}
      />
    );
  }
);

// Separate edit component - full PlateJS editor
const PlateRichTextEditorEdit = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  ({ defaultValue, onTextChange, placeholder, className, id, variant }, ref) => {
    const initialValue = useMemo(() => htmlToValue(defaultValue), [defaultValue]);
    
    const plugins = useMemo(() => {
      return EditorKit.filter(plugin => plugin.key !== 'floating-toolbar');
    }, []);

    const editor = usePlateEditor({ plugins, value: initialValue });
    
    return (
      <div className={cn('min-h-[200px] rounded-md border', className)} id={id}>
        <Plate editor={editor} onChange={handleChange}>
          <EditorContainer variant={variant}>
            <Editor placeholder={placeholder} variant={variant} />
          </EditorContainer>
        </Plate>
      </div>
    );
  }
);

// Main component - conditional rendering
const PlateRichTextEditor = React.forwardRef<PlateEditorRef, PlateRichTextEditorProps>(
  (props, ref) => {
    if (props.readOnly) {
      return <PlateRichTextViewer {...props} ref={ref} />;
    }
    return <PlateRichTextEditorEdit {...props} ref={ref} />;
  }
);
```

### Key Features
- **Dual-Component Architecture**: Separate components for read-only display and full editing
- **Performance Optimized**: Read-only mode renders pure HTML without editor overhead
- **Memory Leak Prevention**: Proper cleanup of editor instances and async operations
- **Memoization**: Heavy components are memoized to prevent unnecessary re-renders
- **Consistent Toolbar**: Edit mode always provides complete toolbar functionality
- **React DnD Compatible**: Drag-and-drop functionality isolated to edit mode only
- **Fixed Toolbar**: Single toolbar above editor content (no floating toolbars)
- **Official PlateJS Serialization**: Uses `serializeHtml` with `BaseEditorKit` and static components for proper HTML conversion
- **Type Safety**: Full TypeScript interfaces for all component props

### Component Architecture
✅ **Independent Lifecycles**: Read and edit modes have separate component trees  
✅ **Optimized Performance**: Read-only mode eliminates unnecessary JavaScript overhead  
✅ **Reliable State**: Edit component maintains consistent plugin initialization

### HTML Serialization Implementation

The component uses the official PlateJS serialization approach for proper HTML conversion:

**HTML to PlateJS Value (Deserialization):**
```typescript
// Uses editor's built-in HTML deserializer
const tempEditor = createSlateEditor({ 
  plugins: EditorKit.filter(plugin => plugin.key !== 'floating-toolbar'),
  value: [] 
});
const nodes = tempEditor.api.html.deserialize({ element: htmlElement });
```

**PlateJS Value to HTML (Serialization):**
```typescript
// Uses official serializeHtml with static components
const editorStatic = createSlateEditor({
  plugins: BaseEditorKit,  // Static components for server-side rendering
  value,
});
const html = await serializeHtml(editorStatic, {
  editorComponent: EditorStatic,
  props: { variant: 'select' },
});
```

**Key Benefits:**
- Preserves all rich text formatting (bold, italic, underline, headings, lists, etc.)
- Compatible with server-side rendering
- Uses static components for optimal performance
- Handles complex nested structures correctly  
✅ **Clean Separation**: Clear boundaries between display and editing functionality  
✅ **Backward Compatible**: Maintains same interface as previous rich text editor implementations

### Architecture Design

The component uses a **dual-component architecture** that separates read-only and editing functionality into distinct components:

```typescript
// Conditional rendering based on mode
if (props.readOnly) {
  return <PlateRichTextViewer {...props} ref={ref} />;    // Pure HTML display
}
return <PlateRichTextEditorEdit {...props} ref={ref} />;   // Full PlateJS editor
```

**Design Principles**:
- **Independent Lifecycles**: Read and edit components never share state or React lifecycle
- **Optimized Performance**: Read-only mode renders pure HTML without PlateJS overhead
- **Consistent Initialization**: Edit component always starts with complete plugin configuration
- **React DnD Compatibility**: Only edit mode uses drag-and-drop functionality, preventing backend conflicts

### Toolbar Implementation

The toolbar uses a fixed configuration of PlateJS toolbar components:

```typescript
// FixedToolbarButtons component structure
export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="flex w-full">
      {!readOnly && (
        <>
          {/* History Controls */}
          <ToolbarGroup>
            <UndoToolbarButton />
            <RedoToolbarButton />
          </ToolbarGroup>

          {/* Text Format & Size */}
          <ToolbarGroup>
            <TurnIntoToolbarButton />     // Headings, paragraphs
            <FontSizeToolbarButton />     // Font size selection
          </ToolbarGroup>

          {/* Text Styling */}
          <ToolbarGroup>
            <MarkToolbarButton nodeType={KEYS.bold} />
            <MarkToolbarButton nodeType={KEYS.italic} />
            <MarkToolbarButton nodeType={KEYS.underline} />
            <MarkToolbarButton nodeType={KEYS.strikethrough} />
          </ToolbarGroup>

          {/* Layout & Lists */}
          <ToolbarGroup>
            <AlignToolbarButton />
            <NumberedListToolbarButton />
            <BulletedListToolbarButton />
          </ToolbarGroup>

          {/* Tables */}
          <ToolbarGroup>
            <TableToolbarButton />
          </ToolbarGroup>
        </>
      )}
      <div className="grow" />
    </div>
  );
}
```

### Toolbar Configuration

The toolbar provides essential formatting tools for business document editing:

**Available Features**:
- **History Controls** - Undo/Redo operations
- **Text Formatting** - Headings, paragraphs, font sizes
- **Text Styling** - Bold, italic, underline, strikethrough
- **Layout** - Text alignment options
- **Lists** - Numbered and bulleted lists
- **Tables** - Table creation and editing

**Intentionally Excluded Features**:
The toolbar focuses on core business formatting needs and excludes features like AI integration, media uploads, collaboration tools, advanced formatting (code/math), colors, links, and import/export to maintain simplicity and performance.

### Usage Examples

#### Basic Usage
```typescript
<PlateRichTextEditor
  defaultValue={description}
  onTextChange={handleDescriptionChange}
  placeholder="Geben Sie hier eine detaillierte Beschreibung ein..."
  readOnly={!isEditing}
  className="min-h-[200px]"
/>
```

#### Read-only Display
```typescript
<PlateRichTextEditor
  defaultValue={savedContent}
  readOnly={true}
  className="prose max-w-none"
/>
```

#### In Form Context
```typescript
const [formDescriptionHtml, setFormDescriptionHtml] = useState(initialDescription);

<PlateRichTextEditor
  defaultValue={formDescriptionHtml}
  onTextChange={(content) => setFormDescriptionHtml(content)}
  placeholder="Enter description..."
  readOnly={!isEditing}
  variant="select"
/>
```

#### Tab Integration
```typescript
// In split panel or tabbed interface
<PlateRichTextEditor
  id={`description-editor-${nodeId}`}
  defaultValue={selectedNode?.description || ''}
  onTextChange={(content) => handleDescriptionChange(selectedNode?.id, content)}
  placeholder="Click to add description..."
  readOnly={!isEditing}
/>
```

### Component Interface

The component provides a simple, consistent interface for rich text editing:

```typescript
interface PlateRichTextEditorProps {
  defaultValue?: string;                    // HTML content to display/edit
  onTextChange?: (content: string, editor: any) => void;  // Change handler
  placeholder?: string;                     // Placeholder text for empty editor
  readOnly?: boolean;                      // Toggle between view/edit modes
  className?: string;                      // Additional CSS classes
  id?: string;                            // HTML element ID
  variant?: 'default' | 'select' | 'demo'; // Editor styling variant
}

// Ref interface for programmatic control
interface PlateEditorRef {
  getEditor: () => any | null;            // Access to PlateJS editor instance
  getHtml: () => string;                  // Get current content as HTML
  setHtml: (html: string) => void;        // Set content from HTML
}
```

### Performance Characteristics
- **Read-Only Mode**: Pure HTML rendering with minimal JavaScript overhead
- **Edit Mode**: Full PlateJS editor with complete plugin ecosystem
- **Conditional Loading**: PlateJS plugins only load when entering edit mode
- **Memory Efficient**: No persistent editor state in read-only mode

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

### Avoid cross-component setState during render

When a child component needs to inform a parent about changes (e.g., tracking unsaved changes), never call the parent's state setters from inside a child `setState` updater or during render. Prefer to:

- Perform the child's local `setState` first
- Then, in the same event handler (after local state), invoke the parent's setter/callback

This prevents React error: "Cannot update a component (Parent) while rendering a different component (Child)."

Example (OfferPositionArticle): Register calculation changes outside the `setCalcItems` updater and after computing the normalized value.

### Controlled Form Pattern (OfferProperties)

For simple forms that should mirror server/parent state exactly, use a controlled component without local `useState`.

Key rules:
- Derive all render values from props.
- Emit full payload via `onChange` with shallow merges.
- Do not store derived values (compute in render).
- Keep toggle business rules in handlers while avoiding side effects elsewhere.

Minimal example based on `OfferProperties`:

```tsx
type Preis = OfferPropertiesProps['preis'];

const updatePreis = (partial: Partial<Preis>) =>
  onChange?.({ kunde, empfaenger, preis: { ...preis, ...partial }, bemerkung });

const handleShowUnitPrices = () => {
  const next = !preis.showUnitPrices;
  updatePreis({ showUnitPrices: next, calcTotal: next ? true : preis.calcTotal });
};

const displayedTotal = preis.calcTotal ? (preis.autoTotal || 0) : preis.total;
const discountAmount = preis.discountPercent
  ? displayedTotal * (preis.discountValue / 100)
  : preis.discount;
const totalWithDiscount = Math.max(0, displayedTotal - discountAmount);
```

Benefits:
- Single source of truth in parent/server state
- No sync effects between props and local state
- Predictable UI derived from current props

## Table Action Components

### TableActionButton & TableActionsCell

Reusable components for handling table row actions with automatic loading states and consistent styling.

#### Purpose

Eliminates duplicate code across table components by providing:
- Consistent action button styling and behavior
- Automatic loading state management for async actions
- Event handling to prevent row clicks when clicking actions
- Accessible tooltips and disabled states

#### Components

##### TableActionButton

A single action button with loading state management:

```typescript
import { TableActionButton } from '@/project_components/table-action-button';
import { Edit } from 'lucide-react';

<TableActionButton
  icon={Edit}
  title="Bearbeiten"
  onClick={async () => {
    await handleEdit();
  }}
  variant="ghost"
/>
```

##### TableActionsCell

A container for multiple action buttons:

```typescript
import { TableActionsCell, TableAction } from '@/project_components/table-actions-cell';
import { Edit, Copy, Trash2 } from 'lucide-react';

const actions: TableAction[] = [
  {
    icon: Edit,
    title: 'Bearbeiten',
    onClick: () => handleEdit(row.original),
  },
  {
    icon: Copy,
    title: 'Kopieren',
    onClick: () => handleCopy(row.original),
  },
  {
    icon: Trash2,
    title: 'Löschen',
    onClick: () => handleDelete(row.original),
    variant: 'destructive',
  },
];

return <TableActionsCell actions={actions} />;
```

##### External Loading State Example

For complex operations like delete confirmation dialogs:

```typescript
const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

const handleDeleteConfirm = async () => {
  if (itemToDelete) {
    try {
      setDeletingItemId(itemToDelete.id);
      await onDeleteItem(itemToDelete.id);
    } finally {
      setDeletingItemId(null);
    }
  }
};

const actions: TableAction[] = [
  {
    icon: Trash2,
    title: 'Löschen',
    onClick: () => openDeleteDialog(row.original),
    variant: 'destructive',
    isLoading: deletingItemId === row.original.id, // External loading state
  },
];
```

#### Features

- **Loading States**: Automatically shows spinner during async operations
- **External Loading Control**: Supports external loading state management for complex flows
- **Event Handling**: Prevents row clicks when clicking action buttons
- **Consistent Styling**: Uniform 8x8 icon buttons with proper spacing
- **Accessibility**: Title attributes for tooltips and proper disabled states
- **Error Handling**: Catches and logs action errors automatically

#### Usage in Table Columns

```typescript
{
  id: 'actions',
  header: 'Aktionen',
  cell: ({ row }) => {
    const actions: TableAction[] = [
      {
        icon: Edit,
        title: 'Bearbeiten',
        onClick: () => handleEdit(row.original),
      },
      {
        icon: Copy,
        title: 'Kopieren',
        onClick: () => handleCopy(row.original),
      },
      {
        icon: Trash2,
        title: 'Löschen',
        onClick: () => handleDelete(row.original),
        variant: 'destructive',
      },
    ];

    return <TableActionsCell actions={actions} />;
  },
  enableSorting: false,
  enableGlobalFilter: false,
},
```

#### TableAction Interface

```typescript
interface TableAction {
  icon: LucideIcon;           // Lucide icon component
  title: string;              // Tooltip text
  onClick: () => Promise<void> | void;  // Action handler
  variant?: 'default' | 'destructive' | 'ghost';  // Button variant
  className?: string;         // Additional CSS classes
  disabled?: boolean;         // Disabled state
  isLoading?: boolean;        // External loading state (overrides internal loading)
}
```

#### Benefits

- **DRY Principle**: Eliminates duplicate action button code across tables
- **Consistent UX**: Uniform loading states and interactions
- **Type Safety**: Full TypeScript support with proper interfaces
- **Maintainability**: Single source of truth for table action behavior
- **Accessibility**: Built-in tooltip and disabled state support

#### Current Usage

Implemented in:
- **QuotesListTable** - Edit, Copy, Delete actions with loading states
- **SalesOpportunitiesListTable** - Edit, Copy, Delete actions with loading states

### VariantVersionsTable

A table component to display versions for a specific quote variant.

**Location:** `project_components/variant-versions-table.tsx`

**Props:**
- `variantId: string` (required)

**Features:**
- Loads versions from `GET /api/quotes/variants/[variantId]/versions`
- Default sorting by `versionNumber` descending
- Actions: "PDF ansehen" (opens `PdfPreview`), "Löschen" (soft delete)
- Loading state via `LoadingIndicator`

**Usage:**
```tsx
import VariantVersionsTable from '@/project_components/variant-versions-table';

<VariantVersionsTable variantId={variantId} />
```

**Related APIs:**
- `GET /api/quotes/variants/[variantId]/versions`
- `DELETE /api/quotes/versions/[versionId]`

#### Migration Guide

To migrate existing table action columns:

1. **Import the components**:
   ```typescript
   import { TableActionsCell, TableAction } from '@/project_components/table-actions-cell';
   ```

2. **Define actions array**:
   ```typescript
   const actions: TableAction[] = [
     // Define your actions
   ];
   ```

3. **Replace action column cell**:
   ```typescript
   cell: ({ row }) => <TableActionsCell actions={actions} />
   ```

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

## Dialog Components

### AddBlockDialog & AddArticleDialog

Two dialog components for adding blocks and articles to quote positions.

**Location:** `project_components/add-block-dialog.tsx` and `project_components/add-article-dialog.tsx`

**Shared Architecture:**
- Both load their own data when opened (no pre-loading by parent)
- Both use `LoadingIndicator` for consistent loading UI
- Both have standardized preview panes with HTML rendering
- Both use `Intl.NumberFormat` for currency formatting
- Both follow the same layout pattern with table, add button, and preview
- Both use `LoadingButton` for consistent loading states

**Props:**
- `open: boolean` - Dialog visibility
- `onClose: () => void` - Close handler
- `languageId: string` - Language for data fetching
- `versionId?: string` - Target version for position creation
- `selectedNodeId?: string | null` - Parent node for positioning
- `onPositionCreated?: (positionId: string) => void` - Callback after creation

**Data Loading:**
- **AddBlockDialog**: Fetches via `fetchBlocksWithContentByLanguage(languageId)`
- **AddArticleDialog**: Fetches via `fetchArticlesByLanguage(languageId)`
- Both show loading state with `LoadingIndicator` component

**Table Features:**
- Radio selection for single item choice
- Global search across relevant fields
- Consistent column definitions with proper formatting
- Row click to select items

**Preview Pane:**
- Converts Plate JSON content to HTML for preview
- Shows title (if not hidden) and rendered content
- Fixed height (32) with scrollable content
- Error handling for content conversion

**Actions:**
- Uses `LoadingButton` component for consistent loading states
- Button text: "Hinzufügen" (normal) / "Hinzufügen..." (loading)
- Calls respective API (`createQuotePosition` or `createQuotePositionForArticle`)
- Notifies parent via `onPositionCreated` callback
- Shows success/error toasts

**Usage:**
```tsx
// Both dialogs follow the same pattern
<AddBlockDialog
  open={showDialog}
  onClose={handleClose}
  languageId={languageId}
  versionId={versionId}
  selectedNodeId={selectedNodeId}
  onPositionCreated={handlePositionCreated}
/>

<AddArticleDialog
  open={showDialog}
  onClose={handleClose}
  languageId={languageId}
  versionId={versionId}
  selectedNodeId={selectedNodeId}
  onPositionCreated={handlePositionCreated}
/>
```

**Key Improvements (DRY):**
1. **Unified data loading** - Both dialogs fetch their own data
2. **Standardized loading UI** - Both use `LoadingIndicator`
3. **Normalized preview pane** - Same layout and height
4. **Unified currency/date formatting** - Consistent German formatting
5. **Clarified add behavior** - Removed unused `onAdd` props
6. **Column definition consistency** - Similar structure and formatting
7. **LoadingButton integration** - Consistent loading states across dialogs

### LoadingButton

A reusable button component that handles loading states with visual feedback.

**Location:** `project_components/loading-button.tsx`

**Features:**
- **Loading State**: Shows `Loader2` icon with `animate-spin` when loading
- **Text Change**: Optional `loadingText` prop to change button text during loading
- **Disabled State**: Automatically disables button when loading
- **Flexible**: Supports all Button variants, sizes, and props
- **TypeScript**: Full type safety with proper interfaces

**Props:**
- `loading?: boolean` - Shows loading state
- `loadingText?: string` - Text to show when loading (optional)
- `disabled?: boolean` - Disables button
- `variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `size?: 'default' | 'sm' | 'lg' | 'icon'`
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Button content
- `onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>`
- `type?: 'button' | 'submit' | 'reset'`
- `'aria-label'?: string` - Accessibility label

**Usage:**
```tsx
import LoadingButton from '@/project_components/loading-button';

// Basic usage
<LoadingButton
  onClick={handleClick}
  loading={isLoading}
  loadingText="Speichern..."
>
  Speichern
</LoadingButton>

// With disabled state
<LoadingButton
  onClick={handleSubmit}
  disabled={!isValid}
  loading={isSubmitting}
  loadingText="Wird gesendet..."
  type="submit"
>
  Absenden
</LoadingButton>

// With custom styling
<LoadingButton
  onClick={handleDelete}
  variant="destructive"
  size="sm"
  loading={isDeleting}
  loadingText="Lösche..."
  className="w-full"
>
  Löschen
</LoadingButton>
```

**Benefits:**
- **DRY Principle**: Eliminates duplicate loading button markup
- **Consistency**: Provides uniform loading states across the application
- **Maintainability**: Single place to update loading button behavior
- **Accessibility**: Proper ARIA labels and disabled states
- **Type Safety**: Full TypeScript support with proper interfaces

### IconButton

A button component for icon-based actions with enhanced loading state support.

**Location:** `project_components/icon-button.tsx`

**Features:**
- **Loading State**: Shows `Loader2` icon with `animate-spin` when loading
- **External Loading Control**: Supports external loading state management
- **Internal Loading**: Automatic loading state for async operations
- **Flexible**: Supports all Button variants and sizes
- **TypeScript**: Full type safety with proper interfaces

**Props:**
- `icon: ReactNode` - Icon to display when not loading
- `loading?: boolean` - External loading state (optional)
- `disabled?: boolean` - Disables button
- `variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `className?: string` - Additional CSS classes
- `'aria-label': string` - Accessibility label
- `onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>`
- `onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void | Promise<void>`
- `onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void`

**Loading State Behavior:**
- **External Loading**: When `loading` prop is provided, uses external state management
- **Internal Loading**: When `loading` is undefined, automatically manages loading for async operations
- **Priority**: External loading takes precedence over internal loading

**Usage:**
```tsx
import IconButton from '@/project_components/icon-button';
import { Copy, Trash2 } from 'lucide-react';

// With external loading state
<IconButton
  icon={<Copy size={16} />}
  loading={isCopying}
  aria-label="Kopieren"
  onClick={handleCopy}
/>

// With internal loading state (automatic)
<IconButton
  icon={<Trash2 size={16} />}
  aria-label="Löschen"
  onClick={async () => {
    await deleteItem();
  }}
/>

// With custom styling
<IconButton
  icon={<Trash2 size={16} />}
  variant="destructive"
  className="text-red-600 hover:text-red-700"
  aria-label="Löschen"
  onClick={handleDelete}
/>
```

**Enhanced Features:**
- **Row-Specific Loading**: Can track loading state per row in tables
- **Concurrent Operations**: Supports multiple simultaneous operations using Sets
- **Error Handling**: Proper error handling for async operations
- **Accessibility**: Full keyboard navigation support
- **Consistent Styling**: Matches LoadingButton patterns

**Concurrent Loading State Management:**
```tsx
// Using Sets to track multiple concurrent operations
const [copyingBlockIds, setCopyingBlockIds] = useState<Set<string>>(new Set());
const [deletingBlockIds, setDeletingBlockIds] = useState<Set<string>>(new Set());

// Adding an operation
setCopyingBlockIds(prev => new Set([...prev, block.id]));

// Removing an operation
setCopyingBlockIds(prev => {
  const newSet = new Set(prev);
  newSet.delete(block.id);
  return newSet;
});

// Checking if an item is loading
loading={copyingBlockIds.has(row.original.id)}
```

**Benefits of Set-based Loading:**
- **Multiple Concurrent Operations**: Users can start multiple operations without losing loading states
- **Independent Loading States**: Each row maintains its own loading state
- **Better UX**: No loading state conflicts between different operations
- **Scalable**: Supports unlimited concurrent operations

## Interactive Split Panel

The `InteractiveSplitPanel` component provides a tree view with drag-and-drop functionality for quote positions. It features:

- **Tree Structure**: Hierarchical display of quote positions using ArboristTree
- **Drag & Drop**: Reordering functionality with business rule validation
- **Node Selection**: Click to select and view node details in the right panel
- **Right Panel**: Displays selected node details with editing capabilities
- **Search**: Filter tree nodes by name
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Memoized components and callbacks prevent UI freezing
- **Memory Management**: Proper cleanup of rich text editors and async operations

### Usage

```typescript
<InteractiveSplitPanel
  initialTreeData={treeData}
  isEditing={isEditing}
  versionId={versionId}
  onTreeDataChange={handleTreeDataChange}
/>
```

### Right Panel Components

**OfferPositionText**: Handles text block nodes with:
- Title input field (populated from `quote_positions.title`)
- Rich text description editor (populated from `quote_positions.description`)
- Read-only mode when not editing
- Preview tab for formatted output

**OfferPositionArticle**: Handles article nodes with:
- Title input field (populated from `quote_positions.title`)
- Rich text description editor (populated from `quote_positions.description`)
- Calculation tab for pricing
- Preview tab for formatted output
- All inputs disabled when not in edit mode

### Data Flow

The `transformPositionsToTreeData` function in `QuoteDetail` component:
- Fetches quote positions from database with `description` and `title` fields
- Transforms database records into tree structure with `MyTreeNodeData` interface
- Passes description and title data to right panel components
- Components use React state to manage editing of these fields

### Performance Optimizations

The InteractiveSplitPanel and related components implement several performance optimizations to prevent UI freezing:

#### Component Memoization
- **React.memo**: All form components (OfferPositionText, OfferPositionArticle, KalkulationForm) are wrapped with React.memo
- **useCallback**: Event handlers are memoized to prevent unnecessary re-renders
- **useMemo**: Heavy computations and JSX elements are memoized

#### Memory Management
- **Editor Cleanup**: PlateRichTextEditor properly destroys editor instances on unmount
- **Async Operation Cleanup**: All async operations check component mount state before updating
- **Deep Clone Optimization**: Replaced JSON.parse(JSON.stringify()) with optimized deep clone function

#### Tree Performance
- **Memoized Node Renderer**: Custom node renderer is memoized to prevent recreation
- **Optimized Search**: Search functionality uses memoized callbacks
- **Efficient State Updates**: Tree data updates are optimized with proper cloning

#### Key-Based Re-mounting
- **Force Re-mount**: Form components use key props to force re-mount when switching nodes
- **Clean State**: Prevents stale state issues between different node types
- **Editor Reset**: Ensures fresh editor instances for each node

### PlateRichTextEditor Component

The enhanced PlateJS rich text editor prevents multiple instance issues through:
- Proper cleanup of old instances before creating new ones
- Separate handling of content updates without full re-initialization
- User-only event triggering to prevent infinite loops
- Comprehensive cleanup on component unmount
- Force re-mounting via key prop when node changes
- Memory leak prevention with proper async operation cleanup
- **HTML5 Backend Conflict Prevention**: Drag-and-drop functionality is disabled in rich text editors to prevent conflicts with tree drag-and-drop
- **Context-Aware Functionality**: Tree provides drag-and-drop for reordering, rich text editor focuses on content editing

### Language Filtering for Blocks

The `InteractiveSplitPanel` component now supports language-specific block loading:

#### Implementation Details

**Database Level:**
- `