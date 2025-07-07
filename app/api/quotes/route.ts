import { NextRequest, NextResponse } from 'next/server';
import { getQuotesList, createNewQuote } from '@/lib/db/quotes';

export async function GET() {
  try {
    const quotes = await getQuotesList();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const quoteData = await request.json();
    const newQuote = await createNewQuote(quoteData);
    return NextResponse.json(newQuote);
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
} 