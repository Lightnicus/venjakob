import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type EnterOrderConfirmationNumberDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmationNumber: string) => void;
};

const EnterOrderConfirmationNumberDialog: React.FC<EnterOrderConfirmationNumberDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
}) => {
  const [confirmationNumber, setConfirmationNumber] = useState('');

  const handleConfirm = () => {
    onConfirm(confirmationNumber);
    setConfirmationNumber('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setConfirmationNumber('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Auftragsbestätigungsnummer</DialogTitle>
          <DialogDescription>
            Bitte geben Sie die Auftragsbestätigungsnummer(n) ein:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder="z.B. AB2024-001"
            className="w-full"
            aria-label="Auftragsbestätigungsnummer"
          />
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnterOrderConfirmationNumberDialog; 