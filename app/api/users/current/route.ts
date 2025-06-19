import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserByEmail, getUserPermissions } from '@/lib/db/queries';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      // Handle auth session missing error gracefully
      if (authError.message?.includes('Auth session missing') || authError.name === 'AuthSessionMissingError') {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      } else {
        console.error('Auth error:', authError);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    }
    
    if (!user) {
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

    // Fetch user permissions
    const permissions = await getUserPermissions(dbUser.id);

    // Return user data with permissions
    return NextResponse.json({
      ...dbUser,
      permissions,
    });
  } catch (error: any) {
    // Handle AuthSessionMissingError and other auth errors gracefully
    if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    } else {
      console.error('Error fetching current user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  }
} 