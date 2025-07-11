import { NextRequest, NextResponse } from 'next/server';
import { getLatestVariantForQuote } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID ist erforderlich' }, { status: 400 });
    }

    const latestVariant = await getLatestVariantForQuote(id);
    
    if (!latestVariant) {
      return NextResponse.json({ error: 'Keine Variante gefunden' }, { status: 404 });
    }

    return NextResponse.json(latestVariant);
  } catch (error) {
    console.error('Error fetching latest variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der neuesten Variante' },
      { status: 500 }
    );
  }
} 