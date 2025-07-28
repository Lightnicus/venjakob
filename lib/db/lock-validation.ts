import { eq } from 'drizzle-orm';
import { db } from './index';
import { getCurrentUser } from '@/lib/auth/server';
import { EditLockError } from './edit-lock-error';
import type { PgColumn } from 'drizzle-orm/pg-core';

/**
 * Interface for lockable database entities
 */
export interface LockableEntity {
  id: string;
  blocked: string | null;
  blockedBy: string | null;
}

/**
 * Configuration for lock validation with column references
 */
export interface LockValidationConfig {
  table: any; // The table object from schema
  columns: {
    id: PgColumn<any>;
    blocked: PgColumn<any>;
    blockedBy: PgColumn<any>;
  };
  entityId: string;
  entityName: string; // e.g., "Artikel", "Block", "Quote Version"
  notFoundMessage: string; // e.g., "Artikel nicht gefunden"
  lockedMessage: string; // e.g., "Artikel wird bereits von einem anderen Benutzer bearbeitet"
}

/**
 * Generic function to check if a resource is editable by the current user
 * Replaces checkArticleEditable, checkBlockEditable, checkQuoteVersionEditable, etc.
 */
export async function checkResourceEditable(
  config: LockValidationConfig
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', config.entityId);
  }

  // Get entity with lock info
  const [entity] = await db
    .select({
      id: config.columns.id,
      blocked: config.columns.blocked,
      blockedBy: config.columns.blockedBy,
    })
    .from(config.table)
    .where(eq(config.columns.id, config.entityId));

  if (!entity) {
    throw new Error(config.notFoundMessage);
  }

  // Check if entity is locked by another user
  if (entity.blocked && entity.blockedBy && entity.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      config.lockedMessage,
      config.entityId,
      entity.blockedBy,
      entity.blocked
    );
  }
}

/**
 * Predefined configurations for common resources
 */
export const LOCK_CONFIGS = {
  articles: {
    entityName: 'Artikel',
    notFoundMessage: 'Artikel nicht gefunden',
    lockedMessage: 'Artikel wird bereits von einem anderen Benutzer bearbeitet',
  },
  blocks: {
    entityName: 'Block',
    notFoundMessage: 'Block nicht gefunden', 
    lockedMessage: 'Block wird bereits von einem anderen Benutzer bearbeitet',
  },
  quoteVersions: {
    entityName: 'Quote Version',
    notFoundMessage: 'Quote Version nicht gefunden',
    lockedMessage: 'Quote Version wird bereits von einem anderen Benutzer bearbeitet',
  },
  salesOpportunities: {
    entityName: 'Verkaufschance',
    notFoundMessage: 'Verkaufschance nicht gefunden',
    lockedMessage: 'Verkaufschance wird bereits von einem anderen Benutzer bearbeitet',
  },
} as const; 