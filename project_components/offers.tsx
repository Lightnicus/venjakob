import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { OffersTable } from '@/project_components/offers-table';
import { FC, useState } from 'react';
import NewOfferFromExistingDialog from './new-offer-from-existing-dialog';
import ChooseOfferDialog from './choose-offer-dialog';
import ChooseSalesOpportunityDialog from './choose-sales-opportunity-dialog';
import OfferAsNewVariantDialog from './offer-as-new-variant-dialog';
import { SaleChance } from './sale-opportunities-table';
import ChooseOfferLanguageDialog from '@/project_components/choose-offer-language-dialog';
import { ChooseOfferVariantDialog } from '@/project_components/choose-offer-variant-dialog';
import { ConfirmOverwriteVariantDialog } from '@/project_components/confirm-overwrite-variant-dialog';
import { VersionsForOfferVariantDialog } from '@/project_components/versions-for-offer-variant-dialog';
import { DialogManagerProvider, DialogRenderer, useDialogManager } from './dialog-manager';

// Dialog IDs
const DIALOGS = {
  NEW_OFFER: 'new-offer',
  CHOOSE_OFFER: 'choose-offer',
  CHOOSE_SALES_OPPORTUNITY: 'choose-sales-opportunity',
  OFFER_AS_NEW_VARIANT: 'offer-as-new-variant',
  CHOOSE_OFFER_LANGUAGE: 'choose-offer-language',
  CHOOSE_OFFER_VARIANT: 'choose-offer-variant',
  CONFIRM_OVERWRITE_VARIANT: 'confirm-overwrite-variant',
  VERSIONS_FOR_OFFER_VARIANT: 'versions-for-offer-variant',
};

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

