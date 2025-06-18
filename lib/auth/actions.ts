'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { upsertUser, cleanupOrphanedUsers } from '@/lib/db/queries';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

async function syncUserToDatabase() {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
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
  } catch (error) {
    console.error('Error syncing user to database:', error);
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