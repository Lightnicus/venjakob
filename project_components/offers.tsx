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
import ChooseSalesOpportunityDialog from './choose-sales-opportunity-dialog';
import OfferAsNewVariantDialog from './offer-as-new-variant-dialog';
import { SaleChance } from './sale-opportunities-table';
import ChooseOfferLanguageDialog from '@/project_components/choose-offer-language-dialog';
import { ChooseOfferVariantDialog } from '@/project_components/choose-offer-variant-dialog';

const dummySalesOpportunities: SaleChance[] = [
  {
    titel: 'Beispielchance 1',
    kunde: 'Kunde A',
    verantwortlicher: 'Max Mustermann',
    status: 'Offen',
    gb: 'GB1',
    volumen: '10000',
    liefertermin: '01.01.2025',
    geaendertAm: '01.06.2024',
    angebote: 2,
  },
  {
    titel: 'Beispielchance 2',
    kunde: 'Kunde B',
    verantwortlicher: 'Erika Musterfrau',
    status: 'In Bearbeitung',
    gb: 'GB2',
    volumen: '20000',
    liefertermin: '15.02.2025',
    geaendertAm: '02.06.2024',
    angebote: 1,
  },
];

const Offers = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chooseOfferDialogOpen, setChooseOfferDialogOpen] = useState(false);
  const [
    chooseSalesOpportunityDialogOpen,
    setChooseSalesOpportunityDialogOpen,
  ] = useState(false);
  const [offerAsNewVariantDialogOpen, setOfferAsNewVariantDialogOpen] =
    useState(false);
  const [chooseOfferLanguageDialogOpen, setChooseOfferLanguageDialogOpen] =
    useState(false);
  const [chooseOfferVariantDialogOpen, setChooseOfferVariantDialogOpen] = 
    useState(false);

  const handleCopyOfferDialogCancel = () => setDialogOpen(false);
  const handleCopyOfferDialogNo = () => {
    setDialogOpen(false);
    setChooseSalesOpportunityDialogOpen(true);
  };
  const handleCopyOfferDialogYes = () => {
    setDialogOpen(false);
    setChooseOfferDialogOpen(true);
  };
  const handleChooseOfferWeiter = () => {
    setChooseOfferDialogOpen(false);
    setOfferAsNewVariantDialogOpen(true);
  };

  const handleOfferAsNewVariantDialogJa = () => {
    setOfferAsNewVariantDialogOpen(false);
    setChooseOfferLanguageDialogOpen(true);
  };

  const handleOfferAsNewVariantDialogNein = () => {
    setOfferAsNewVariantDialogOpen(false);
    setChooseOfferVariantDialogOpen(true);
  };

  const handleChooseOfferVariantCancel = () => {
    setChooseOfferVariantDialogOpen(false);
  };

  const handleChooseOfferVariantBack = () => {
    setChooseOfferVariantDialogOpen(false);
    setOfferAsNewVariantDialogOpen(true);
  };

  const handleChooseOfferVariantCreate = () => {
    setChooseOfferVariantDialogOpen(false);
    // Hier kann weitere Logik für das Erstellen implementiert werden
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
        onWeiter={handleChooseOfferWeiter}
      />
      <ChooseSalesOpportunityDialog
        open={chooseSalesOpportunityDialogOpen}
        onOpenChange={setChooseSalesOpportunityDialogOpen}
        data={dummySalesOpportunities}
      />
      <OfferAsNewVariantDialog
        open={offerAsNewVariantDialogOpen}
        onOpenChange={setOfferAsNewVariantDialogOpen}
        onJa={handleOfferAsNewVariantDialogJa}
        onNein={handleOfferAsNewVariantDialogNein}
      />
      <ChooseOfferLanguageDialog
        open={chooseOfferLanguageDialogOpen}
        onOpenChange={setChooseOfferLanguageDialogOpen}
      />
      <ChooseOfferVariantDialog
        open={chooseOfferVariantDialogOpen}
        onOpenChange={setChooseOfferVariantDialogOpen}
        onCancel={handleChooseOfferVariantCancel}
        onBack={handleChooseOfferVariantBack}
        onCreate={handleChooseOfferVariantCreate}
      />
    </div>
  );
};

export default Offers;
