# Helper Functions Documentation

This document provides detailed information about all helper functions located in the `@/helper` folder. These functions provide reusable utilities across the application.

## Table of Contents

- [Date Formatting](#date-formatting)
- [Status Translations](#status-translations)
- [Plate.js Serialization](#platejs-serialization)
- [Plate.js JSON Parser](#platejs-json-parser)
- [Menu Components](#menu-components)

---

## Date Formatting

**File**: `helper/date-formatter.ts`

### `formatGermanDate(date: string | Date): string`

Formats a date string or Date object to German date format (DD.MM.YYYY).

**Parameters:**
- `date`: Date string or Date object

**Returns:**
- Formatted German date string (e.g., "15.12.2024")

**Usage:**
```typescript
import { formatGermanDate } from '@/helper/date-formatter';

// From string
const dateString = "2024-12-15T10:30:00Z";
const formatted = formatGermanDate(dateString); // "15.12.2024"

// From Date object
const dateObj = new Date();
const formatted = formatGermanDate(dateObj); // "15.12.2024"
```

**Used in:**
- `quotes-list-table.tsx` - Format last modified dates
- `quote-detail.tsx` - Format last changed timestamps
- `role-detail.tsx` - Format creation and modification dates
- `permission-detail.tsx` - Format creation and modification dates
- `block-list-table.tsx` - Format last modified dates
- `user-list-table.tsx` - Format last modified dates
- `sales-opportunities-list-table.tsx` - Format modification dates
- `article-list-table.tsx` - Format last modified dates
- `add-article-dialog.tsx` - Format article update dates
- `add-block-dialog.tsx` - Format block update dates
- `quote_dialogs/quotes-dialogs.tsx` - Format sales opportunity dates

### `formatGermanDateTime(date: string | Date): string`

Formats a date string or Date object to German date and time format (DD.MM.YYYY HH:MM).

**Parameters:**
- `date`: Date string or Date object

**Returns:**
- Formatted German date and time string (e.g., "15.12.2024 14:30")

**Usage:**
```typescript
import { formatGermanDateTime } from '@/helper/date-formatter';

const dateString = "2024-12-15T14:30:00Z";
const formatted = formatGermanDateTime(dateString); // "15.12.2024 14:30"
```

---

## Status Translations

**File**: `helper/status-translations.ts`

### `salesOpportunityStatusTranslations: Record<string, string>`

A mapping object that translates English sales opportunity statuses to German.

**Available translations:**
- `'open'` → `'Offen'`
- `'in_progress'` → `'In Bearbeitung'`
- `'won'` → `'Gewonnen'`
- `'lost'` → `'Verloren'`
- `'cancelled'` → `'Storniert'`

### `translateSalesOpportunityStatus(status: string): string`

Translates a sales opportunity status from English to German.

**Parameters:**
- `status`: English status string

**Returns:**
- German translation of the status, or the original status if no translation is found

**Usage:**
```typescript
import { translateSalesOpportunityStatus } from '@/helper/status-translations';

const status = translateSalesOpportunityStatus('open'); // "Offen"
const unknownStatus = translateSalesOpportunityStatus('unknown'); // "unknown"
```

**Used in:**
- `quotes-list-table.tsx` - Display translated status in variant list
- `sales-opportunities-list-table.tsx` - Display translated status in sales opportunities list

---

## Plate.js Serialization

**File**: `helper/plate-serialization.ts`

### `plateValueToHtml(plateValue: any): string`

Converts a Plate.js editor value to HTML string.

**Parameters:**
- `plateValue`: Plate.js editor value (array of nodes)

**Returns:**
- HTML string representation of the Plate.js content

**Usage:**
```typescript
import { plateValueToHtml } from '@/helper/plate-serialization';

const plateValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Hello World' }]
  }
];

const html = plateValueToHtml(plateValue);
// Result: "<p>Hello World</p>"
```

**Used in:**
- `add-article-dialog.tsx` - Convert article content to HTML for preview
- `add-block-dialog.tsx` - Convert block content to HTML for preview

### `htmlToPlateValue(html: string): any`

Converts HTML string to Plate.js editor value.

**Parameters:**
- `html`: HTML string

**Returns:**
- Plate.js editor value (array of nodes)

**Usage:**
```typescript
import { htmlToPlateValue } from '@/helper/plate-serialization';

const html = "<p>Hello World</p>";
const plateValue = htmlToPlateValue(html);
// Result: [{ type: 'paragraph', children: [{ text: 'Hello World' }] }]
```

### `plateValueToText(plateValue: any): string`

Extracts plain text from a Plate.js editor value.

**Parameters:**
- `plateValue`: Plate.js editor value (array of nodes)

**Returns:**
- Plain text string

**Usage:**
```typescript
import { plateValueToText } from '@/helper/plate-serialization';

const plateValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Hello World' }]
  }
];

const text = plateValueToText(plateValue); // "Hello World"
```

---

## Plate.js JSON Parser

**File**: `helper/plate-json-parser.ts`

### `parseJsonContent(jsonString: string): any`

Parses a JSON string containing Plate.js content and returns the parsed value.

**Parameters:**
- `jsonString`: JSON string containing Plate.js content

**Returns:**
- Parsed Plate.js value (array of nodes)

**Usage:**
```typescript
import { parseJsonContent } from '@/helper/plate-json-parser';

const jsonString = '[{"type":"paragraph","children":[{"text":"Hello World"}]}]';
const plateValue = parseJsonContent(jsonString);
// Result: [{ type: 'paragraph', children: [{ text: 'Hello World' }] }]
```

**Used in:**
- `add-article-dialog.tsx` - Parse article content from database
- `add-block-dialog.tsx` - Parse block content from database

### `stringifyJsonContent(plateValue: any): string`

Converts a Plate.js value to a JSON string.

**Parameters:**
- `plateValue`: Plate.js editor value (array of nodes)

**Returns:**
- JSON string representation of the Plate.js value

**Usage:**
```typescript
import { stringifyJsonContent } from '@/helper/plate-json-parser';

const plateValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Hello World' }]
  }
];

const jsonString = stringifyJsonContent(plateValue);
// Result: '[{"type":"paragraph","children":[{"text":"Hello World"}]}]'
```

---

## Menu Components

**File**: `helper/menu.tsx`

### `Menu` Component

A reusable menu component for navigation and actions.

**Props:**
- `children`: React nodes to render inside the menu
- `className`: Additional CSS classes
- `...props`: Additional HTML attributes

**Usage:**
```typescript
import { Menu } from '@/helper/menu';

<Menu className="bg-white shadow-lg">
  <MenuItem>Option 1</MenuItem>
  <MenuItem>Option 2</MenuItem>
</Menu>
```

### `MenuItem` Component

A menu item component for use within the Menu component.

**Props:**
- `children`: React nodes to render inside the menu item
- `onClick`: Click handler function
- `className`: Additional CSS classes
- `disabled`: Whether the menu item is disabled
- `...props`: Additional HTML attributes

**Usage:**
```typescript
import { MenuItem } from '@/helper/menu';

<MenuItem onClick={() => console.log('clicked')}>
  Click me
</MenuItem>
```

---

## Best Practices

### When to Use Helper Functions

1. **Date Formatting**: Always use `formatGermanDate` for consistent German date formatting across the application
2. **Status Translations**: Use `translateSalesOpportunityStatus` for displaying sales opportunity statuses in German
3. **Plate.js Operations**: Use the serialization and parser functions for converting between Plate.js values and other formats
4. **Menu Components**: Use the Menu and MenuItem components for consistent menu styling

### Import Guidelines

```typescript
// Date formatting
import { formatGermanDate, formatGermanDateTime } from '@/helper/date-formatter';

// Status translations
import { translateSalesOpportunityStatus } from '@/helper/status-translations';

// Plate.js operations
import { plateValueToHtml, htmlToPlateValue } from '@/helper/plate-serialization';
import { parseJsonContent, stringifyJsonContent } from '@/helper/plate-json-parser';

// Menu components
import { Menu, MenuItem } from '@/helper/menu';
```

### Error Handling

All helper functions include proper error handling:
- Date formatting functions handle invalid date inputs gracefully
- Status translation returns the original value if no translation is found
- Plate.js functions handle malformed JSON and invalid content structures

### Performance Considerations

- Date formatting functions are optimized for frequent use in table components
- Status translations use a simple object lookup for fast performance
- Plate.js serialization functions are designed to handle large content efficiently

---

## Related Documentation

- [Component Patterns](./component-patterns.md) - General component patterns and guidelines
- [Database Schema](./db.md) - Database structure and relationships
- [Edit Lock System](./edit-lock-system.md) - Locking mechanisms for concurrent editing 