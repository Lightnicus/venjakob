import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OffersTable } from '@/project_components/offers-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FC } from 'react';

type ChooseOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChooseOfferDialog: FC<ChooseOfferDialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[99%] min-w-[99%]" aria-label="Angebot auswählen">
      <DialogHeader>
        <DialogTitle>Angebot auswählen</DialogTitle>
      </DialogHeader>
      <div className="flex justify-end mb-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox aria-label="Zeige alle Versionen an" tabIndex={0} />
          <span className="text-sm">Zeige alle Versionen an</span>
        </label>
      </div>
      <div className="py-2">
        <OffersTable reducedMode />
      </div>
      <DialogFooter>
        <div className="flex gap-2 justify-end w-full">
          <Button type="button" variant="outline" aria-label="Abbrechen" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="button" variant="outline" aria-label="Zurück" onClick={() => onOpenChange(false)}>
            Zurück
          </Button>
          <Button type="button" aria-label="Weiter" onClick={() => onOpenChange(false)}>
            Weiter
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ChooseOfferDialog; 