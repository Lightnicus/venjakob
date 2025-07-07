import { NextRequest, NextResponse } from 'next/server';
import { copyQuote } from '@/lib/db/quotes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalQuoteId } = body;
    
    if (!originalQuoteId) {
      return NextResponse.json(
        { error: 'Original quote ID is required' },
        { status: 400 }
      );
    }
    
    const copiedQuote = await copyQuote(originalQuoteId);
    return NextResponse.json(copiedQuote);
  } catch (error) {
    console.error('Error copying quote:', error);
    return NextResponse.json(
      { error: 'Failed to copy quote' },
      { status: 500 }
    );
  }
} 