import { NextRequest, NextResponse } from 'next/server';
import { updateQuotePositionsOrder } from '@/lib/db/quotes';

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
    
    // Validate position updates
    for (const position of positions) {
      if (!position.id || typeof position.positionNumber !== 'number') {
        return NextResponse.json(
          { error: 'Each position must have id and positionNumber' },
          { status: 400 }
        );
      }
    }
    
    await updateQuotePositionsOrder(versionId, positions);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering quote positions:', error);
    return NextResponse.json(
      { error: 'Failed to reorder quote positions' },
      { status: 500 }
    );
  }
} 