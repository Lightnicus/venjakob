'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OfferVariantsTable } from '@/project_components/offer-variants-table';

interface ChooseOfferVariantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onBack: () => void;
  onCreate: () => void;
}

export function ChooseOfferVariantDialog({
  open,
  onOpenChange,
  onCancel,
  onBack,
  onCreate,
}: ChooseOfferVariantProps) {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99%] min-w-[99%]">
        <DialogHeader>
          <DialogTitle>Angebotsversion auswählen</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-auto my-4">
          <OfferVariantsTable />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
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
          <Button onClick={onCreate} aria-label="Erstellen" tabIndex={0}>
            Erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
