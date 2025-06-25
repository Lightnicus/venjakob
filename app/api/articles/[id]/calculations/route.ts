import { NextRequest, NextResponse } from 'next/server';
import { saveArticleCalculations, EditLockError } from '@/lib/db/articles';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { calculations } = await request.json();

    await saveArticleCalculations(id, calculations);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          articleId: error.articleId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt
        },
        { status: 409 } // Conflict
      );
    }
    console.error('Error saving article calculations:', error);
    return NextResponse.json(
      { error: 'Failed to save article calculations' },
      { status: 500 }
    );
  }
} 