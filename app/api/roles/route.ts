import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllRoles, 
  createRole, 
  getRolePermissions 
} from '@/lib/db/queries';

export async function GET() {
  try {
    const roles = await getAllRoles();
    
    // Transform roles data to include permission count
    const rolesWithPermissionCount = await Promise.all(
      roles.map(async (role) => {
        const rolePermissions = await getRolePermissions(role.id);
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissionCount: rolePermissions.length,
          lastModified: role.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json(rolesWithPermissionCount);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    const newRole = await createRole({
      name,
      description
    });
    
    const roleListItem = {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      permissionCount: 0,
      lastModified: newRole.createdAt.toISOString()
    };
    
    return NextResponse.json(roleListItem);
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
} 