import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FC } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onNo: () => void;
  onYes: () => void;
};

const NewOfferFromExistingDialog: FC<Props> = ({ open, onOpenChange, onCancel, onNo, onYes }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Angebot erstellen</DialogTitle>
      </DialogHeader>
      <div className="py-4 text-base">Wollen Sie ein bereits existierendes Angebot kopieren?</div>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button variant="outline" onClick={onNo}>Nein</Button>
        <Button onClick={onYes}>Ja</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default NewOfferFromExistingDialog; 