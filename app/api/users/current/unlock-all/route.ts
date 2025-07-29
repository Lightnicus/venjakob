import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db/index';
import { articles, blocks, quoteVersions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('[UNLOCK-ALL] Starting unlock-all process...');
    
    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();
    console.log('[UNLOCK-ALL] User authenticated:', { userId: dbUser.id, userName: dbUser.name });

    // Unlock all resources locked by this user
    const unlockPromises = [
    // Unlock all articles locked by this user
      db
      .update(articles)
      .set({
        blocked: null,
        blockedBy: null,
      })
        .where(eq(articles.blockedBy, dbUser.id)),

    // Unlock all blocks locked by this user
      db
      .update(blocks)
      .set({
        blocked: null,
        blockedBy: null,
      })
        .where(eq(blocks.blockedBy, dbUser.id)),

      // Unlock all quote versions locked by this user
      db
        .update(quoteVersions)
        .set({
          blocked: null,
          blockedBy: null,
        })
        .where(eq(quoteVersions.blockedBy, dbUser.id)),
    ];

    console.log('[UNLOCK-ALL] Executing unlock operations...');
    const results = await Promise.all(unlockPromises);
    console.log('[UNLOCK-ALL] Unlock operations completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'All locks cleared successfully',
      operationsCompleted: results.length 
    });
  } catch (error) {
    console.error('[UNLOCK-ALL] Error in unlock-all process:', error);
    
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      console.log('[UNLOCK-ALL] Authentication error occurred');
      return error;
    }
    
    console.error('[UNLOCK-ALL] Database error unlocking all user resources:', error);
    return NextResponse.json(
      { error: 'Failed to unlock resources', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 