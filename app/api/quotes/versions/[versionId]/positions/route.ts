import { NextRequest, NextResponse } from 'next/server';
import { getQuotePositionsByVersion, addQuotePositionWithHierarchy } from '@/lib/db/quotes';

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
    const { blockId, selectedNodeId } = body;

    console.log('API received:', { versionId, blockId, selectedNodeId });

    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID is required' },
        { status: 400 }
      );
    }

    const newPosition = await addQuotePositionWithHierarchy(versionId, blockId, selectedNodeId);
    
    console.log('API created position:', newPosition);
    
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error('Error creating quote position:', error);
    return NextResponse.json(
      { error: 'Failed to create quote position' },
      { status: 500 }
    );
  }
} 