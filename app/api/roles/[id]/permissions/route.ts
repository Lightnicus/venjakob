import { NextRequest, NextResponse } from 'next/server';
import { 
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole 
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permissions = await getRolePermissions(id);
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
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
    const { permissionIds } = await request.json();
    
    // Get current permissions for the role
    const currentPermissions = await getRolePermissions(id);
    const currentPermissionIds = currentPermissions.map(p => p.id);

    // Find permissions to add and remove
    const permissionsToAdd = permissionIds.filter((id: string) => !currentPermissionIds.includes(id));
    const permissionsToRemove = currentPermissionIds.filter(id => !permissionIds.includes(id));

    // Add new permissions
    for (const permissionId of permissionsToAdd) {
      await assignPermissionToRole(id, permissionId);
    }

    // Remove old permissions
    for (const permissionId of permissionsToRemove) {
      await removePermissionFromRole(id, permissionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update role permissions' },
      { status: 500 }
    );
  }
} 