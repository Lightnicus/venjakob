# Venjakob Project Documentation

## Overview
This is a Next.js 15 application for managing quotes, articles, blocks, and sales opportunities.

## Key Features

### Quote Management
- **Quote Creation**: Create quotes with variants and versions
- **Position Management**: Add and manage quote positions (articles and text blocks)
- **Save Functionality**: Manual save with visual indicators for unsaved changes
- **Drag & Drop**: Reorder positions with immediate database updates
- **Rich Text Editing**: Edit position descriptions with PlateJS editor

### Save System
The quote detail component implements a comprehensive save system with complete UI flow management. For detailed documentation, see [Quotes Save System & UI Flow](quotes-save-system-ui-flow.md).

**Key Features:**
1. **Manual Save**: Changes are only saved when the "Speichern" button is clicked
2. **Batch Save**: All modified positions are saved in a single API call
3. **Visual Indicators**: 
   - Orange ring around save button when there are unsaved changes
   - Orange dots next to field labels for modified positions
   - Save button shows "Speichern*" when changes are pending
4. **Error Handling**: Failed saves keep changes and allow retry
5. **Change Tracking**: Only modified positions are included in save operations
6. **Fresh Data Access**: Direct tree data access prevents stale reference issues

### API Endpoints

#### Quote Positions
- `GET /api/quotes/versions/[versionId]/positions` - Get positions for a version
- `PUT /api/quotes/versions/[versionId]/positions/[positionId]` - Update single position
- `PUT /api/quotes/versions/[versionId]/positions/batch` - Update multiple positions
- `PUT /api/quotes/versions/[versionId]/positions/reorder` - Reorder positions

### Database Functions
- `updateQuotePosition()` - Update individual position
- `updateQuotePositions()` - Batch update multiple positions
- `updateQuotePositionsOrder()` - Update position order and hierarchy

### Components

#### Core Components
- **`QuoteDetail`**: Main quote management interface with save functionality
- **`InteractiveSplitPanel`**: Tree view with position editing and fresh data access
- **`OfferPositionText`**: Text position editor with change tracking
- **`OfferPositionArticle`**: Article position editor with change tracking

#### Save Lifecycle
1. **User makes changes** → `addChange()` stores in change tracking
2. **Visual indicators appear** → Orange dots and ring around save button
3. **User clicks save** → `handleSaveChanges()` in `QuoteDetail`
4. **API call** → `saveQuotePositions()` sends batch update
5. **Tree data updates** → `setTreeData()` with saved values
6. **UI refreshes** → Components re-render with fresh data
7. **Changes cleared** → `clearAllChanges()` resets tracking

#### RTE Data Flow
1. **Component renders** → `renderFormContent()` calls `findNodeById(treeData, selectedNodeId)`
2. **Fresh data retrieved** → Gets latest node data from `treeData`
3. **Updated node created** → `updatedSelectedNode` with fresh data
4. **Position components receive** → Current values from `getCurrentDescription()`
5. **RTE displays** → Saved content immediately without revert

## Development

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database

### Setup
1. Install dependencies: `pnpm install`
2. Set up environment variables
3. Run database migrations: `pnpm db:migrate`
4. Start development server: `pnpm dev`

### Key Technologies
- Next.js 15
- TypeScript
- TailwindCSS
- Drizzle ORM
- PlateJS (Rich Text Editor)
- React Arborist (Tree Component) 