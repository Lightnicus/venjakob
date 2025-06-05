import { NextResponse } from 'next/server';
import { getLanguages } from '@/lib/db/blocks';

export async function GET() {
  try {
    const languages = await getLanguages();
    return NextResponse.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
} 