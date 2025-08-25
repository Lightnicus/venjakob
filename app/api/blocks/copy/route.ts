import { NextRequest, NextResponse } from 'next/server';
import { copyBlock } from '@/lib/db/blocks-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const POST = withPerformanceMonitoring(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { originalBlockId } = body;
      
      if (!originalBlockId) {
        return NextResponse.json(
          { error: 'Original block ID is required' },
          { status: 400 }
        );
      }
      
      const copiedBlock = await copyBlock(originalBlockId);
      return NextResponse.json(copiedBlock);
    } catch (error) {
      console.error('Error copying block:', error);
      return NextResponse.json(
        { error: 'Failed to copy block' },
        { status: 500 }
      );
    }
  },
  '/api/blocks/copy',
  'POST'
); 