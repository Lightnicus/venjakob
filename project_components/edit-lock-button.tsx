'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { useEditLock, type LockableResource } from '@/hooks/use-edit-lock';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';

interface EditLockButtonProps {
  resourceType: LockableResource;
  resourceId: string;
  isEditing: boolean;
  isSaving?: boolean;
  onToggleEdit: () => void;
  onSave: () => Promise<void>;
  onRefreshData?: () => Promise<void>; // Optional callback to refresh data from parent
  initialUpdatedAt?: string;
}

// Helper function to format the lock timestamp in German
const formatLockTime = (timestamp: string | null): string => {
  if (!timestamp) return '';

  // Ensure timestamp is treated as UTC if it doesn't have timezone info
  let normalizedTimestamp = timestamp + 'Z';
  // if (
  //   !timestamp.endsWith('Z') &&
  //   !timestamp.includes('+') &&
  //   !timestamp.includes('-')
  // ) {
  //   normalizedTimestamp = timestamp + 'Z';
  // }

  const date = new Date(normalizedTimestamp);
  const now = new Date();

  // Use UTC time for both dates to avoid timezone issues
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  // Debug logging to help identify timezone issues
  if (process.env.NODE_ENV === 'development') {
    console.log('🕐 Lock timestamp debug:', {
      originalTimestamp: timestamp,
      normalizedTimestamp,
      parsedDate: date.toISOString(),
      parsedDateLocal: date.toString(),
      now: now.toISOString(),
      nowLocal: now.toString(),
      diffInMinutes,
    });
  }

  if (diffInMinutes < 1) {
    return 'gerade eben';
  } else if (diffInMinutes < 60) {
    return `vor ${diffInMinutes} Min.`;
  } else if (diffInMinutes < 1440) {
    // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `vor ${hours} Std.`;
  } else {
    // Format as German date for older locks - use UTC to avoid timezone confusion
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(date);
  }
};

// Unified loading state management
type LoadingState = 'idle' | 'processing' | 'saving' | 'loading';

const useStableLoadingState = (
  currentState: LoadingState,
  minDisplayTime = 300,
) => {
  const [displayState, setDisplayState] = React.useState<LoadingState>('idle');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeRef = React.useRef<number>(0);

  React.useEffect(() => {
    const now = Date.now();

    // If we're going from idle to loading, show immediately
    if (displayState === 'idle' && currentState !== 'idle') {
      setDisplayState(currentState);
      lastChangeRef.current = now;
      return;
    }

    // If we're going from loading to idle, respect minimum display time
    if (displayState !== 'idle' && currentState === 'idle') {
      const timeSinceLastChange = now - lastChangeRef.current;
      const remainingTime = Math.max(0, minDisplayTime - timeSinceLastChange);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDisplayState('idle');
      }, remainingTime);
      return;
    }

    // For other state changes, update immediately but track timing
    if (currentState !== displayState) {
      setDisplayState(currentState);
      lastChangeRef.current = now;
    }
  }, [currentState, displayState, minDisplayTime]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return displayState;
};

