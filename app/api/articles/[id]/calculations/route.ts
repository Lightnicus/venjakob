import { NextRequest, NextResponse } from 'next/server';
import { saveArticleCalculations, EditLockError } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

// Monitored PUT handler for saving article calculations
export const PUT = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const { calculations } = await request.json();

      await saveArticleCalculations(id, calculations);

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
      console.error('Error saving article calculations:', error);
      return NextResponse.json(
        { error: 'Failed to save article calculations' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]/calculations',
  'PUT'
); 