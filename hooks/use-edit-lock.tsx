'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from './use-user';

export type LockableResource = 'articles' | 'blocks';

export interface LockInfo {
  isLocked: boolean;
  lockedBy: string | null;
  lockedByName: string | null;
  lockedAt: string | null;
  isLockedByCurrentUser: boolean;
}

export interface UseEditLockResult {
  lockInfo: LockInfo;
  isLoading: boolean;
  canEdit: boolean;
  lockResource: () => Promise<boolean>;
  unlockResource: () => Promise<boolean>;
  lockResourceOptimistic: () => Promise<boolean>;
  unlockResourceOptimistic: () => Promise<boolean>;
  refreshLockStatus: () => Promise<void>;
}

export const useEditLock = (
  resourceType: LockableResource,
  resourceId: string
): UseEditLockResult => {
  const { dbUser } = useUser();
  const [lockInfo, setLockInfo] = useState<LockInfo>({
    isLocked: false,
    lockedBy: null,
    lockedByName: null,
    lockedAt: null,
    isLockedByCurrentUser: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshLockStatus = useCallback(async () => {
    if (!resourceId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${resourceType}/${resourceId}/lock`);
      
      if (!response.ok) {
        console.error('Failed to fetch lock status');
        return;
      }
      
      const data = await response.json();
      
      setLockInfo({
        isLocked: data.isLocked,
        lockedBy: data.lockedBy,
        lockedByName: data.lockedByName,
        lockedAt: data.lockedAt,
        isLockedByCurrentUser: data.lockedBy === dbUser?.id,
      });
    } catch (error) {
      console.error('Error fetching lock status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, resourceId, dbUser?.id]);

  const lockResourceOptimistic = useCallback(async (): Promise<boolean> => {
    if (!resourceId || !dbUser?.id) return false;
    
    // Optimistic update
    setLockInfo(prev => ({
      ...prev,
      isLocked: true,
      lockedBy: dbUser.id,
      lockedByName: dbUser.name,
      lockedAt: new Date().toISOString(),
      isLockedByCurrentUser: true,
    }));
    
    try {
      const response = await fetch(`/api/${resourceType}/${resourceId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Confirm the optimistic update with fresh data
        await refreshLockStatus();
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to lock resource:', error.error);
        // Revert optimistic update
        await refreshLockStatus();
        return false;
      }
    } catch (error) {
      console.error('Error locking resource:', error);
      // Revert optimistic update
      await refreshLockStatus();
      return false;
    }
  }, [resourceType, resourceId, dbUser, refreshLockStatus]);

  const unlockResourceOptimistic = useCallback(async (): Promise<boolean> => {
    if (!resourceId || !dbUser?.id) return false;
    
    // Optimistic update
    setLockInfo(prev => ({
      ...prev,
      isLocked: false,
      lockedBy: null,
      lockedByName: null,
      lockedAt: null,
      isLockedByCurrentUser: false,
    }));
    
    try {
      const response = await fetch(`/api/${resourceType}/${resourceId}/lock`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Confirm the optimistic update with fresh data
        await refreshLockStatus();
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to unlock resource:', error.error);
        // Revert optimistic update
        await refreshLockStatus();
        return false;
      }
    } catch (error) {
      console.error('Error unlocking resource:', error);
      // Revert optimistic update
      await refreshLockStatus();
      return false;
    }
  }, [resourceType, resourceId, dbUser?.id, refreshLockStatus]);

  // Keep non-optimistic versions for when we need to wait for confirmation
  const lockResource = useCallback(async (): Promise<boolean> => {
    if (!resourceId || !dbUser?.id) return false;
    
    try {
      const response = await fetch(`/api/${resourceType}/${resourceId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await refreshLockStatus();
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to lock resource:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Error locking resource:', error);
      return false;
    }
  }, [resourceType, resourceId, dbUser?.id, refreshLockStatus]);

  const unlockResource = useCallback(async (): Promise<boolean> => {
    if (!resourceId || !dbUser?.id) return false;
    
    try {
      const response = await fetch(`/api/${resourceType}/${resourceId}/lock`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await refreshLockStatus();
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to unlock resource:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Error unlocking resource:', error);
      return false;
    }
  }, [resourceType, resourceId, dbUser?.id, refreshLockStatus]);

  // Load initial lock status
  useEffect(() => {
    if (resourceId && dbUser) {
      refreshLockStatus();
    }
  }, [resourceId, dbUser, refreshLockStatus]);

  const canEdit = !lockInfo.isLocked || lockInfo.isLockedByCurrentUser;

  return {
    lockInfo,
    isLoading,
    canEdit,
    lockResource,
    unlockResource,
    lockResourceOptimistic,
    unlockResourceOptimistic,
    refreshLockStatus,
  };
}; 