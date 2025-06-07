import { NextRequest, NextResponse } from 'next/server';
import { getArticlesWithCalculationCounts, createNewArticle } from '@/lib/db/articles';

export async function GET() {
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
}

export async function POST(request: NextRequest) {
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
} 