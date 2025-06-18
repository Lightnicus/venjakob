import { eq, notInArray, and } from 'drizzle-orm';
import { db } from './index';
import { 
  users, type InsertUser, type User, 
  languages, type InsertLanguage, type Language,
  roles, type InsertRole, type Role,
  permissions, type InsertPermission, type Permission,
  userRoles, type InsertUserRole, type UserRole,
  rolePermissions, type InsertRolePermission, type RolePermission
} from './schema';

// User operations
export const createUser = async (userData: InsertUser): Promise<User> => {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const getAllUsers = async (): Promise<User[]> => {
  return await db.select().from(users);
};

export const updateUser = async (id: string, userData: Partial<InsertUser>): Promise<User | undefined> => {
  const [user] = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await db.delete(users).where(eq(users.id, id));
};

// Language operations
export const createLanguage = async (languageData: InsertLanguage): Promise<Language> => {
  const [language] = await db.insert(languages).values(languageData).returning();
  return language;
};

export const getLanguageById = async (id: string): Promise<Language | undefined> => {
  const [language] = await db.select().from(languages).where(eq(languages.id, id));
  return language;
};

export const getLanguageByValue = async (value: string): Promise<Language | undefined> => {
  const [language] = await db.select().from(languages).where(eq(languages.value, value));
  return language;
};

export const getAllLanguages = async (): Promise<Language[]> => {
  return await db.select().from(languages);
};

export const updateLanguage = async (id: string, languageData: Partial<InsertLanguage>): Promise<Language | undefined> => {
  const [language] = await db
    .update(languages)
    .set({ ...languageData, updatedAt: new Date() })
    .where(eq(languages.id, id))
    .returning();
  return language;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  await db.delete(languages).where(eq(languages.id, id));
};

// User synchronization operations
export const upsertUser = async (authUserId: string, email: string, name?: string): Promise<User> => {
  // Try to find existing user
  const existingUser = await getUserById(authUserId);
  
  if (existingUser) {
    // Update existing user if needed
    const updatedUser = await updateUser(authUserId, { 
      email, 
      name: name || existingUser.name 
    });
    return updatedUser!;
  } else {
    // Create new user
    const newUser = await createUser({ 
      id: authUserId,
      email, 
      name 
    });
    return newUser;
  }
};

export const cleanupOrphanedUsers = async (validUserIds: string[]): Promise<void> => {
  if (validUserIds.length === 0) {
    // If no valid users, don't delete anything to prevent accidental data loss
    return;
  }
  
  await db.delete(users).where(notInArray(users.id, validUserIds));
};

// Role operations
export const createRole = async (roleData: InsertRole): Promise<Role> => {
  const [role] = await db.insert(roles).values(roleData).returning();
  return role;
};

export const getRoleById = async (id: string): Promise<Role | undefined> => {
  const [role] = await db.select().from(roles).where(eq(roles.id, id));
  return role;
};

export const getRoleByName = async (name: string): Promise<Role | undefined> => {
  const [role] = await db.select().from(roles).where(eq(roles.name, name));
  return role;
};

export const getAllRoles = async (): Promise<Role[]> => {
  return await db.select().from(roles);
};

export const updateRole = async (id: string, roleData: Partial<InsertRole>): Promise<Role | undefined> => {
  const [role] = await db
    .update(roles)
    .set({ ...roleData, updatedAt: new Date() })
    .where(eq(roles.id, id))
    .returning();
  return role;
};

export const deleteRole = async (id: string): Promise<void> => {
  await db.delete(roles).where(eq(roles.id, id));
};

// Permission operations
export const createPermission = async (permissionData: InsertPermission): Promise<Permission> => {
  const [permission] = await db.insert(permissions).values(permissionData).returning();
  return permission;
};

export const getPermissionById = async (id: string): Promise<Permission | undefined> => {
  const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
  return permission;
};

export const getPermissionByName = async (name: string): Promise<Permission | undefined> => {
  const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
  return permission;
};

export const getAllPermissions = async (): Promise<Permission[]> => {
  return await db.select().from(permissions);
};

export const getPermissionsByResource = async (resource: string): Promise<Permission[]> => {
  return await db.select().from(permissions).where(eq(permissions.resource, resource));
};

export const updatePermission = async (id: string, permissionData: Partial<InsertPermission>): Promise<Permission | undefined> => {
  const [permission] = await db
    .update(permissions)
    .set({ ...permissionData, updatedAt: new Date() })
    .where(eq(permissions.id, id))
    .returning();
  return permission;
};

export const deletePermission = async (id: string): Promise<void> => {
  await db.delete(permissions).where(eq(permissions.id, id));
};

// User Role operations
export const assignRoleToUser = async (userId: string, roleId: string): Promise<UserRole> => {
  const [userRole] = await db.insert(userRoles).values({ userId, roleId }).returning();
  return userRole;
};

export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
};

export const getUserRoles = async (userId: string): Promise<Role[]> => {
  const result = await db
    .select({ role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  
  return result.map(r => r.role);
};

export const getUsersWithRole = async (roleId: string): Promise<User[]> => {
  const result = await db
    .select({ user: users })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .where(eq(userRoles.roleId, roleId));
  
  return result.map(r => r.user);
};

// Role Permission operations
export const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<RolePermission> => {
  const [rolePermission] = await db.insert(rolePermissions).values({ roleId, permissionId }).returning();
  return rolePermission;
};

export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
  await db.delete(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
};

export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
  const result = await db
    .select({ permission: permissions })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));
  
  return result.map(r => r.permission);
};

export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  const result = await db
    .select({ permission: permissions })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));
  
  return result.map(r => r.permission);
};

export const checkUserPermission = async (userId: string, resource: string, action: string): Promise<boolean> => {
  const result = await db
    .select({ count: permissions.id })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(userRoles.userId, userId),
        eq(permissions.resource, resource),
        eq(permissions.action, action)
      )
    );
  
  return result.length > 0;
}; 