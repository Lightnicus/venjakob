import { NextRequest, NextResponse } from 'next/server';
import { getQuotePositionsByVersion, addQuotePositionWithHierarchy, addQuotePositionWithHierarchyForArticle, EditLockError } from '@/lib/db/quotes';

export async function GET(request: NextRequest, { params }: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await params;
    const positions = await getQuotePositionsByVersion(versionId);
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching quote positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote positions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await params;
    const body = await request.json();
    const { blockId, articleId, selectedNodeId } = body;

    console.log('API received:', { versionId, blockId, articleId, selectedNodeId });

    // Validate that either blockId or articleId is provided, but not both
    if (!blockId && !articleId) {
      return NextResponse.json(
        { error: 'Either blockId or articleId is required' },
        { status: 400 }
      );
    }

    if (blockId && articleId) {
      return NextResponse.json(
        { error: 'Cannot provide both blockId and articleId' },
        { status: 400 }
      );
    }

    let newPosition;
    
    if (blockId) {
      // Add block position
      newPosition = await addQuotePositionWithHierarchy(versionId, blockId, selectedNodeId);
    } else if (articleId) {
      // Add article position
      newPosition = await addQuotePositionWithHierarchyForArticle(versionId, articleId, selectedNodeId);
    }
    
    console.log('API created position:', newPosition);
    
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          resourceId: error.resourceId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt
        },
        { status: 409 }
      );
    }
    console.error('Error creating quote position:', error);
    return NextResponse.json(
      { error: 'Failed to create quote position' },
      { status: 500 }
    );
  }
} 