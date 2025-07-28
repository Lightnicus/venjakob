import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';
import type { PgColumn } from 'drizzle-orm/pg-core';

/**
 * Configuration for creating lock routes
 */
export interface LockRouteConfig {
  table: any; // The table object from schema
  columns: {
    id: PgColumn<any>;
    blocked: PgColumn<any>;
    blockedBy: PgColumn<any>;
  };
  entityName: string; // e.g., "article", "block", "quote version"
  notFoundMessage: string;
  lockErrorMessage: string;
  unlockErrorMessage: string;
}

/**
 * Creates standardized lock API routes (GET, POST, DELETE) for any lockable resource
 * Eliminates duplication across articles, blocks, quote-versions, etc.
 */
export function createLockRoutes(config: LockRouteConfig) {
  
  const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;

      // Get current user using DRY server-side utility
      const { dbUser } = await requireAuth();

      // Check if entity exists and get lock info using leftJoin for better query

      const [result] = await db
        .select({
          id: config.columns.id,
          blocked: config.columns.blocked,
          blockedBy: config.columns.blockedBy,
          blockedByName: users.name,
        })
        .from(config.table)
        .leftJoin(users, eq(config.columns.blockedBy, users.id))
        .where(eq(config.columns.id, id));

      if (!result) {
        return NextResponse.json({ error: config.notFoundMessage }, { status: 404 });
      }

      // Use explicit null check for better clarity (matching original implementation)
      const isLocked = result.blocked !== null;
      
      return NextResponse.json({
        isLocked,
        lockedBy: result.blockedBy,
        lockedByName: result.blockedByName,
        lockedAt: result.blocked,
      });
    } catch (error) {
      // Handle authentication errors (thrown by requireAuth)
      if (error instanceof Response) {
        return error;
      }

      console.error(`[LOCK-GET] Error fetching ${config.entityName} lock status:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch lock status' },
        { status: 500 },
      );
    }
  };

  const POST = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;
      const url = new URL(request.url);
      const force = url.searchParams.get('force') === 'true';
      
      // Get current user using DRY server-side utility
      const { dbUser } = await requireAuth();

      // Check if entity exists and is not already locked by someone else
      const [entity] = await db
        .select({
          id: config.columns.id,
          blocked: config.columns.blocked,
          blockedBy: config.columns.blockedBy,
        })
        .from(config.table)
        .where(eq(config.columns.id, id));

      if (!entity) {
        return NextResponse.json({ error: config.notFoundMessage }, { status: 404 });
      }

      // Check if already locked by someone else (only if not forcing)
      if (!force && entity.blocked && entity.blockedBy !== dbUser.id) {
        const [blocker] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, entity.blockedBy!));

        return NextResponse.json(
          {
            error: config.lockErrorMessage,
            lockedBy: entity.blockedBy,
            lockedByName: blocker?.name,
          },
          { status: 409 },
        );
      }

      // Lock the entity (this will override any existing lock if force=true)
      await db
        .update(config.table)
        .set({
          blocked: sql`NOW()`,
          blockedBy: dbUser.id,
        })
        .where(eq(config.columns.id, id));

      return NextResponse.json({ success: true });
    } catch (error) {
      // Handle authentication errors (thrown by requireAuth)
      if (error instanceof Response) {
        return error;
      }

      console.error(`[LOCK-POST] Error locking ${config.entityName}:`, error);
      return NextResponse.json(
        { error: `Failed to lock ${config.entityName}` },
        { status: 500 },
      );
    }
  };

  const DELETE = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;

      // Get current user using DRY server-side utility
      const { dbUser } = await requireAuth();

      // Check if entity exists
      const [entity] = await db
        .select({
          id: config.columns.id,
          blocked: config.columns.blocked,
          blockedBy: config.columns.blockedBy,
        })
        .from(config.table)
        .where(eq(config.columns.id, id));

      if (!entity) {
        return NextResponse.json({ error: config.notFoundMessage }, { status: 404 });
      }

      // Only allow unlocking if the user has the lock or if no lock exists
      if (entity.blocked && entity.blockedBy && entity.blockedBy !== dbUser.id) {
        return NextResponse.json(
          { error: config.unlockErrorMessage },
          { status: 403 },
        );
      }

      // Unlock the entity
      await db
        .update(config.table)
        .set({
          blocked: null,
          blockedBy: null,
        })
        .where(eq(config.columns.id, id));

      return NextResponse.json({ success: true });
    } catch (error) {
      // Handle authentication errors (thrown by requireAuth)
      if (error instanceof Response) {
        return error;
      }

      console.error(`[LOCK-DELETE] Error unlocking ${config.entityName}:`, error);
      return NextResponse.json(
        { error: `Failed to unlock ${config.entityName}` },
        { status: 500 },
      );
    }
  };

  return { GET, POST, DELETE };
}

/**
 * Predefined configurations for common lockable resources
 */
export const LOCK_ROUTE_CONFIGS = {
  articles: {
    entityName: 'article',
    notFoundMessage: 'Article not found',
    lockErrorMessage: 'Article is already being edited',
    unlockErrorMessage: 'Can only unlock articles you have locked',
  },
  blocks: {
    entityName: 'block',
    notFoundMessage: 'Block not found',
    lockErrorMessage: 'Block is already being edited',
    unlockErrorMessage: 'Can only unlock blocks you have locked',
  },
  quoteVersions: {
    entityName: 'quote version',
    notFoundMessage: 'Quote version not found',
    lockErrorMessage: 'Quote version is already being edited',
    unlockErrorMessage: 'Cannot unlock quote version locked by another user',
  },
  salesOpportunities: {
    entityName: 'sales opportunity',
    notFoundMessage: 'Sales opportunity not found',
    lockErrorMessage: 'Sales opportunity is already being edited',
    unlockErrorMessage: 'Can only unlock sales opportunities you have locked',
  },
} as const; 