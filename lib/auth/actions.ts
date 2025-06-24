'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { upsertUser, cleanupOrphanedUsers } from '@/lib/db/queries';
import { getCurrentUser as getServerCurrentUser } from '@/lib/auth/server';
import { db } from '@/lib/db/index';
import { articles, blocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Create Supabase admin client for admin operations
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Server-side function to unlock all resources for the current user
async function unlockAllUserResources(): Promise<void> {
  try {
    const user = await getServerCurrentUser();
    
    if (!user) {
      return; // No user to unlock resources for
    }

    // Unlock all articles locked by this user
    await db
      .update(articles)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(articles.blockedBy, user.dbUser.id));

    // Unlock all blocks locked by this user
    await db
      .update(blocks)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(blocks.blockedBy, user.dbUser.id));
  } catch (error) {
    console.warn('Error unlocking user resources during logout:', error);
  }
}

export async function updateUserInSupabase(userId: string, userData: { email?: string; name?: string }) {
  try {
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - skipping Supabase user update');
      return null;
    }
    
    const adminClient = createAdminClient();
    
    // First, get the current user to preserve existing metadata
    const { data: currentUser, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Error fetching current user from Supabase:', getUserError);
      throw new Error(`Failed to fetch current user: ${getUserError.message}`);
    }
    
    // Update user in Supabase Auth
    const updateData: any = {};
    
    if (userData.email) {
      updateData.email = userData.email;
    }
    
    if (userData.name !== undefined) {
      // Preserve existing user metadata and update the name
      updateData.user_metadata = {
        ...currentUser.user.user_metadata,
        name: userData.name
      };
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      console.log('No updates needed for user:', userId);
      return null;
    }
    
    console.log('Updating user in Supabase with data:', { userId, updateData });
    
    const { data, error } = await adminClient.auth.admin.updateUserById(userId, updateData);
    
    if (error) {
      console.error('Error updating user in Supabase:', error);
      throw new Error(`Failed to update user in Supabase: ${error.message}`);
    }
    
    console.log('Successfully updated user in Supabase:', userId, data.user);
    return data;
  } catch (error) {
    console.error('Error in updateUserInSupabase:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // Handle auth session missing error gracefully
      if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
        return null; // This is expected when user is not logged in
      } else {
        console.error('Auth error in getCurrentUser:', error);
        return null;
      }
    }
    
    return user;
  } catch (error: any) {
    // Handle AuthSessionMissingError and other auth errors gracefully
    if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
      return null; // This is expected when user is not logged in
    } else {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }
}

async function syncUserToDatabase() {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Handle auth session missing error gracefully
      if (userError.message?.includes('Auth session missing') || userError.name === 'AuthSessionMissingError') {
        return; // This is expected when user is not logged in
      } else {
        console.error('Auth error in syncUserToDatabase:', userError);
        return;
      }
    }
    
    if (!user) {
      return;
    }

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
  } catch (error: any) {
    // Handle AuthSessionMissingError and other auth errors gracefully
    if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
      return; // This is expected when user is not logged in
    } else {
      console.error('Error syncing user to database:', error);
    }
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/?error=${encodeURIComponent('Ungültige E-Mail oder Passwort. Bitte versuchen Sie es erneut.')}`);
  }

  // Sync user to local database after successful login
  await syncUserToDatabase();

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  // Sync user to local database after successful signup
  await syncUserToDatabase();

  revalidatePath('/', 'layout');
  redirect('/portal');
}

export async function signOut() {
  // Unlock all resources locked by the current user before signing out
  await unlockAllUserResources();

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithProvider(provider: 'azure') {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
} 