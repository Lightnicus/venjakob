import { NextRequest, NextResponse } from 'next/server';
import { getBlocksWithContent, createBlock } from '@/lib/db/blocks';

export async function GET() {
  try {
    const blocks = await getBlocksWithContent();
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