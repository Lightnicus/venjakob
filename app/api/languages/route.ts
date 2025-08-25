import { NextResponse } from 'next/server';
import { getLanguages } from '@/lib/db/blocks-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async () => {
    try {
      const languages = await getLanguages();
      return NextResponse.json(languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch languages' },
        { status: 500 }
      );
    }
  },
  '/api/languages',
  'GET'
); 