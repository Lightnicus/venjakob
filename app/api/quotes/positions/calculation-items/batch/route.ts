import { NextRequest, NextResponse } from 'next/server';
import { updatePositionCalculationItemsBatch, EditLockError } from '@/lib/db/quotes';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body as { updates: Array<{ positionId: string; items: Array<{ id: string; value: string }> }> };

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await updatePositionCalculationItemsBatch(updates);
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
    console.error('Error updating calc items batch:', error);
    return NextResponse.json({ error: 'Failed to update calc items batch' }, { status: 500 });
  }
}


