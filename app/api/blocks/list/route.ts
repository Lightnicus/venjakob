import { NextResponse } from 'next/server';
import { getBlockList } from '@/lib/db/blocks';

export async function GET() {
  try {
    const blocks = await getBlockList();
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching block list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch block list' },
      { status: 500 }
    );
  }
} 