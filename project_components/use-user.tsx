'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User as DbUser } from '@/lib/db/schema';

export const useUser = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = async () => {
    try {
      const response = await fetch('/api/users/current');
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
      } else if (response.status === 404) {
        // User not found in database, this is okay
        setDbUser(null);
      } else {
        console.error('Error fetching database user:', response.statusText);
        setDbUser(null);
      }
    } catch (error) {
      console.error('Error fetching database user:', error);
      setDbUser(null);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting auth user:', error);
          setAuthUser(null);
          setDbUser(null);
        } else {
          setAuthUser(user);
          
          // If we have an auth user, fetch the database user
          if (user) {
            await fetchDbUser();
          } else {
            setDbUser(null);
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setAuthUser(null);
        setDbUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthUser(session?.user ?? null);
      
      // Fetch database user when auth state changes
      if (session?.user) {
        await fetchDbUser();
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    user: authUser, // Keep backward compatibility
    authUser,
    dbUser,
    loading 
  };
}; 