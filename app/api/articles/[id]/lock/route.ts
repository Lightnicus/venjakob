import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNull, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/index';
import { articles, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get the article with lock information
    const [result] = await db
      .select({
        id: articles.id,
        blocked: articles.blocked,
        blockedBy: articles.blockedBy,
        blockedByName: users.name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.blockedBy, users.id))
      .where(eq(articles.id, id));

    if (!result) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const isLocked = result.blocked !== null;

    return NextResponse.json({
      isLocked,
      lockedBy: result.blockedBy,
      lockedByName: result.blockedByName,
      lockedAt: result.blocked,
    });
  } catch (error) {
    console.error('Error fetching article lock status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lock status' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Check if article exists and is not already locked by someone else
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if already locked by someone else (only if not forcing)
    if (!force && article.blocked && article.blockedBy !== dbUser.id) {
      const [blocker] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, article.blockedBy!));

      return NextResponse.json(
        {
          error: 'Article is already being edited',
          lockedBy: article.blockedBy,
          lockedByName: blocker?.name,
        },
        { status: 409 },
      );
    }

    // Lock the article (this will override any existing lock if force=true)
    await db
      .update(articles)
      .set({
        blocked: sql`NOW()`,
        blockedBy: dbUser.id,
      })
      .where(eq(articles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error locking article:', error);
    return NextResponse.json(
      { error: 'Failed to lock article' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Check if article exists and is locked by current user
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only allow unlocking if the user locked it or it's not locked
    if (article.blockedBy && article.blockedBy !== dbUser.id) {
      return NextResponse.json(
        { error: 'Can only unlock articles you have locked' },
        { status: 403 },
      );
    }

    // Unlock the article
    await db
      .update(articles)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(articles.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error unlocking article:', error);
    return NextResponse.json(
      { error: 'Failed to unlock article' },
      { status: 500 },
    );
  }
}
