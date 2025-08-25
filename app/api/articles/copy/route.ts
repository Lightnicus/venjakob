import { NextRequest, NextResponse } from 'next/server';
import { copyArticle } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored POST handler for copying article
export const POST = withPerformanceMonitoring(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { originalArticleId } = body;
      
      if (!originalArticleId) {
        return NextResponse.json(
          { error: 'Original article ID is required' },
          { status: 400 }
        );
      }
      
      const copiedArticle = await copyArticle(originalArticleId);
      return NextResponse.json(copiedArticle);
    } catch (error) {
      console.error('Error copying article:', error);
      return NextResponse.json(
        { error: 'Failed to copy article' },
        { status: 500 }
      );
    }
  },
  '/api/articles/copy',
  'POST'
); 