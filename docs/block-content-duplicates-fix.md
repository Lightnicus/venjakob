# Block Content Duplicate Languages Fix

## Problem Description

The "Sprachen" (Languages) column in the BlockListTable was showing duplicate language entries (e.g., "Deutsch, Deutsch, Deutsch, Französisch, Französisch, Französisch") due to multiple `blockContent` database entries for the same block and language combination.

## Root Cause

1. **Soft Delete Logic Bug**: The `auditedBlockContentOperations.replaceAll()` function was selecting ALL existing content (including soft-deleted records) instead of only non-deleted content. This caused the function to soft-delete already soft-deleted records and then insert new ones, potentially creating multiple active records for the same block-language combination.

2. **Database Constraint Issues**: Initially attempted to add a unique constraint to prevent duplicates, but this caused issues with soft-delete operations. The constraint `UNIQUE("block_id","language_id","deleted")` prevented multiple soft-deleted records from coexisting, which is necessary for proper audit trail functionality.

3. **Display Logic**: The `getLanguagesForBlock` function in `BlockListTable` was simply returning `block.languages` without deduplication.

## Solution Implemented

### 1. Application Logic Fix

**Backend**: `lib/db/audit.ts`
- Fixed `auditedBlockContentOperations.replaceAll()` to only select non-deleted content before soft-deleting
- This prevents the creation of duplicate active records during content replacement

### 2. Database Schema Approach

**Initial Attempt**: Added unique constraint `UNIQUE("block_id","language_id","deleted")` via migration `0037_naive_jack_power.sql`
- **Problem**: This constraint prevented multiple soft-deleted records from coexisting, causing constraint violations during soft-delete operations
- **Solution**: Removed the constraint via migration `0038_marvelous_red_ghost.sql` and rely on application logic instead

**Final Approach**: No database constraint - rely on application logic for duplicate prevention
- This allows proper soft-delete functionality without constraint violations
- Multiple soft-deleted records can coexist for audit trail purposes

### 3. Application Logic Fix

**Backend**: `lib/db/blocks.ts`
- Updated `getBlockList()` function to deduplicate languages using `Set` before creating the display string
- This ensures the display is correct even if duplicates exist in the database

**Frontend**: `project_components/block-list-table.tsx`
- The `getLanguagesForBlock` function now receives properly deduplicated data from the backend

### 4. Data Cleanup

**Manual SQL**: Executed cleanup SQL to remove existing duplicate entries
- Kept only the most recent entry for each block-language combination
- Maintained audit trail by preserving soft-deleted records

## Implementation Steps

1. **Clean Up Existing Duplicates** (if needed):
   ```sql
   DELETE FROM block_content 
   WHERE id NOT IN (
     SELECT DISTINCT ON (block_id, language_id) id 
     FROM block_content 
     WHERE deleted = false 
     ORDER BY block_id, language_id, updated_at DESC
   );
   ```

2. **Apply Schema Changes**:
   ```bash
   pnpm run db:generate
   pnpm run db:push
   ```

3. **Verify Fix**:
   - Check that the "Sprachen" column shows unique language entries
   - Verify that new block content saves work correctly
   - Test that soft-delete operations work without constraint violations

## Prevention

- **Application Logic**: The fixed `replaceAll` function prevents duplicate active records by only selecting non-deleted content before soft-deleting
- **Display Logic**: Backend deduplication ensures correct display even if duplicates exist
- **Audit Trail**: Multiple soft-deleted records can coexist for proper audit trail functionality
- **Regular Monitoring**: Monitor the `blockContent` table to identify any remaining issues

## Related Files

- `lib/db/audit.ts` (auditedBlockContentOperations.replaceAll function)
- `lib/db/migrations/0037_naive_jack_power.sql` (initial constraint attempt)
- `lib/db/migrations/0038_marvelous_red_ghost.sql` (constraint removal)
- `lib/db/schema.ts` (blockContent table definition)
- `lib/db/blocks.ts` (getBlockList function)
- `project_components/block-list-table.tsx` (display logic)

## Key Learnings

1. **Soft Delete Complexity**: Unique constraints with soft-delete systems require careful consideration. Including the `deleted` field in constraints can prevent proper audit trail functionality.

2. **Application vs Database Logic**: Sometimes application-level logic is more appropriate than database constraints, especially when dealing with complex soft-delete scenarios.

3. **Drizzle Migration Workflow**: The proper workflow is:
   - Make schema changes in `lib/db/schema.ts`
   - Run `pnpm run db:generate` to create migration files
   - Run `pnpm run db:push` to apply changes (for development)

4. **Constraint Design**: When designing unique constraints for tables with soft-delete functionality, consider whether multiple soft-deleted records should be allowed to coexist for audit purposes.
