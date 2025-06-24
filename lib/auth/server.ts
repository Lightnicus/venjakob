    import { createClient } from '@/lib/supabase/server';
import { getUserByEmail, getUserPermissions } from '@/lib/db/queries';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User as DbUser, Permission } from '@/lib/db/schema';

// Extended user type that includes permissions (matches client-side type)
export type UserWithPermissions = DbUser & {
  permissions: Permission[];
};

// Result type for getCurrentUser function
export type CurrentUserResult = {
  authUser: AuthUser;
  dbUser: UserWithPermissions;
  hasPermission: (permissionName?: string, resource?: string) => boolean;
} | null;

/**
 * Server-side equivalent of the useUser hook
 * Gets the current authenticated user with database info and permissions
 * 
 * @returns {Promise<CurrentUserResult>} User object with permissions and helper methods, or null if not authenticated
 * @throws {Error} For unexpected errors (auth errors return null)
 */
export const getCurrentUser = async (): Promise<CurrentUserResult> => {
  try {
    const supabase = await createClient();
    
    // Get current user from Supabase auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      // Handle auth session missing error gracefully
      if (authError.message?.includes('Auth session missing') || authError.name === 'AuthSessionMissingError') {
        return null;
      } else {
        console.error('Auth error in getCurrentUser:', authError);
        return null;
      }
    }
    
    if (!authUser) {
      return null;
    }

    // Fetch database user record
    const dbUser = await getUserByEmail(authUser.email!);
    
    if (!dbUser) {
      console.warn(`User ${authUser.email} not found in database`);
      return null;
    }

    // Fetch user permissions
    const permissions = await getUserPermissions(dbUser.id);

    // Create user object with permissions
    const userWithPermissions: UserWithPermissions = {
      ...dbUser,
      permissions,
    };

    // Helper function to check permissions (mirrors client-side logic)
    const hasPermission = (permissionName?: string, resource?: string): boolean => {
      if (!userWithPermissions.permissions) {
        return false;
      }
      
      // Admin users have access to everything
      const hasAdminPermission = userWithPermissions.permissions.some(permission => 
        permission.resource === 'admin'
      );
      
      if (hasAdminPermission) {
        return true;
      }
      
      // Check specific permissions
      const hasSpecificPermission = userWithPermissions.permissions.some(permission => 
        (permissionName && permission.name === permissionName) ||
        (resource && permission.resource === resource)
      );
      
      return hasSpecificPermission;
    };

    return {
      authUser,
      dbUser: userWithPermissions,
      hasPermission,
    };
  } catch (error: any) {
    // Handle AuthSessionMissingError and other auth errors gracefully
    if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
      return null;
    } else {
      console.error('Unexpected error in getCurrentUser:', error);
      throw error; // Re-throw unexpected errors
    }
  }
};

/**
 * Utility function to require authentication in API routes
 * Throws a 401 response if user is not authenticated
 * 
 * @returns {Promise<NonNullable<CurrentUserResult>>} Authenticated user object
 * @throws {Response} 401 Response if not authenticated
 */
export const requireAuth = async (): Promise<NonNullable<CurrentUserResult>> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return user;
};

/**
 * Utility function to require specific permission in API routes
 * Throws appropriate response if user doesn't have permission
 * 
 * @param permissionName - The permission name to check
 * @param resource - The resource to check permission for
 * @returns {Promise<NonNullable<CurrentUserResult>>} Authenticated user object with required permission
 * @throws {Response} 401 if not authenticated, 403 if no permission
 */
export const requirePermission = async (permissionName?: string, resource?: string): Promise<NonNullable<CurrentUserResult>> => {
  const user = await requireAuth();
  
  if (!user.hasPermission(permissionName, resource)) {
    throw new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return user;
}; 