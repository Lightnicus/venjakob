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
import { ConfirmOverwriteVariantDialog } from '@/project_components/confirm-overwrite-variant-dialog';
import { VersionsForOfferVariantDialog } from '@/project_components/versions-for-offer-variant-dialog';

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
  const [isCreatingNewVersion, setIsCreatingNewVersion] = useState(false);
  const [confirmOverwriteVariantDialogOpen, setConfirmOverwriteVariantDialogOpen] =
    useState(false);
  const [versionsForOfferVariantDialogOpen, setVersionsForOfferVariantDialogOpen] =
    useState(false);
  const [selectedOfferNumber, setSelectedOfferNumber] = useState('ANG-2023-0001');
  const [selectedVariantIdentifier, setSelectedVariantIdentifier] = useState('A');

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

  const handleSalesOpportunityZurueck = () => {
    setChooseSalesOpportunityDialogOpen(false);
    setDialogOpen(true);
  };

  const handleSalesOpportunityWeiter = (selectedChance: SaleChance) => {
    setChooseSalesOpportunityDialogOpen(false);
    setOfferAsNewVariantDialogOpen(true);
  };

  const handleOfferAsNewVariantDialogZurueck = () => {
    setOfferAsNewVariantDialogOpen(false);
    setChooseSalesOpportunityDialogOpen(true);
  };

  const handleOfferAsNewVariantDialogJa = () => {
    setOfferAsNewVariantDialogOpen(false);
    setChooseOfferLanguageDialogOpen(true);
  };

  const handleOfferAsNewVariantDialogNein = () => {
    setOfferAsNewVariantDialogOpen(false);
    setIsCreatingNewVersion(true);
    setChooseOfferVariantDialogOpen(true);
  };

  const handleChooseOfferLanguageZurueck = () => {
    setChooseOfferLanguageDialogOpen(false);
    setOfferAsNewVariantDialogOpen(true);
  };

  const handleChooseOfferVariantCancel = () => {
    setChooseOfferVariantDialogOpen(false);
  };

  const handleChooseOfferVariantBack = () => {
    setChooseOfferVariantDialogOpen(false);
    if (isCreatingNewVersion) {
      setIsCreatingNewVersion(false);
      setOfferAsNewVariantDialogOpen(true);
    } else {
      setOfferAsNewVariantDialogOpen(true);
    }
  };

  const handleChooseOfferVariantCreate = () => {
    setChooseOfferVariantDialogOpen(false);
    setConfirmOverwriteVariantDialogOpen(true);
  };

  const handleConfirmOverwriteCancel = () => {
    setConfirmOverwriteVariantDialogOpen(false);
  };

  const handleConfirmOverwriteBack = () => {
    setConfirmOverwriteVariantDialogOpen(false);
    setChooseOfferVariantDialogOpen(true);
  };

  const handleConfirmOverwriteConfirm = () => {
    setConfirmOverwriteVariantDialogOpen(false);
    // Hier weitere Logik nach Bestätigung implementieren
  };

  const handleVersionsForOfferVariantClose = () => {
    setVersionsForOfferVariantDialogOpen(false);
  };

  const handleOpenVersionsDialog = (offerNumber: string, variantIdentifier: string) => {
    setSelectedOfferNumber(offerNumber);
    setSelectedVariantIdentifier(variantIdentifier);
    setVersionsForOfferVariantDialogOpen(true);
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
      <OffersTable onOpenVersionsDialog={handleOpenVersionsDialog} />
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
        onZurueck={handleSalesOpportunityZurueck}
        onWeiter={handleSalesOpportunityWeiter}
      />
      <OfferAsNewVariantDialog
        open={offerAsNewVariantDialogOpen}
        onOpenChange={setOfferAsNewVariantDialogOpen}
        onJa={handleOfferAsNewVariantDialogJa}
        onNein={handleOfferAsNewVariantDialogNein}
        onZurueck={handleOfferAsNewVariantDialogZurueck}
      />
      <ChooseOfferLanguageDialog
        open={chooseOfferLanguageDialogOpen}
        onOpenChange={setChooseOfferLanguageDialogOpen}
        onZurueck={handleChooseOfferLanguageZurueck}
      />
      <ChooseOfferVariantDialog
        open={chooseOfferVariantDialogOpen}
        onOpenChange={setChooseOfferVariantDialogOpen}
        onCancel={handleChooseOfferVariantCancel}
        onBack={handleChooseOfferVariantBack}
        onCreate={handleChooseOfferVariantCreate}
        header={isCreatingNewVersion ? "Zu welcher Angebotsvariante soll eine neue Version erstellt werden?" : undefined}
      />
      <ConfirmOverwriteVariantDialog
        open={confirmOverwriteVariantDialogOpen}
        onOpenChange={setConfirmOverwriteVariantDialogOpen}
        offerNumber="ANG-2023-0001"
        variantIdentifier="V2"
        onCancel={handleConfirmOverwriteCancel}
        onBack={handleConfirmOverwriteBack}
        onConfirm={handleConfirmOverwriteConfirm}
      />
      <VersionsForOfferVariantDialog
        open={versionsForOfferVariantDialogOpen}
        onOpenChange={setVersionsForOfferVariantDialogOpen}
        offerNumber={selectedOfferNumber}
        variantIdentifier={selectedVariantIdentifier}
        onClose={handleVersionsForOfferVariantClose}
      />
    </div>
  );
};

export default Offers;
