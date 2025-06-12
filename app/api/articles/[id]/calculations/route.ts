import { NextRequest, NextResponse } from 'next/server';
import { saveArticleCalculations } from '@/lib/db/articles';

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
    console.error('Error saving article calculations:', error);
    return NextResponse.json(
      { error: 'Failed to save article calculations' },
      { status: 500 }
    );
  }
} 