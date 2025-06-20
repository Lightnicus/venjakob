import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db/index';
import { blocks, users } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get the block with lock information
    const [result] = await db
      .select({
        id: blocks.id,
        blocked: blocks.blocked,
        blockedBy: blocks.blockedBy,
        blockedByName: users.name,
      })
      .from(blocks)
      .leftJoin(users, eq(blocks.blockedBy, users.id))
      .where(eq(blocks.id, id));
    
    if (!result) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    const isLocked = result.blocked !== null;
    
    return NextResponse.json({
      isLocked,
      lockedBy: result.blockedBy,
      lockedByName: result.blockedByName,
      lockedAt: result.blocked,
    });
  } catch (error) {
    console.error('Error fetching block lock status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lock status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if block exists and is not already locked by someone else
    const [block] = await db
      .select()
      .from(blocks)
      .where(eq(blocks.id, id));
    
    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    // Check if already locked by someone else
    if (block.blocked && block.blockedBy !== user.id) {
      const [blocker] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, block.blockedBy!));
      
      return NextResponse.json(
        { 
          error: 'Block is already being edited',
          lockedBy: block.blockedBy,
          lockedByName: blocker?.name,
        },
        { status: 409 }
      );
    }
    
    // Lock the block
    await db
      .update(blocks)
      .set({
        blocked: new Date(),
        blockedBy: user.id,
      })
      .where(eq(blocks.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error locking block:', error);
    return NextResponse.json(
      { error: 'Failed to lock block' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check if block exists and is locked by current user
    const [block] = await db
      .select()
      .from(blocks)
      .where(eq(blocks.id, id));
    
    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    
    // Only allow unlocking if the user locked it or it's not locked
    if (block.blockedBy && block.blockedBy !== user.id) {
      return NextResponse.json(
        { error: 'Can only unlock blocks you have locked' },
        { status: 403 }
      );
    }
    
    // Unlock the block
    await db
      .update(blocks)
      .set({
        blocked: null,
        blockedBy: null,
      })
      .where(eq(blocks.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlocking block:', error);
    return NextResponse.json(
      { error: 'Failed to unlock block' },
      { status: 500 }
    );
  }
} 