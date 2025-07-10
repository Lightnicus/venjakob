'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User as DbUser, Permission } from '@/lib/db/schema';

// Extended user type that includes permissions
export type UserWithPermissions = DbUser & {
  permissions: Permission[];
};

// Cache configuration for database user (existing - keep unchanged)
const CACHE_KEY = 'venjakob_user_data';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// New cache configuration for auth user (5 second cache)
const AUTH_CACHE_KEY = 'venjakob_auth_user';
const AUTH_CACHE_EXPIRY_MS = 5 * 1000; // 5 seconds
const AUTH_LOADING_FLAG_KEY = 'venjakob_auth_loading';

interface CachedUserData {
  data: UserWithPermissions;
  timestamp: number;
  userId: string; // To ensure cache belongs to current user
}

interface CachedAuthData {
  data: AuthUser | null;
  timestamp: number;
  userId?: string; // For cache validation
}

interface AuthLoadingFlag {
  isLoading: boolean;
  timestamp: number;
  userId?: string;
}

export const useUser = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false); // Use ref instead of state to prevent re-renders
  const authDebounceRef = useRef<NodeJS.Timeout | null>(null); // For debouncing auth calls

  // Helper functions for database user cache management (existing - unchanged)
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

  const setCachedUser = (
    userData: UserWithPermissions,
    userId: string,
  ): void => {
    try {
      const cacheData: CachedUserData = {
        data: userData,
        timestamp: Date.now(),
        userId,
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

  // New helper functions for auth user cache management
  const getCachedAuthUser = (userId?: string): AuthUser | null => {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return null;

      const cachedData: CachedAuthData = JSON.parse(cached);

      // Check if cache is for the current user and not expired
      if (
        (!userId || cachedData.userId === userId) &&
        Date.now() - cachedData.timestamp < AUTH_CACHE_EXPIRY_MS
      ) {
        return cachedData.data;
      }

      // Cache is stale or for different user, remove it
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading auth cache:', error);
      // Clean up corrupted cache
      try {
        localStorage.removeItem(AUTH_CACHE_KEY);
      } catch {}
      return null;
    }
  };

  const setCachedAuthUser = (
    userData: AuthUser | null,
    userId?: string,
  ): void => {
    try {
      const cacheData: CachedAuthData = {
        data: userData,
        timestamp: Date.now(),
        userId,
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving auth cache:', error);
      // localStorage might be full or disabled, continue without caching
    }
  };

  const clearAuthCache = (): void => {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  };

  // Auth loading flag management
  const getAuthLoadingFlag = (): AuthLoadingFlag | null => {
    try {
      const flag = localStorage.getItem(AUTH_LOADING_FLAG_KEY);
      if (!flag) return null;

      const flagData: AuthLoadingFlag = JSON.parse(flag);

      // Check if flag is stale (older than 15 seconds)
      if (Date.now() - flagData.timestamp > 15000) {
        localStorage.removeItem(AUTH_LOADING_FLAG_KEY);
        return null;
      }

      return flagData;
    } catch (error) {
      console.error('Error reading auth loading flag:', error);
      try {
        localStorage.removeItem(AUTH_LOADING_FLAG_KEY);
      } catch {}
      return null;
    }
  };

  const setAuthLoadingFlag = (isLoading: boolean, userId?: string): void => {
    try {
      if (isLoading) {
        const flagData: AuthLoadingFlag = {
          isLoading: true,
          timestamp: Date.now(),
          userId,
        };
        localStorage.setItem(AUTH_LOADING_FLAG_KEY, JSON.stringify(flagData));
      } else {
        localStorage.removeItem(AUTH_LOADING_FLAG_KEY);
      }
    } catch (error) {
      console.error('Error setting auth loading flag:', error);
    }
  };

  const clearAuthLoadingFlag = (): void => {
    try {
      localStorage.removeItem(AUTH_LOADING_FLAG_KEY);
    } catch (error) {
      console.error('Error clearing auth loading flag:', error);
    }
  };

  // New cached auth user function with debouncing
  const getCachedOrFreshAuthUser = useCallback(
    async (bypassCache: boolean = false): Promise<AuthUser | null> => {
      return new Promise(resolve => {
        // Clear existing debounce timer
        if (authDebounceRef.current) {
          clearTimeout(authDebounceRef.current);
        }

        // Set debounce timer
        authDebounceRef.current = setTimeout(async () => {
          const supabase = createClient();

          // Check cache first (unless bypassing)
          if (!bypassCache) {
            const cachedAuth = getCachedAuthUser();
            if (cachedAuth !== null) {
              resolve(cachedAuth);
              return;
            }
          }

          // Helper function to make the actual network call
          const makeNetworkCall = async () => {
            // Set loading flag
            setAuthLoadingFlag(true);

            try {
              // Make network call
              const {
                data: { user },
                error,
              } = await supabase.auth.getUser();

              if (error) {
                // Handle auth session missing error gracefully
                if (
                  error.message?.includes('Auth session missing') ||
                  error.name === 'AuthSessionMissingError'
                ) {
                  // This is expected when user is not logged in
                  setCachedAuthUser(null);
                  clearAuthLoadingFlag();
                  resolve(null);
                } else {
                  console.error('Error getting auth user:', error);
                  setCachedAuthUser(null);
                  clearAuthLoadingFlag();
                  resolve(null);
                }
              } else {
                // Cache the result
                setCachedAuthUser(user, user?.id);
                clearAuthLoadingFlag();
                resolve(user);
              }
            } catch (error: any) {
              // Handle AuthSessionMissingError and other auth errors gracefully
              if (
                error.message?.includes('Auth session missing') ||
                error.name === 'AuthSessionMissingError'
              ) {
                // This is expected when user is not logged in - don't log as error
                setCachedAuthUser(null);
                clearAuthLoadingFlag();
                resolve(null);
              } else {
                console.error('Error getting user:', error);
                setCachedAuthUser(null);
                clearAuthLoadingFlag();
                resolve(null);
              }
            }
          };

          // Check if another call is in progress
          const loadingFlag = getAuthLoadingFlag();
          if (loadingFlag?.isLoading) {
            // Another request is in progress, poll until it completes
            let attempts = 0;
            const maxAttempts = 10; // Max 2 seconds of polling (10 * 200ms)

            const pollForResult = () => {
              attempts++;
              const currentFlag = getAuthLoadingFlag();

              if (!currentFlag?.isLoading) {
                // Loading completed, get the fresh cached result
                const cachedAuth = getCachedAuthUser();
                resolve(cachedAuth);
              } else if (attempts >= maxAttempts) {
                // Polling timeout, the other request might be stuck
                // Clear the potentially stuck flag and make our own request
                clearAuthLoadingFlag();
                makeNetworkCall();
              } else {
                // Still loading, check again in 200ms
                setTimeout(pollForResult, 200);
              }
            };

            // Start polling after 200ms
            setTimeout(pollForResult, 200);
            return;
          }

          // Make network call using helper function
          makeNetworkCall();
        }, 300); // 300ms debounce delay
      });
    },
    [],
  );

  const fetchDbUser = useCallback(
    async (
      useCache: boolean = true,
      userParam?: AuthUser | null,
    ): Promise<void> => {
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
    },
    [],
  ); // Remove authUser dependency to break the circular dependency

  useEffect(() => {
    const getUser = async () => {
      try {
        // Use cached auth user function instead of direct supabase call
        const user = await getCachedOrFreshAuthUser();

        setAuthUser(user);

        // If we have an auth user, fetch the database user
        if (user) {
          await fetchDbUser(true, user); // Use cache on initial load, pass user directly
        } else {
          setDbUser(null);
          clearUserCache();
          clearAuthCache(); // Clear auth cache when no user
        }
      } catch (error: any) {
        // Handle AuthSessionMissingError and other auth errors gracefully
        if (
          error.message?.includes('Auth session missing') ||
          error.name === 'AuthSessionMissingError'
        ) {
          // This is expected when user is not logged in - don't log as error
          setAuthUser(null);
          setDbUser(null);
          clearUserCache();
          clearAuthCache();
        } else {
          console.error('Error getting user:', error);
          setAuthUser(null);
          setDbUser(null);
          clearUserCache();
          clearAuthCache();
        }
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setAuthUser(newUser);

      // Clear cache when user changes or logs out
      if (!newUser || (authUser && newUser.id !== authUser?.id)) {
        clearUserCache();
        clearAuthCache();
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

    return () => {
      subscription.unsubscribe();
      // Clear debounce timer on cleanup
      if (authDebounceRef.current) {
        clearTimeout(authDebounceRef.current);
      }
    };
  }, []); // Remove fetchDbUser dependency to break the infinite loop

  // Method to force refresh user data (bypass cache)
  const refreshUser = useCallback(async (): Promise<void> => {
    if (authUser) {
      // Bypass both auth and db cache for refresh
      const freshAuthUser = await getCachedOrFreshAuthUser(true);
      setAuthUser(freshAuthUser);
      if (freshAuthUser) {
        await fetchDbUser(false, freshAuthUser); // Force API call, pass fresh auth user
      }
    }
  }, [authUser, fetchDbUser, getCachedOrFreshAuthUser]);

  return {
    user: authUser, // Keep backward compatibility
    authUser,
    dbUser,
    permissions: dbUser?.permissions || [], // Easy access to permissions
    hasPermission: useCallback(
      (permissionName?: string, resource?: string) => {
        if (!dbUser?.permissions) {
          return false;
        }

        // Admin users have access to everything
        const hasAdminPermission = dbUser.permissions.some(
          permission => permission.resource === 'admin',
        );

        if (hasAdminPermission) {
          return true;
        }

        // Check specific permissions
        const hasSpecificPermission = dbUser.permissions.some(
          permission =>
            (permissionName && permission.name === permissionName) ||
            (resource && permission.resource === resource),
        );

        return hasSpecificPermission;
      },
      [dbUser],
    ),
    refreshUser, // Method to force refresh
    loading,
  };
};
