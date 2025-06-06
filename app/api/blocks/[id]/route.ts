import { NextRequest, NextResponse } from 'next/server';
import { saveBlockProperties, deleteBlock, saveBlockContent } from '@/lib/db/blocks';

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
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    );
  }
} 