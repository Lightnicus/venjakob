import { NextRequest, NextResponse } from 'next/server';
import { saveBlockProperties, deleteBlock, saveBlockContent, getBlockWithContent, EditLockError } from '@/lib/db/blocks';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const block = await getBlockWithContent(id);
    
    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(block);
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch block' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (body.type === 'properties') {
      await saveBlockProperties(id, body.data);
      return NextResponse.json({ success: true });
    } else if (body.type === 'content') {
      await saveBlockContent(id, body.data);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid update type' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          blockId: error.blockId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt?.toISOString()
        },
        { status: 409 } // Conflict
      );
    }
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteBlock(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EditLockError) {
      return NextResponse.json(
        { 
          error: error.message,
          type: 'EDIT_LOCK_ERROR',
          blockId: error.blockId,
          lockedBy: error.lockedBy,
          lockedAt: error.lockedAt?.toISOString()
        },
        { status: 409 } // Conflict
      );
    }
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
} 