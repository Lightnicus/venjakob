import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/index';
import { quoteVersions } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Get quote version with all related data
    const [version] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!version) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error fetching quote version:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote version' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get current user using DRY server-side utility
    const { dbUser } = await requireAuth();

    // Check if quote version exists
    const [existingVersion] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!existingVersion) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    // Update quote version
    const [updatedVersion] = await db
      .update(quoteVersions)
      .set({
        ...body,
        modifiedBy: dbUser.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quoteVersions.id, id))
      .returning();

    return NextResponse.json(updatedVersion);
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error updating quote version:', error);
    return NextResponse.json(
      { error: 'Failed to update quote version' },
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
    const [existingVersion] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.id, id));

    if (!existingVersion) {
      return NextResponse.json({ error: 'Quote version not found' }, { status: 404 });
    }

    // Soft delete quote version
    const [deletedVersion] = await db
      .update(quoteVersions)
      .set({
        deleted: true,
        modifiedBy: dbUser.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quoteVersions.id, id))
      .returning();

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle authentication errors (thrown by requireAuth)
    if (error instanceof Response) {
      return error;
    }

    console.error('Error deleting quote version:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote version' },
      { status: 500 },
    );
  }
} 