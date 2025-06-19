import { NextRequest, NextResponse } from 'next/server';
import { 
  updateUser, 
  deleteUser, 
  getUserById 
} from '@/lib/db/queries';
import { updateUserInSupabase } from '@/lib/auth/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email } = await request.json();
    
    console.log('Updating user:', { id, name, email });
    
    // Update user in local database
    const updatedUser = await updateUser(id, {
      name,
      email
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User updated in local database:', updatedUser);

    // Also update user in Supabase Auth
    try {
      console.log('Attempting to sync user to Supabase...');
      const supabaseResult = await updateUserInSupabase(id, {
        email,
        name
      });
      
      if (supabaseResult) {
        console.log('User successfully synced to Supabase:', supabaseResult.user);
      } else {
        console.log('Supabase sync skipped (no service role key or no changes)');
      }
    } catch (supabaseError) {
      console.error('Failed to update user in Supabase:', supabaseError);
      // Note: We don't fail the entire operation if Supabase update fails
      // The local database is the source of truth, but we log the error
      
      // If you want to include this information in the response, you could add:
      // return NextResponse.json({ 
      //   ...updatedUser, 
      //   _supabaseSync: { success: false, error: supabaseError.message } 
      // });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 