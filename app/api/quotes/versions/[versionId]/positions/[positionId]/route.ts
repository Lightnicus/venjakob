import { NextRequest, NextResponse } from 'next/server';
import { updateQuotePosition } from '@/lib/db/quotes';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string; positionId: string }> }
) {
  try {
    const { positionId } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }
    
    // Extract allowed fields for update
    const {
      title,
      description,
      quantity,
      unitPrice,
      totalPrice,
      articleCost,
    } = body;
    
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (articleCost !== undefined) updateData.articleCost = articleCost;
    
    await updateQuotePosition(positionId, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quote position:', error);
    return NextResponse.json(
      { error: 'Failed to update quote position' },
      { status: 500 }
    );
  }
} 