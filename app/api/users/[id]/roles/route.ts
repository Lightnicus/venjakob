import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getAllRoles
} from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRoles = await getUserRoles(id);
    return NextResponse.json(userRoles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
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
    const { roleIds } = await request.json();
    
    // Get current user roles
    const currentRoles = await getUserRoles(id);
    const currentRoleIds = currentRoles.map(role => role.id);
    
    // Determine roles to add and remove
    const rolesToAdd = roleIds.filter((roleId: string) => !currentRoleIds.includes(roleId));
    const rolesToRemove = currentRoleIds.filter(roleId => !roleIds.includes(roleId));
    
    // Add new roles
    for (const roleId of rolesToAdd) {
      await assignRoleToUser(id, roleId);
    }
    
    // Remove old roles
    for (const roleId of rolesToRemove) {
      await removeRoleFromUser(id, roleId);
    }
    
    // Return updated roles
    const updatedRoles = await getUserRoles(id);
    return NextResponse.json(updatedRoles);
  } catch (error) {
    console.error('Error updating user roles:', error);
    return NextResponse.json(
      { error: 'Failed to update user roles' },
      { status: 500 }
    );
  }
} 