import { NextRequest, NextResponse } from 'next/server';
import { getAllPermissions, createPermission } from '@/lib/db/queries';

export async function GET() {
  try {
    const permissions = await getAllPermissions();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, resource } = await request.json();
    
    const newPermission = await createPermission({
      name,
      description,
      resource
    });
    
    return NextResponse.json(newPermission);
  } catch (error) {
    console.error('Error creating permission:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
} 