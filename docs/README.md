# Venjakob Project Documentation

## Overview
This is a Next.js 15 application for managing quotes, articles, blocks, and sales opportunities.

## Documentation Index

### Core Systems
- **[Database Setup](db.md)** - Complete guide to Supabase and Drizzle ORM setup, migrations, seeding, and database operations
- **[Authentication System](auth.md)** - Server-side authentication utilities with DRY patterns for API routes and permission management
- **[Component Patterns](component-patterns.md)** - Rich Text Editor (PlateJS) integration patterns, dual-component architecture, and best practices
- **[Helper Functions](helper-functions.md)** - Comprehensive documentation of all helper functions in the `@/helper` folder

### Dialog & UI Management
- **[Dialog Manager System](dialog-manager-docs.md)** - Comprehensive dialog workflow management with history tracking, smart back functionality, and data transfer
- **[Smart Dialog Flows](smart-dialog-flows.md)** - Advanced data-driven dialog sequences that adapt based on real-time data availability and user selections
- **[Edit Lock System](edit-lock-system.md)** - Multi-user editing prevention system with optimistic UI updates and automatic cleanup
- **[useEditLock Hook](use-edit-lock.md)** - Detailed documentation for the edit lock hook implementation and usage patterns
- **[DRY Improvements](dry-improvements.md)** - Comprehensive documentation of the DRY refactoring improvements to the edit lock system

### Data Management
- **[Quotes Save System](quotes-save-system-ui-flow.md)** - Comprehensive save system with batch operations, visual indicators, and change tracking
- **[Tab Reload System](reload-system-documentation.md)** - Cross-tab data synchronization system for triggering reloads between management and detail views
- **[Database Seeds](seeds.md)** - SQL and TypeScript seed files for initial data population with idempotent execution

## Key Features

### Quote Management
- **Quote Creation**: Create quotes with variants and versions
- **Variant Copying**: Copy variants with preserved tree structure and position order
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

### Edit Lock System
The system prevents multiple users from editing the same resources simultaneously. For detailed documentation, see [Edit Lock System](edit-lock-system.md).

**Supported Resource Types:**
- **Articles**: Lock at article level
- **Blocks**: Lock at block level  
- **Quote Versions**: Lock at quote version level (newly implemented)

**Key Features:**
- Optimistic UI updates for fast response times
- Automatic cleanup on component unmount
- Force override capability for authorized users
- Comprehensive error handling and user feedback
- Lock status display in management tables

**DRY Architecture:**
- **Generic Lock API Factory**: Single factory function generates lock routes for all resource types
- **Centralized Error Handling**: Unified `EditLockError` class for consistent error handling
- **Generic Lock Validation**: Reusable validation logic across all resource types
- **Consistent Database Schema**: All lockable resources use the same `blocked`/`blockedBy` pattern

**Quote Version Locks:**
- Locks are applied at the quote version level
- All position operations (create, update, reorder) check locks
- Quote detail component uses `EditLockButton` for lock management
- Quote list table shows lock status and disables actions for locked versions

### API Endpoints

#### Quote Positions
- `GET /api/quotes/versions/[versionId]/positions` - Get positions for a version
- `PUT /api/quotes/versions/[versionId]/positions/[positionId]` - Update single position
- `PUT /api/quotes/versions/[versionId]/positions/batch` - Update multiple positions
- `PUT /api/quotes/versions/[versionId]/positions/reorder` - Reorder positions

#### Quote Version Locks
- `GET /api/quote-versions/[id]/lock` - Check lock status
- `POST /api/quote-versions/[id]/lock` - Lock version (with force override support)
- `DELETE /api/quote-versions/[id]/lock` - Unlock version

#### Quote Variant Operations
- `DELETE /api/quotes/variants/[variantId]` - Soft delete variant and all associated data
- `POST /api/quotes/variants/[variantId]` - Copy variant with preserved tree structure

### Database Functions
- `updateQuotePosition()` - Update individual position
- `updateQuotePositions()` - Batch update multiple positions
- `updateQuotePositionsOrder()` - Update position order and hierarchy
- `checkQuoteVersionEditable()` - Validate quote version locks
- `softDeleteQuoteVariant()` - Soft delete variant and all associated data
- `copyQuoteVariant()` - Copy variant with preserved tree structure and position order

### Components

#### Core Components
- **`QuoteDetail`**: Main quote management interface with save functionality and lock management
- **`InteractiveSplitPanel`**: Tree view with position editing and fresh data access
- **`OfferPositionText`**: Text position editor with change tracking
- **`OfferPositionArticle`**: Article position editor with change tracking
- **`EditLockButton`**: Lock management component for quote versions
- **`QuotesListTable`**: Quote variants management table with reduced mode support - [Documentation](quotes-list-table.md)