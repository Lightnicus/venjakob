import { NextResponse } from 'next/server';
import { getDefaultLanguage } from '@/lib/db/blocks';

export async function GET() {
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
} 