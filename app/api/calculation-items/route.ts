import { NextResponse } from 'next/server';
import { getCalculationItems } from '@/lib/db/articles';

export async function GET() {
  try {
    const calculationItems = await getCalculationItems();
    return NextResponse.json(calculationItems);
  } catch (error) {
    console.error('Error fetching calculation items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculation items' },
      { status: 500 }
    );
  }
} 