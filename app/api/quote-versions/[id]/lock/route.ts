import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/index';
import { quoteVersions, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Check if quote version exists and get lock info
    const [version] = await db
      .select({
        id: quoteVersions.id,
        blocked: quoteVersions.blocked,
        blockedBy: quoteVersions.blockedBy,
      })
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!version) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    // Get lock holder name if version is locked
    let lockedByName = null;
    if (version.blocked && version.blockedBy) {
      const [lockHolder] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, version.blockedBy));
      lockedByName = lockHolder?.name;
    }

    return NextResponse.json({
      isLocked: !!version.blocked,
      lockedBy: version.blockedBy,
      lockedByName,
      lockedAt: version.blocked,
    });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error fetching quote version lock status:', error);
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

    // Check if quote version exists and is not already locked by someone else
    const [version] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!version) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    // Check if already locked by someone else (only if not forcing)
    if (!force && version.blocked && version.blockedBy !== dbUser.id) {
      const [blocker] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, version.blockedBy!));

      return NextResponse.json(
        {
          error: 'Quote version is already being edited',
          lockedBy: version.blockedBy,
          lockedByName: blocker?.name,
        },
        { status: 409 },
      );
    }

    // Lock the quote version (this will override any existing lock if force=true)
    await db
      .update(quoteVersions)
      .set({
        blocked: sql`NOW()`,
        blockedBy: dbUser.id,
      })
      .where(eq(quoteVersions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error locking quote version:', error);
    return NextResponse.json(
      { error: 'Failed to lock quote version' },
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

    // Check if quote version exists
    const [version] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!version) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    // Only allow unlocking if the user has the lock or if no lock exists
    if (version.blocked && version.blockedBy && version.blockedBy !== dbUser.id) {
      return NextResponse.json(
        { error: 'Cannot unlock quote version locked by another user' },
        { status: 403 },
      );
    }

    // Unlock the quote version
    await db
      .update(quoteVersions)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(quoteVersions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error unlocking quote version:', error);
    return NextResponse.json(
      { error: 'Failed to unlock quote version' },
      { status: 500 },
    );
  }
} 