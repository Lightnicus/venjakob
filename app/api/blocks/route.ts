import { NextRequest, NextResponse } from 'next/server';
import { getBlocksWithContent, getBlocksWithContentByLanguage, createBlock } from '@/lib/db/blocks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const languageId = searchParams.get('languageId');
    
    let blocks;
    if (languageId) {
      blocks = await getBlocksWithContentByLanguage(languageId);
    } else {
      blocks = await getBlocksWithContent();
    }
    
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const newBlock = await createBlock();
    return NextResponse.json(newBlock);
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    );
  }
} 