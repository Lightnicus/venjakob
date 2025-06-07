import { NextRequest, NextResponse } from 'next/server';
import { saveArticleContent } from '@/lib/db/articles';

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
    console.error('Error updating article content:', error);
    return NextResponse.json(
      { error: 'Failed to update article content' },
      { status: 500 }
    );
  }
} 