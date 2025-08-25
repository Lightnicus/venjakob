import { NextRequest, NextResponse } from 'next/server';
import { saveArticleContent, EditLockError } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored PUT handler for saving article content
export const PUT = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { content } = await request.json();
      
      await saveArticleContent(id, content);
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof EditLockError) {
        return NextResponse.json(
          { 
            error: error.message,
            type: 'EDIT_LOCK_ERROR',
            resourceId: error.resourceId,
            lockedBy: error.lockedBy,
            lockedAt: error.lockedAt
          },
          { status: 409 } // Conflict
        );
      }
      console.error('Error updating article content:', error);
      return NextResponse.json(
        { error: 'Failed to update article content' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]/content',
  'PUT'
); 