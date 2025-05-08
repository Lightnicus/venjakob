import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FC } from 'react';

type OfferAsNewVariantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbbrechen?: () => void;
  onZurueck?: () => void;
  onNein?: () => void;
  onJa?: () => void;
};

const OfferAsNewVariantDialog: FC<OfferAsNewVariantDialogProps> = ({
  open,
  onOpenChange,
  onAbbrechen,
  onZurueck,
  onNein,
  onJa,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent aria-label="Angebot als neue Variante?">
      <DialogHeader>
        <DialogTitle>Angebot als neue Variante?</DialogTitle>
      </DialogHeader>
      <div className="py-4 text-base">
        Soll das Angebot als neue Variante erstellt werden?
      </div>
      <DialogFooter>
        <div className="flex gap-2 justify-start w-full">
          <Button
            type="button"
            variant="outline"
            aria-label="Abbrechen"
            onClick={onAbbrechen || (() => onOpenChange(false))}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Zurück"
            onClick={onZurueck || (() => onOpenChange(false))}
          >
            Zurück
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Nein"
            onClick={onNein || (() => onOpenChange(false))}
          >
            Nein
          </Button>
          <Button
            type="button"
            aria-label="Ja"
            onClick={onJa || (() => onOpenChange(false))}
          >
            Ja
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default OfferAsNewVariantDialog;
