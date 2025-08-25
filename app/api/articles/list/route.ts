import { NextResponse } from 'next/server';
import { getArticleList } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored GET handler for article list
export const GET = withPerformanceMonitoring(
  async () => {
    try {
      const articles = await getArticleList();
      return NextResponse.json(articles);
    } catch (error) {
      console.error('Error fetching article list:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article list' },
        { status: 500 }
      );
    }
  },
  '/api/articles/list',
  'GET'
); 