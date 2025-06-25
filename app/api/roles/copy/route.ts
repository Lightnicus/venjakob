import { NextRequest, NextResponse } from 'next/server';
import { 
  createRole,
  getRolePermissions,
  assignPermissionToRole 
} from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const { originalRoleId, name, description } = await request.json();
    
    // Get original role permissions
    const originalPermissions = await getRolePermissions(originalRoleId);
    
    // Create new role
    const newRole = await createRole({
      name,
      description
    });

    // Copy permissions
    for (const permission of originalPermissions) {
      await assignPermissionToRole(newRole.id, permission.id);
    }

    const roleListItem = {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      permissionCount: originalPermissions.length,
      lastModified: newRole.createdAt
    };
    
    return NextResponse.json(roleListItem);
  } catch (error) {
    console.error('Error copying role:', error);
    return NextResponse.json(
      { error: 'Failed to copy role' },
      { status: 500 }
    );
  }
} 