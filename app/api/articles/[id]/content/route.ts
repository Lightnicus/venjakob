import { NextRequest, NextResponse } from 'next/server';
import { saveArticleContent, EditLockError } from '@/lib/db/articles';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    
    await saveArticleContent(id, content);
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
    console.error('Error updating article content:', error);
    return NextResponse.json(
      { error: 'Failed to update article content' },
      { status: 500 }
    );
  }
} 