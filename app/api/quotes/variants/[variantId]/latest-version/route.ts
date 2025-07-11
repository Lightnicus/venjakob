import { NextRequest, NextResponse } from 'next/server';
import { getLatestVersionForVariant } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    
    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    const latestVersion = await getLatestVersionForVariant(variantId);
    
    if (!latestVersion) {
      return NextResponse.json({ error: 'Keine Version gefunden' }, { status: 404 });
    }

    return NextResponse.json(latestVersion);
  } catch (error) {
    console.error('Error fetching latest version:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der neuesten Version' },
      { status: 500 }
    );
  }
} 