// Offers component that uses DialogManager
const OffersContent: FC = () => {
  const { openDialog } = useDialogManager();
  const [selectedOfferNumber, setSelectedOfferNumber] = useState('ANG-2023-0001');
  const [selectedVariantIdentifier, setSelectedVariantIdentifier] = useState('A');

  const handleOpenVersionsDialog = (offerNumber: string, variantIdentifier: string) => {
    setSelectedOfferNumber(offerNumber);
    setSelectedVariantIdentifier(variantIdentifier);
    openDialog(DIALOGS.VERSIONS_FOR_OFFER_VARIANT, {
      offerNumber,
      variantIdentifier,
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button
          className="flex items-center gap-1"
          variant="outline"
          size="sm"
          onClick={() => openDialog(DIALOGS.NEW_OFFER)}
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
    </div>
  );
};

// Dialog Components
const NewOfferDialogComponent: FC = () => {
  const { closeDialog, openDialog } = useDialogManager();

  const handleCancel = () => closeDialog();
  
  const handleNo = () => {
    openDialog(DIALOGS.CHOOSE_SALES_OPPORTUNITY);
  };
  
  const handleYes = () => {
    openDialog(DIALOGS.CHOOSE_OFFER);
  };

  return (
    <NewOfferFromExistingDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      onCancel={handleCancel}
      onNo={handleNo}
      onYes={handleYes}
    />
  );
};

const ChooseOfferDialogComponent: FC = () => {
  const { closeDialog, openDialog } = useDialogManager();

  const handleWeiter = () => {
    openDialog(DIALOGS.OFFER_AS_NEW_VARIANT);
  };

  return (
    <ChooseOfferDialog
      onWeiter={handleWeiter}
    />
  );
};

const ChooseSalesOpportunityDialogComponent: FC = () => {
  const { closeDialog, openDialog, goBack } = useDialogManager();

  const handleZurueck = () => {
    goBack();
  };

  const handleWeiter = (selectedChance: SaleChance) => {
    openDialog(DIALOGS.OFFER_AS_NEW_VARIANT);
  };

  return (
    <ChooseSalesOpportunityDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      data={dummySalesOpportunities}
      onZurueck={handleZurueck}
      onWeiter={handleWeiter}
    />
  );
};

const OfferAsNewVariantDialogComponent: FC<{ fromVariantSelection?: boolean }> = ({ fromVariantSelection }) => {
  const { closeDialog, openDialog, goBack } = useDialogManager();

  const handleZurueck = () => {
    goBack();
  };

  const handleJa = () => {
    openDialog(DIALOGS.CHOOSE_OFFER_LANGUAGE);
  };

  const handleNein = () => {
    openDialog(DIALOGS.CHOOSE_OFFER_VARIANT, { isCreatingNewVersion: true });
  };

  return (
    <OfferAsNewVariantDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      onJa={handleJa}
      onNein={handleNein}
      onZurueck={handleZurueck}
    />
  );
};

const ChooseOfferLanguageDialogComponent: FC = () => {
  const { closeDialog, openDialog, goBack } = useDialogManager();

  const handleZurueck = () => {
    goBack();
  };

  return (
    <ChooseOfferLanguageDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      onZurueck={handleZurueck}
    />
  );
};

const ChooseOfferVariantDialogComponent: FC<{ isCreatingNewVersion?: boolean }> = ({ isCreatingNewVersion = false }) => {
  const { closeDialog, openDialog, goBack } = useDialogManager();

  const handleCancel = () => closeDialog();

  const handleBack = () => {
    goBack();
  };

  const handleCreate = () => {
    openDialog(DIALOGS.CONFIRM_OVERWRITE_VARIANT);
  };

  return (
    <ChooseOfferVariantDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      onCancel={handleCancel}
      onBack={handleBack}
      onCreate={handleCreate}
      header={isCreatingNewVersion ? "Zu welcher Angebotsvariante soll eine neue Version erstellt werden?" : undefined}
    />
  );
};

const ConfirmOverwriteVariantDialogComponent: FC = () => {
  const { closeDialog, openDialog, goBack } = useDialogManager();

  const handleCancel = () => closeDialog();

  const handleBack = () => {
    goBack();
  };

  const handleConfirm = () => {
    closeDialog();
    // Hier weitere Logik nach Bestätigung implementieren
  };

  return (
    <ConfirmOverwriteVariantDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      offerNumber="ANG-2023-0001"
      variantIdentifier="V2"
      onCancel={handleCancel}
      onBack={handleBack}
      onConfirm={handleConfirm}
    />
  );
};

const VersionsForOfferVariantDialogComponent: FC<{ offerNumber: string; variantIdentifier: string }> = ({
  offerNumber,
  variantIdentifier,
}) => {
  const { closeDialog } = useDialogManager();

  const handleClose = () => closeDialog();

  return (
    <VersionsForOfferVariantDialog
      open={true}
      onOpenChange={(open) => !open && closeDialog()}
      offerNumber={offerNumber}
      variantIdentifier={variantIdentifier}
      onClose={handleClose}
    />
  );
};

// Dialog configuration for DialogRenderer
const dialogComponents = [
  { id: DIALOGS.NEW_OFFER, component: NewOfferDialogComponent },
  { id: DIALOGS.CHOOSE_OFFER, component: ChooseOfferDialogComponent },
  { id: DIALOGS.CHOOSE_SALES_OPPORTUNITY, component: ChooseSalesOpportunityDialogComponent },
  { id: DIALOGS.OFFER_AS_NEW_VARIANT, component: OfferAsNewVariantDialogComponent },
  { id: DIALOGS.CHOOSE_OFFER_LANGUAGE, component: ChooseOfferLanguageDialogComponent },
  { id: DIALOGS.CHOOSE_OFFER_VARIANT, component: ChooseOfferVariantDialogComponent },
  { id: DIALOGS.CONFIRM_OVERWRITE_VARIANT, component: ConfirmOverwriteVariantDialogComponent },
  { id: DIALOGS.VERSIONS_FOR_OFFER_VARIANT, component: VersionsForOfferVariantDialogComponent },
];

// Main component with dialog management
const Offers: FC = () => {
  return (
    <DialogManagerProvider>
      <OffersContent />
      <DialogRenderer dialogs={dialogComponents} />
    </DialogManagerProvider>
  );
};

export default Offers;
