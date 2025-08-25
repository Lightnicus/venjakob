import { NextRequest, NextResponse } from 'next/server';
import { getBlocksWithContent, getBlocksWithContentByLanguage, createBlock } from '@/lib/db/blocks-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async (request: NextRequest) => {
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
  },
  '/api/blocks',
  'GET'
);

export const POST = withPerformanceMonitoring(
  async () => {
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
  },
  '/api/blocks',
  'POST'
); 