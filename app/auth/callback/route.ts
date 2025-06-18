import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { upsertUser, cleanupOrphanedUsers } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sync user to local database after successful OAuth login
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!userError && user) {
          // Upsert current user to local database
          await upsertUser(user.id, user.email!, user.user_metadata?.name);

          // Get all users from Supabase Auth (admin operation)
          const { data: { users: allAuthUsers }, error: listError } = await supabase.auth.admin.listUsers();
          
          if (!listError && allAuthUsers) {
            // Extract user IDs that exist in Supabase Auth
            const validUserIds = allAuthUsers.map(authUser => authUser.id);
            
            // Clean up orphaned users in local database
            await cleanupOrphanedUsers(validUserIds);
          }
        }
      } catch (syncError) {
        console.error('Error syncing user to database:', syncError);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
} 