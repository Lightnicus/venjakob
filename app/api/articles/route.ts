import { NextRequest, NextResponse } from 'next/server';
import { getArticlesWithCalculationCounts } from '@/lib/db/articles-monitored';
import { createNewArticle } from '@/lib/db/articles';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored GET handler
export const GET = withPerformanceMonitoring(
  async () => {
    try {
      const articles = await getArticlesWithCalculationCounts();
      return NextResponse.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }
  },
  '/api/articles',
  'GET'
);

// Monitored POST handler
export const POST = withPerformanceMonitoring(
  async (request: NextRequest) => {
    try {
      const articleData = await request.json();
      const newArticle = await createNewArticle(articleData);
      return NextResponse.json(newArticle);
    } catch (error) {
      console.error('Error creating article:', error);
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      );
    }
  },
  '/api/articles',
  'POST'
); 