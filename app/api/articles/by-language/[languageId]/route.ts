import { NextRequest, NextResponse } from 'next/server';
import { getArticlesByLanguage } from '@/lib/db/articles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ languageId: string }> }
) {
  try {
    const { languageId } = await params;
    
    if (!languageId) {
      return NextResponse.json(
        { error: 'Language ID is required' },
        { status: 400 }
      );
    }

    const articles = await getArticlesByLanguage(languageId);
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles by language:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles by language' },
      { status: 500 }
    );
  }
} 