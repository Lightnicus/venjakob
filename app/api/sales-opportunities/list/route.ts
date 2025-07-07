import { NextResponse } from 'next/server';
import { getSalesOpportunitiesList } from '@/lib/db/sales-opportunities';

export async function GET() {
  try {
    const salesOpportunities = await getSalesOpportunitiesList();
    return NextResponse.json(salesOpportunities);
  } catch (error) {
    console.error('Error fetching sales opportunities list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales opportunities list' },
      { status: 500 }
    );
  }
} 