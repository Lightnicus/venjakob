import { NextResponse } from 'next/server';
import { getArticleList } from '@/lib/db/articles';

export async function GET() {
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
} 