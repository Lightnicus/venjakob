'use client';

import { Button } from '@/components/ui/button';
import { Edit3, Save, Loader2, Lock } from 'lucide-react';
import { useEditLock, type LockableResource } from '@/hooks/use-edit-lock';
import { toast } from 'sonner';

interface EditLockButtonProps {
  resourceType: LockableResource;
  resourceId: string;
  isEditing: boolean;
  isSaving: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}

const EditLockButton: React.FC<EditLockButtonProps> = ({
  resourceType,
  resourceId,
  isEditing,
  isSaving,
  onToggleEdit,
  onSave,
}) => {
  const { lockInfo, canEdit, lockResourceOptimistic, unlockResourceOptimistic, unlockResource } = useEditLock(
    resourceType,
    resourceId
  );

  const handleToggleEdit = async () => {
    if (isEditing) {
      // If currently editing, unlock and exit edit mode (optimistic)
      onToggleEdit(); // Exit edit mode immediately
      const unlocked = await unlockResourceOptimistic();
      if (unlocked) {
        toast.success('Bearbeitung beendet - für andere freigegeben');
      } else {
        toast.error('Fehler beim Entsperren');
        // Don't revert onToggleEdit here as the unlock might have failed for network reasons
        // but the UI state change should stay to avoid confusing the user
      }
    } else {
      // If not editing, try to lock and enter edit mode (optimistic)
      if (canEdit) {
        onToggleEdit(); // Enter edit mode immediately
        const locked = await lockResourceOptimistic();
        if (locked) {
          toast.success('Bearbeitung gestartet - für andere gesperrt');
        } else {
          toast.error('Fehler beim Sperren für Bearbeitung');
          onToggleEdit(); // Revert edit mode if lock failed
        }
      } else {
        toast.error(
          `Wird bereits von ${lockInfo.lockedByName || 'einem anderen Benutzer'} bearbeitet`
        );
      }
    }
  };

  const handleSave = async () => {
    await onSave();
    // Unlock the resource after saving
    const unlocked = await unlockResource();
    if (unlocked) {
      toast.success('Gespeichert und für andere freigegeben');
    } else {
      toast.error('Fehler beim Entsperren nach dem Speichern');
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleEdit}
        disabled={!canEdit && !isEditing}
        aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
      >
        {isEditing ? (
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
      
      {isEditing && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Änderungen speichern"
        >
          {isSaving ? (
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
      
      {lockInfo.isLocked && !lockInfo.isLockedByCurrentUser && (
        <span className="text-sm text-gray-600">
          wird bearbeitet von{' '}
          <strong>{lockInfo.lockedByName || 'Unbekannt'}</strong>
        </span>
      )}
    </div>
  );
};

export default EditLockButton; 