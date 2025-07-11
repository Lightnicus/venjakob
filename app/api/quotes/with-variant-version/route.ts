import { NextRequest, NextResponse } from 'next/server';
import { createQuoteWithVariantAndVersion } from '@/lib/db/quotes';

export async function POST(request: NextRequest) {
  try {
    const quoteData = await request.json();
    const result = await createQuoteWithVariantAndVersion(quoteData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating quote with variant and version:', error);
    return NextResponse.json(
      { error: 'Failed to create quote with variant and version' },
      { status: 500 }
    );
  }
} 