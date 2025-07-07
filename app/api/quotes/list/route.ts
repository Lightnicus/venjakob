import { NextResponse } from 'next/server';
import { getQuotesList } from '@/lib/db/quotes';

export async function GET() {
  try {
    const quotes = await getQuotesList();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes list' },
      { status: 500 }
    );
  }
} 