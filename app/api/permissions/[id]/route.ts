import { NextRequest, NextResponse } from 'next/server';
import { 
  updatePermission, 
  deletePermission, 
  getPermissionById 
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permission = await getPermissionById(id);
    
    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permission' },
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
    const { name, description, resource } = await request.json();
    
    const updatedPermission = await updatePermission(id, {
      name,
      description,
      resource
    });
    
    if (!updatedPermission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json(
      { error: 'Failed to update permission' },
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
    await deletePermission(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    );
  }
} 