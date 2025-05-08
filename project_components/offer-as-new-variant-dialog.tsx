import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FC } from 'react';

type OfferAsNewVariantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const OfferAsNewVariantDialog: FC<OfferAsNewVariantDialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent aria-label="Angebot als neue Variante?">
      <DialogHeader>
        <DialogTitle>Angebot als neue Variante?</DialogTitle>
      </DialogHeader>
      <div className="py-4 text-base">Soll das Angebot als neue Variante erstellt werden?</div>
      <DialogFooter>
        <div className="flex gap-2 justify-start w-full">
          <Button type="button" variant="outline" aria-label="Abbrechen" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="button" variant="outline" aria-label="Zurück" onClick={() => onOpenChange(false)}>
            Zurück
          </Button>
          <Button type="button" variant="outline" aria-label="Nein" onClick={() => onOpenChange(false)}>
            Nein
          </Button>
          <Button type="button" aria-label="Ja" onClick={() => onOpenChange(false)}>
            Ja
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default OfferAsNewVariantDialog; 