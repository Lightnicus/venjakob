import { NextResponse } from 'next/server';
import { getDefaultLanguage } from '@/lib/db/blocks-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async () => {
    try {
      const defaultLanguage = await getDefaultLanguage();
      if (!defaultLanguage) {
        return NextResponse.json(
          { error: 'No default language found' },
          { status: 404 }
        );
      }
      return NextResponse.json(defaultLanguage);
    } catch (error) {
      console.error('Error fetching default language:', error);
      return NextResponse.json(
        { error: 'Failed to fetch default language' },
        { status: 500 }
      );
    }
  },
  '/api/languages/default',
  'GET'
); 