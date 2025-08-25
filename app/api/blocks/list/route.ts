import { NextResponse } from 'next/server';
import { getBlockList } from '@/lib/db/blocks-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async () => {
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
  },
  '/api/blocks/list',
  'GET'
); 