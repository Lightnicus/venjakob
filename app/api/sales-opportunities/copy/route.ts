import { NextRequest, NextResponse } from 'next/server';
import { copySalesOpportunity } from '@/lib/db/sales-opportunities';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalSalesOpportunityId } = body;
    
    if (!originalSalesOpportunityId) {
      return NextResponse.json(
        { error: 'Original sales opportunity ID is required' },
        { status: 400 }
      );
    }
    
    const copiedSalesOpportunity = await copySalesOpportunity(originalSalesOpportunityId);
    return NextResponse.json(copiedSalesOpportunity);
  } catch (error) {
    console.error('Error copying sales opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to copy sales opportunity' },
      { status: 500 }
    );
  }
} 