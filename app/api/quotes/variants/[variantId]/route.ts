import { NextRequest, NextResponse } from 'next/server';
import { getQuoteVariantById } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    
    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    const variant = await getQuoteVariantById(variantId);
    
    if (!variant) {
      return NextResponse.json({ error: 'Variante nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Variante' },
      { status: 500 }
    );
  }
} 