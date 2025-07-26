import { NextRequest, NextResponse } from 'next/server';
import { getSalesOpportunitiesList, createSalesOpportunity } from '@/lib/db/sales-opportunities';

export async function GET() {
  try {
    const salesOpportunities = await getSalesOpportunitiesList();
    return NextResponse.json(salesOpportunities);
  } catch (error) {
    console.error('Error fetching sales opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      crmId,
      clientId,
      contactPersonId,
      orderInventorySpecification,
      status = 'open',
      businessArea,
      salesRepresentative,
      keyword,
      quoteVolume,
    } = body;

    if (!clientId || !keyword) {
      return NextResponse.json(
        { error: 'Client ID and keyword are required' },
        { status: 400 }
      );
    }

    const newSalesOpportunity = await createSalesOpportunity({
      crmId,
      clientId,
      contactPersonId,
      orderInventorySpecification,
      status,
      businessArea,
      salesRepresentative,
      keyword,
      quoteVolume,
      deleted: false,
      blocked: null,
      blockedBy: null,
    });

    return NextResponse.json(newSalesOpportunity);
  } catch (error) {
    console.error('Error creating sales opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create sales opportunity' },
      { status: 500 }
    );
  }
} 