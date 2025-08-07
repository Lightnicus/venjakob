# QuotesListTable Component

## Overview
The `QuotesListTable` component provides a comprehensive interface for managing quote variants with support for both full and reduced display modes.

## Props

```typescript
interface QuotesListTableProps {
  data: VariantListItem[];
  languages: Language[];
  onSaveQuoteProperties: (quoteId: string, quoteData: any, reloadData?: boolean) => Promise<void>;
  onDeleteVariant: (variantId: string) => Promise<void>;
  onCreateQuote: () => Promise<VariantListItem>;
  onCopyVariant: (variant: VariantListItem) => Promise<VariantListItem>;
  reducedMode?: boolean; // New: Enables reduced mode with radio button selection
  onVariantSelect?: (variant: VariantListItem) => void; // New: Callback for variant selection
}
```

## Reduced Mode

The `reducedMode` prop enables a simplified table view designed for selection scenarios:

### Features in Reduced Mode:
- **Selection Column**: Adds a "Auswahl" column with radio buttons in the first position
- **Hidden Columns**: Removes "Gesperrt" (Locked) and "Aktionen" (Actions) columns
- **Row Selection**: Clicking on any row selects the variant via radio button
- **Visual Feedback**: Selected rows are highlighted with blue background (`bg-blue-50`)
- **Callback Support**: `onVariantSelect` callback is triggered when a variant is selected

### Standard Mode Features:
- **Full Functionality**: All columns including lock status and action buttons
- **Row Navigation**: Clicking rows opens the quote detail view
- **Action Buttons**: Edit, copy, and delete actions for each variant

## Usage Examples

### Standard Mode (Default)
```tsx
<QuotesListTable
  data={variants}
  languages={languages}
  onSaveQuoteProperties={handleSaveProperties}
  onDeleteVariant={handleDeleteVariant}
  onCreateQuote={handleCreateQuote}
  onCopyVariant={handleCopyVariant}
/>
```

### Reduced Mode with Selection
```tsx
<QuotesListTable
  data={variants}
  languages={languages}
  onSaveQuoteProperties={handleSaveProperties}
  onDeleteVariant={handleDeleteVariant}
  onCreateQuote={handleCreateQuote}
  onCopyVariant={handleCopyVariant}
  reducedMode={true}
  onVariantSelect={(variant) => {
    console.log('Selected variant:', variant);
    // Handle variant selection
  }}
/>
```

## Column Structure

### Standard Mode Columns:
1. Angebots-Nr (Quote Number)
2. Titel (Title)
3. Status (Sales Opportunity Status)
4. KdNr (Customer Number)
5. AngebotsEmpfänger (Quote Recipient)
6. Version (Latest Version Number)
7. Geändert von (Modified By)
8. Geändert am (Modified At)
9. Gesperrt (Locked Status)
10. Aktionen (Actions)

### Reduced Mode Columns:
1. **Auswahl** (Selection) - Radio buttons
2. Angebots-Nr (Quote Number)
3. Titel (Title)
4. Status (Sales Opportunity Status)
5. KdNr (Customer Number)
6. AngebotsEmpfänger (Quote Recipient)
7. Version (Latest Version Number)
8. Geändert von (Modified By)
9. Geändert am (Modified At)

## Data Structure

```typescript
type VariantListItem = {
  id: string;
  quoteId: string;
  quoteNumber: string | null;
  quoteTitle: string | null;
  variantNumber: number;
  variantDescriptor: string;
  languageId: string;
  languageLabel: string | null;
  salesOpportunityStatus: string | null;
  clientForeignId: string | null;
  clientName: string | null;
  latestVersionNumber: number;
  lastModifiedBy: string | null;
  lastModifiedByUserName: string | null;
  lastModifiedAt: string;
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
};
```

## Implementation Details

### Radio Button Selection
- Uses `RadioGroup` and `RadioGroupItem` from `@/components/ui/radio-group`
- Selection state is managed internally with `selectedVariantId`
- Radio buttons are positioned in the first column when `reducedMode` is true
- Clicking on radio buttons or rows triggers the `onVariantSelect` callback

### Conditional Column Rendering
- Columns are conditionally rendered using spread operators with ternary conditions
- Selection column: `...(reducedMode ? [selectionColumn] : [])`
- Lock and Actions columns: `...(!reducedMode ? [lockColumn, actionsColumn] : [])`

### Row Interaction
- In standard mode: Row clicks open quote detail view
- In reduced mode: Row clicks select the variant via radio button
- Visual feedback through `getRowClassName` function

### Filtering and Sorting
- Status filtering dropdown with predefined options
- Global search across quote number, title, client name, and customer number
- Default sorting by modification date (newest first)
- All standard table functionality preserved in both modes 