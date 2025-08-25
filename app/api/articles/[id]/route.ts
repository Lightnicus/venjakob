import { NextRequest, NextResponse } from 'next/server';
import { getArticleWithCalculations, saveArticle, deleteArticle, EditLockError } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored GET handler for individual article
export const GET = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const article = await getArticleWithCalculations(id);
      
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]',
  'GET'
);

// Monitored PUT handler for updating article
export const PUT = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const articleData = await request.json();
      
      await saveArticle(id, articleData);
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
      console.error('Error updating article:', error);
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]',
  'PUT'
);

// Monitored DELETE handler for deleting article
export const DELETE = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await deleteArticle(id);
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
      console.error('Error deleting article:', error);
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]',
  'DELETE'
); 