const EditLockButton: React.FC<EditLockButtonProps> = ({
  resourceType,
  resourceId,
  isEditing,
  isSaving,
  onToggleEdit,
  onSave,
  onRefreshData,
  initialUpdatedAt,
}) => {
  const { dbUser } = useUser();
  const {
    lockInfo,
    canEdit,
    isLoading,
    lockResourceOptimistic,
    unlockResourceOptimistic,
    unlockResource,
    forceOverrideLock,
    refreshLockStatus,
  } = useEditLock(resourceType, resourceId);

  // Store the updatedAt timestamp when editing starts
  const [editStartUpdatedAt, setEditStartUpdatedAt] = React.useState<
    string | null
  >(null);

  // Unified loading states
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isOverriding, setIsOverriding] = React.useState(false);
  const [isSavingInternal, setIsSavingInternal] = React.useState(false);

  // Determine current loading state
  const currentLoadingState: LoadingState = React.useMemo(() => {
    if (isLoading) return 'loading';
    if (isSaving || isSavingInternal) return 'saving';
    if (isProcessing || isOverriding) return 'processing';
    return 'idle';
  }, [isLoading, isSaving, isSavingInternal, isProcessing, isOverriding]);

  // Use stable loading state to prevent flickering
  const stableLoadingState = useStableLoadingState(currentLoadingState);

  // Check if the resource has been modified and if the lock is still valid
  const checkForConflictsAndLockValidity = async (): Promise<{
    canSave: boolean;
    shouldRevertEdit: boolean;
  }> => {
    if (!dbUser?.id) {
      return { canSave: false, shouldRevertEdit: true };
    }

    try {
      // First check if we still have the lock
      const lockResponse = await fetch(
        `/api/${resourceType}/${resourceId}/lock`,
      );
      if (!lockResponse.ok) {
        toast.error('Fehler beim Prüfen des Sperrstatus');
        return { canSave: false, shouldRevertEdit: true };
      }

      const lockData = await lockResponse.json();
      const hasCurrentLock =
        lockData.isLocked && lockData.lockedBy === dbUser.id;

      if (!hasCurrentLock) {
        // We've lost the lock - check who has it now
        if (lockData.isLocked) {
          toast.error(
            `Die Sperre wurde von ${lockData.lockedByName || 'einem anderen Benutzer'} überschrieben. Bearbeitung wird beendet.`,
          );
        } else {
          toast.error('Die Sperre ist abgelaufen. Bearbeitung wird beendet.');
        }
        return { canSave: false, shouldRevertEdit: true };
      }

      // We still have the lock, now check for data conflicts if we have a baseline
      if (editStartUpdatedAt) {
        const response = await fetch(`/api/${resourceType}/${resourceId}`);
        if (!response.ok) {
          toast.error('Fehler beim Prüfen des Datensatzstatus');
          return { canSave: false, shouldRevertEdit: false };
        }

        const currentData = await response.json();
        const currentUpdatedAt = currentData.updatedAt;

        if (currentUpdatedAt !== editStartUpdatedAt) {
          toast.error(
            'Dieser Datensatz hat Änderungen, bitte schliessen Sie das Tab und öffnen Sie es wieder.',
          );
          return { canSave: false, shouldRevertEdit: false };
        }
      }

      return { canSave: true, shouldRevertEdit: false };
    } catch (error) {
      console.error('Error checking for conflicts and lock validity:', error);
      toast.error('Fehler beim Prüfen des Datensatzstatus');
      return { canSave: false, shouldRevertEdit: false };
    }
  };

  const handleToggleEdit = async () => {
    setIsProcessing(true);

    try {
      if (isEditing) {
        // If currently editing, unlock and exit edit mode (optimistic)
        onToggleEdit(); // Exit edit mode immediately
        setEditStartUpdatedAt(null); // Clear the baseline timestamp
        const unlocked = await unlockResourceOptimistic();
        if (unlocked) {
          toast.success('Bearbeitung beendet - für andere freigegeben');
        } else {
          toast.error('Fehler beim Entsperren');
          // Don't revert onToggleEdit here as the unlock might have failed for network reasons
          // but the UI state change should stay to avoid confusing the user
        }
      } else {
        // If not editing, try to lock and enter edit mode
        if (!canEdit) {
          toast.error(
            `Wird bereits von ${lockInfo.lockedByName || 'einem anderen Benutzer'} bearbeitet`,
          );
          return;
        }

        try {
          // First refresh data if callback is provided to ensure we have latest data
          if (onRefreshData) {
            try {
              await onRefreshData();
            } catch (error) {
              console.error('Error refreshing data:', error);
              toast.error('Fehler beim Aktualisieren der Daten');
              return; // Don't proceed if data refresh failed
            }
          }

          // Then try to get the lock
          const locked = await lockResourceOptimistic();
          if (locked) {
            // Only enter edit mode if lock was successful
            setEditStartUpdatedAt(initialUpdatedAt || null); // Store baseline timestamp
            onToggleEdit();
            toast.success('Bearbeitung gestartet - für andere gesperrt');
          } else {
            // Lock failed - don't change edit mode
            toast.error('Fehler beim Sperren für Bearbeitung');
          }
        } catch (error) {
          // Any error during locking - don't change edit mode
          toast.error('Fehler beim Sperren für Bearbeitung');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceOverride = async () => {
    setIsOverriding(true);

    try {
      // First refresh data if callback is provided to ensure we have latest data
      if (onRefreshData) {
        try {
          await onRefreshData();
        } catch (error) {
          console.error('Error refreshing data:', error);
          toast.error('Fehler beim Aktualisieren der Daten');
          return; // Don't proceed if data refresh failed
        }
      }

      // Then attempt to override the lock
      const overridden = await forceOverrideLock();
      if (overridden) {
        // Only enter edit mode if override was successful
        setEditStartUpdatedAt(initialUpdatedAt || null); // Store baseline timestamp
        onToggleEdit(); // Enter edit mode
        toast.success(
          `Bearbeitung von ${lockInfo.lockedByName || 'anderem Benutzer'} überschrieben`,
        );
      } else {
        toast.error('Fehler beim Überschreiben der Sperre');
      }
    } catch (error) {
      toast.error('Fehler beim Überschreiben der Sperre');
    } finally {
      setIsOverriding(false);
    }
  };

  const handleSave = async () => {
    setIsSavingInternal(true);

    try {
      // Check for conflicts and lock validity before saving
      const { canSave, shouldRevertEdit } =
        await checkForConflictsAndLockValidity();

      if (shouldRevertEdit) {
        // Lock was lost or overwritten - revert edit mode and refresh lock status
        setEditStartUpdatedAt(null);
        onToggleEdit(); // Exit edit mode

        // Refresh lock status to show current state (who has the lock now)
        try {
          await refreshLockStatus();
        } catch (error) {
          console.error('Error refreshing lock status:', error);
        }
        return;
      }

      if (!canSave) {
        return; // Don't proceed with save if there are conflicts but don't revert edit mode
      }

      await onSave();

      // Unlock the resource after saving
      const unlocked = await unlockResource();
      if (unlocked) {
        toast.success('Gespeichert und für andere freigegeben');
        // Exit edit mode after successful save and unlock
        setEditStartUpdatedAt(null);
        onToggleEdit();
      } else {
        toast.error('Fehler beim Entsperren nach dem Speichern');
      }
    } catch (error) {
      console.error('Error during save:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSavingInternal(false);
    }
  };

  // Determine button text and icon for idle state
  const getEditButtonContent = () => {
    if (isEditing) {
      return 'Abbrechen';
    }

    if (!canEdit) {
      return (
        <>
          <Lock size={14} className="inline-block mr-1" />
          Gesperrt
        </>
      );
    }

    return (
      <>
        <Edit3 size={14} className="inline-block mr-1" />
        Bearbeiten
      </>
    );
  };

  const getOverrideButtonContent = () => {
    return (
      <>
        <AlertTriangle size={14} className="inline-block mr-1" />
        Überschreiben
      </>
    );
  };

  const getSaveButtonContent = () => {
    return (
      <>
        <Save size={14} className="inline-block mr-1" />
        Speichern
      </>
    );
  };

  // Show loading indicator when any operation is in progress
  if (stableLoadingState !== 'idle') {
    return (
      <div className="flex gap-2 items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Loader2 size={16} className="inline-block animate-spin mr-2" />
          Laden...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleEdit}
        disabled={!canEdit && !isEditing}
        aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
      >
        {getEditButtonContent()}
      </Button>

      {/* Force Override Button - only show when locked by another user */}
      {lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleForceOverride}
          aria-label="Sperre überschreiben und bearbeiten"
          className="bg-orange-600 hover:bg-orange-700"
        >
          {getOverrideButtonContent()}
        </Button>
      )}

      {/* Save Button - only show when in edit mode AND we actually have the lock */}
      {isEditing && lockInfo.isLockedByCurrentUser && (
        <Button
          size="sm"
          onClick={handleSave}
          aria-label="Änderungen speichern"
        >
          {getSaveButtonContent()}
        </Button>
      )}

      {lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && (
        <span className="text-sm text-gray-600">
          wird bearbeitet von{' '}
          <strong>{lockInfo.lockedByName || 'Unbekannt'}</strong>
          {lockInfo.lockedAt && (
            <span className="text-gray-500">
              {' '}
              ({formatLockTime(lockInfo.lockedAt)})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default EditLockButton;
