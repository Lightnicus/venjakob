import { NextRequest, NextResponse } from 'next/server';
import { getQuoteVersionsByVariant } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;

    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    // Fetch non-deleted versions for variant, default sorted by versionNumber desc
    const versions = await getQuoteVersionsByVariant(variantId);

    // Map minimal fields used by the table
    const result = versions.map(v => ({
      id: v.id,
      versionNumber: v.versionNumber,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      totalPrice: v.totalPrice,
      isLatest: v.isLatest,
    }));

    // Ensure default sort by versionNumber desc (defensive; DB already sorts latest/created)
    result.sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching versions for variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Versionen' },
      { status: 500 }
    );
  }
}


