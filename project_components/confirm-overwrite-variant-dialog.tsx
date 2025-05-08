'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOverwriteVariantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerNumber: string;
  variantIdentifier: string;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function ConfirmOverwriteVariantDialog({
  open,
  onOpenChange,
  offerNumber,
  variantIdentifier,
  onCancel,
  onBack,
  onConfirm,
}: ConfirmOverwriteVariantProps) {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Bestätigung zum Überschreiben einer Angebotsvariante">
        <DialogHeader>
          <DialogTitle>Angebotsvariante überschreiben?</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-base">
          Ihre aktuellen Bearbeitungen in Angebotsvariante {offerNumber}-{variantIdentifier} werden überschrieben. 
          Wollen Sie fortfahren?
        </div>
        
        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              aria-label="Abbrechen"
              tabIndex={0}
            >
              Abbrechen
            </Button>
            <Button 
              variant="outline" 
              onClick={onBack}
              aria-label="Zurück"
              tabIndex={0}
            >
              Zurück
            </Button>
            <Button 
              onClick={onConfirm}
              aria-label="Ja"
              tabIndex={0}
            >
              Ja
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 