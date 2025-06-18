import { eq, notInArray } from 'drizzle-orm';
import { db } from './index';
import { users, type InsertUser, type User, languages, type InsertLanguage, type Language } from './schema';

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