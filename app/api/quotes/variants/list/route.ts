import { NextRequest, NextResponse } from 'next/server';
import { getVariantsList } from '@/lib/db/quotes';

export async function GET() {
  try {
    const variants = await getVariantsList();
    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants list' },
      { status: 500 }
    );
  }
} 