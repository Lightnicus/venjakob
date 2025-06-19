import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByEmail } from '@/lib/db/queries';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch database user record
    const dbUser = await getUserByEmail(user.email!);
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 