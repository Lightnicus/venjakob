import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { OffersTable } from '@/project_components/offers-table';
import { Button } from '@/components/ui/button';
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
      <div className="py-2">
        <OffersTable reducedMode />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" aria-label="Dialog schließen">
            Schließen
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ChooseOfferDialog; 