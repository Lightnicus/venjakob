import { NextRequest, NextResponse } from 'next/server';
import { getQuotePositionsByVersion } from '@/lib/db/quotes';

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