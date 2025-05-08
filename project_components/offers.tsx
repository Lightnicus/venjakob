import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { OffersTable } from '@/project_components/offers-table';
import { useState } from 'react';
import NewOfferFromExistingDialog from './new-offer-from-existing-dialog';
import ChooseOfferDialog from './choose-offer-dialog';

const Offers = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chooseOfferDialogOpen, setChooseOfferDialogOpen] = useState(false);

  const handleCopyOfferDialogCancel = () => setDialogOpen(false);
  const handleCopyOfferDialogNo = () => setDialogOpen(false);
  const handleCopyOfferDialogYes = () => {
    setDialogOpen(false);
    setChooseOfferDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button
          className="flex items-center gap-1"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          Erstellen
        </Button>
        <Select defaultValue="Offen">
          <SelectTrigger
            className="h-8 w-[140px] rounded border px-2 py-1 text-sm"
            aria-label="Status wählen"
          >
            Status
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Offen">Offen</SelectItem>
            <SelectItem value="Geschlossen">Geschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <OffersTable />
      <NewOfferFromExistingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCancel={handleCopyOfferDialogCancel}
        onNo={handleCopyOfferDialogNo}
        onYes={handleCopyOfferDialogYes}
      />
      <ChooseOfferDialog
        open={chooseOfferDialogOpen}
        onOpenChange={setChooseOfferDialogOpen}
      />
    </div>
  );
};

export default Offers;
