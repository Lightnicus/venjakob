import { eq } from 'drizzle-orm';
import { db } from './index';
import { users, type InsertUser, type User } from './schema';

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