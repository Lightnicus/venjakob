import { NextRequest, NextResponse } from 'next/server';
import { getSalesOpportunityWithDetails, saveSalesOpportunity, deleteSalesOpportunity, EditLockError } from '@/lib/db/sales-opportunities';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const salesOpportunity = await getSalesOpportunityWithDetails(id);
    
    if (!salesOpportunity) {
      return NextResponse.json(
        { error: 'Sales opportunity not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(salesOpportunity);
  } catch (error) {
    console.error('Error fetching sales opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales opportunity' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    await saveSalesOpportunity(id, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          salesOpportunityId: error.salesOpportunityId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt
        },
        { status: 409 } // Conflict
      );
    }
    console.error('Error saving sales opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to save sales opportunity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await deleteSalesOpportunity(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          salesOpportunityId: error.salesOpportunityId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt
        },
        { status: 409 } // Conflict
      );
    }
    console.error('Error deleting sales opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete sales opportunity' },
      { status: 500 }
    );
  }
} 