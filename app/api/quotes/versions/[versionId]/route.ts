import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quoteVersions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    if (!versionId) {
      return NextResponse.json({ error: 'Versions-ID ist erforderlich' }, { status: 400 });
    }

    // Ensure authenticated user (for audit/consistency)
    await requireAuth();

    await db
      .update(quoteVersions)
      .set({ deleted: true, updatedAt: sql`NOW()` })
      .where(eq(quoteVersions.id, versionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error soft deleting version:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Version' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getQuoteVersionById } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    
    if (!versionId) {
      return NextResponse.json({ error: 'Versions-ID ist erforderlich' }, { status: 400 });
    }

    const version = await getQuoteVersionById(versionId);
    
    if (!version) {
      return NextResponse.json({ error: 'Version nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Version' },
      { status: 500 }
    );
  }
} 