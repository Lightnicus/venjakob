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