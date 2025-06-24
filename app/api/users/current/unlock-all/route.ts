import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db/index';
import { articles, blocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Unlock all articles locked by this user
    await db
      .update(articles)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(articles.blockedBy, dbUser.id));

    // Unlock all blocks locked by this user
    await db
      .update(blocks)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(blocks.blockedBy, dbUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }
    
    console.error('Error unlocking all user resources:', error);
    return NextResponse.json(
      { error: 'Failed to unlock resources' },
      { status: 500 }
    );
  }
} 