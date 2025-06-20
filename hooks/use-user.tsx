'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User as DbUser, Permission } from '@/lib/db/schema';

// Extended user type that includes permissions
export type UserWithPermissions = DbUser & {
  permissions: Permission[];
};

// Cache configuration
const CACHE_KEY = 'venjakob_user_data';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedUserData {
  data: UserWithPermissions;
  timestamp: number;
  userId: string; // To ensure cache belongs to current user
}

export const useUser = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false); // Use ref instead of state to prevent re-renders

  // Helper functions for cache management
  const getCachedUser = (userId: string): UserWithPermissions | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedUserData = JSON.parse(cached);
      
      // Check if cache is for the current user and not expired
      if (
        cachedData.userId === userId &&
        Date.now() - cachedData.timestamp < CACHE_EXPIRY_MS
      ) {
        return cachedData.data;
      }
      
      // Cache is stale or for different user, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading user cache:', error);
      // Clean up corrupted cache
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {}
      return null;
    }
  };

  const setCachedUser = (userData: UserWithPermissions, userId: string): void => {
    try {
      const cacheData: CachedUserData = {
        data: userData,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving user cache:', error);
      // localStorage might be full or disabled, continue without caching
    }
  };

  const clearUserCache = (): void => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing user cache:', error);
    }
  };

  const fetchDbUser = useCallback(async (useCache: boolean = true, userParam?: AuthUser | null): Promise<void> => {
    const targetUser = userParam;
    
    if (!targetUser?.id) {
      return;
    }

    // Prevent concurrent calls to the same endpoint
    if (fetchingRef.current) {
      return;
    }

    // Try to use cache first if requested
    if (useCache) {
      const cachedUser = getCachedUser(targetUser.id);
      if (cachedUser) {
        setDbUser(cachedUser);
        return;
      }
    }

    fetchingRef.current = true;
    
    try {
      const response = await fetch('/api/users/current');
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
        // Cache the fresh data
        setCachedUser(userData, targetUser.id);
      } else if (response.status === 404) {
        // User not found in database, this is okay
        setDbUser(null);
        // Clear any stale cache
        clearUserCache();
      } else {
        console.error('Error fetching database user:', response.statusText);
        setDbUser(null);
      }
    } catch (error) {
      console.error('Error fetching database user:', error);
      setDbUser(null);
    } finally {
      fetchingRef.current = false;
    }
  }, []); // Remove authUser dependency to break the circular dependency

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          // Handle auth session missing error gracefully
          if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
            // This is expected when user is not logged in
            setAuthUser(null);
            setDbUser(null);
            clearUserCache();
          } else {
            console.error('Error getting auth user:', error);
            setAuthUser(null);
            setDbUser(null);
            clearUserCache();
          }
        } else {
          setAuthUser(user);
          
          // If we have an auth user, fetch the database user
          if (user) {
            await fetchDbUser(true, user); // Use cache on initial load, pass user directly
          } else {
            setDbUser(null);
            clearUserCache();
          }
        }
      } catch (error: any) {
        // Handle AuthSessionMissingError and other auth errors gracefully
        if (error.message?.includes('Auth session missing') || error.name === 'AuthSessionMissingError') {
          // This is expected when user is not logged in - don't log as error
          setAuthUser(null);
          setDbUser(null);
          clearUserCache();
        } else {
          console.error('Error getting user:', error);
          setAuthUser(null);
          setDbUser(null);
          clearUserCache();
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setAuthUser(newUser);
      
      // Clear cache when user changes or logs out
      if (!newUser || newUser.id !== authUser?.id) {
        clearUserCache();
      }
      
      // Fetch database user when auth state changes
      if (newUser) {
        // On auth state change, bypass cache to get fresh data, pass user directly
        await fetchDbUser(event === 'SIGNED_IN' ? true : false, newUser);
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove fetchDbUser dependency to break the infinite loop

  // Method to force refresh user data (bypass cache)
  const refreshUser = useCallback(async (): Promise<void> => {
    if (authUser) {
      await fetchDbUser(false, authUser); // Force API call, pass current authUser
    }
  }, [authUser, fetchDbUser]);

  return { 
    user: authUser, // Keep backward compatibility
    authUser,
    dbUser,
    permissions: dbUser?.permissions || [], // Easy access to permissions
    hasPermission: useCallback((permissionName?: string, resource?: string) => {
      if (!dbUser?.permissions) {
        return false;
      }
      
      // Admin users have access to everything
      const hasAdminPermission = dbUser.permissions.some(permission => 
        permission.resource === 'admin'
      );
      
      if (hasAdminPermission) {
        return true;
      }
      
      // Check specific permissions
      const hasSpecificPermission = dbUser.permissions.some(permission => 
        (permissionName && permission.name === permissionName) ||
        (resource && permission.resource === resource)
      );
      
      return hasSpecificPermission;
    }, [dbUser]),
    refreshUser, // Method to force refresh
    loading 
  };
}; 