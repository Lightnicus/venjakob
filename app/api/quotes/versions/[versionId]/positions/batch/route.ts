import { NextRequest, NextResponse } from 'next/server';
import { updateQuotePositions } from '@/lib/db/quotes';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    const body = await request.json();
    
    const { positions } = body;
    
    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Positions array is required' },
        { status: 400 }
      );
    }
    
    // Validate each position update
    for (const position of positions) {
      if (!position.id) {
        return NextResponse.json(
          { error: 'Each position must have an id' },
          { status: 400 }
        );
      }
    }
    
    await updateQuotePositions(positions);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quote positions batch:', error);
    return NextResponse.json(
      { error: 'Failed to update quote positions' },
      { status: 500 }
    );
  }
} 