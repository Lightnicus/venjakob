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

  console.log('normalizedTimestamp', normalizedTimestamp);
  const date = new Date(normalizedTimestamp);
  const now = new Date();
  console.log('lock date', date);
  console.log('date', now);

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

const EditLockButton: React.FC<EditLockButtonProps> = ({
  resourceType,
  resourceId,
  isEditing,
  isSaving,
  onToggleEdit,
  onSave,
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

  // Loading states for async operations
  const [isToggling, setIsToggling] = React.useState(false);
  const [isOverriding, setIsOverriding] = React.useState(false);
  const [isSavingInternal, setIsSavingInternal] = React.useState(false);

  // Check if the resource has been modified by checking its current updatedAt
  const checkForConflicts = async (): Promise<boolean> => {
    if (!editStartUpdatedAt || !dbUser?.id) return true; // No baseline to compare or no user, allow save

    try {
      // Fetch current resource data to check updatedAt
      const response = await fetch(`/api/${resourceType}/${resourceId}`);
      if (!response.ok) {
        toast.error('Fehler beim Prüfen des Datensatzstatus');
        return false;
      }

      const currentData = await response.json();
      const currentUpdatedAt = currentData.updatedAt;

      // Refresh lock status to get the most current information
      const lockResponse = await fetch(
        `/api/${resourceType}/${resourceId}/lock`,
      );
      if (!lockResponse.ok) {
        toast.error('Fehler beim Prüfen des Sperrstatus');
        return false;
      }

      const lockData = await lockResponse.json();
      const hasCurrentLock =
        lockData.isLocked && lockData.lockedBy === dbUser.id;

      if (!hasCurrentLock) {
        // Lock is lost - check if data has changed
        if (currentUpdatedAt !== editStartUpdatedAt) {
          toast.error(
            'Dieser Datensatz hat Änderungen, bitte schliessen Sie das Tab und öffnen Sie es wieder.',
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      toast.error('Fehler beim Prüfen des Datensatzstatus');
      return false;
    }
  };

  const handleToggleEdit = async () => {
    setIsToggling(true);
    
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
          // First try to get the lock
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
      setIsToggling(false);
    }
  };

  const handleForceOverride = async () => {
    setIsOverriding(true);
    
    // Optimistically enter edit mode immediately to avoid UI flickering
    setEditStartUpdatedAt(initialUpdatedAt || null); // Store baseline timestamp
    onToggleEdit(); // Enter edit mode immediately
    
    try {
      const overridden = await forceOverrideLock();
      if (overridden) {
        toast.success(
          `Bearbeitung von ${lockInfo.lockedByName || 'anderem Benutzer'} überschrieben`,
        );
      } else {
        toast.error('Fehler beim Überschreiben der Sperre');
        // Revert the optimistic UI change if override failed
        setEditStartUpdatedAt(null);
        onToggleEdit(); // Exit edit mode
      }
    } catch (error) {
      toast.error('Fehler beim Überschreiben der Sperre');
      // Revert the optimistic UI change if override failed
      setEditStartUpdatedAt(null);
      onToggleEdit(); // Exit edit mode
    } finally {
      setIsOverriding(false);
    }
  };

  const handleSave = async () => {
    setIsSavingInternal(true);
    
    try {
      // Check for conflicts before saving
      const canSave = await checkForConflicts();
      if (!canSave) {
        return; // Don't proceed with save if there are conflicts
      }

      await onSave();
      // Unlock the resource after saving
      const unlocked = await unlockResource();
      if (unlocked) {
        toast.success('Gespeichert und für andere freigegeben');
      } else {
        toast.error('Fehler beim Entsperren nach dem Speichern');
      }
    } finally {
      setIsSavingInternal(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleEdit}
        disabled={(!canEdit && !isEditing) || isToggling || isLoading}
        aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="inline-block animate-spin mr-1" />
            Laden...
          </>
        ) : isToggling ? (
          <>
            <Loader2 size={14} className="inline-block animate-spin mr-1" />
            Bitte warten...
          </>
        ) : isEditing ? (
          'Abbrechen'
        ) : !canEdit ? (
          <>
            <Lock size={14} className="inline-block mr-1" />
            Gesperrt
          </>
        ) : (
          <>
            <Edit3 size={14} className="inline-block mr-1" />
            Bearbeiten
          </>
        )}
      </Button>

      {/* Force Override Button - only show when locked by another user and initial load is complete */}
      {!isLoading && lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && !isEditing && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleForceOverride}
          disabled={isOverriding}
          aria-label="Sperre überschreiben und bearbeiten"
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isOverriding ? (
            <>
              <Loader2 size={14} className="inline-block animate-spin mr-1" />
              Überschreibt...
            </>
          ) : (
            <>
              <AlertTriangle size={14} className="inline-block mr-1" />
              Überschreiben
            </>
          )}
        </Button>
      )}

      {isEditing && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || isSavingInternal}
          aria-label="Änderungen speichern"
        >
          {isSaving || isSavingInternal ? (
            <>
              <Loader2 size={14} className="inline-block animate-spin mr-1" />
              Speichern...
            </>
          ) : (
            <>
              <Save size={14} className="inline-block mr-1" />
              Speichern
            </>
          )}
        </Button>
      )}

      {!isLoading && lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && (
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
