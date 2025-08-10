import { NextRequest, NextResponse } from 'next/server';
import { getPositionCalculationItems, updatePositionCalculationItems, EditLockError } from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params;
    if (!positionId) {
      return NextResponse.json({ error: 'Position ID is required' }, { status: 400 });
    }
    const items = await getPositionCalculationItems(positionId);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching calculation items:', error);
    return NextResponse.json({ error: 'Failed to fetch calculation items' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params;
    const body = await request.json();
    const { updates } = body as { updates: Array<{ id: string; value: string }> };
    if (!positionId || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await updatePositionCalculationItems(positionId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        {
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          resourceId: error.resourceId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt,
        },
        { status: 409 }
      );
    }
    console.error('Error updating calculation items:', error);
    return NextResponse.json({ error: 'Failed to update calculation items' }, { status: 500 });
  }
}


