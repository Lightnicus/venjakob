import { FC } from 'react';
import {
  DialogManagerProvider,
  DialogRenderer,
  useDialogManager,
} from './dialog-manager';
import NewOfferFromExistingDialog from './new-offer-from-existing-dialog';
import ChooseOfferDialog from './choose-offer-dialog';
import ChooseSalesOpportunityDialog from './choose-sales-opportunity-dialog';
import OfferAsNewVariantDialog from './offer-as-new-variant-dialog';
import ChooseOfferLanguageDialog from './choose-offer-language-dialog';
import { ChooseOfferVariantDialog } from './choose-offer-variant-dialog';
import { ConfirmOverwriteVariantDialog } from './confirm-overwrite-variant-dialog';
import { VersionsForOfferVariantDialog } from './versions-for-offer-variant-dialog';
import { SaleChance } from './sale-opportunities-table';
import saleChancesData from '@/data/sale-chances.json';

// Dialog IDs
export const QUOTE_DIALOGS = {
  NEW_QUOTE: 'new-quote',
  CHOOSE_QUOTE: 'choose-quote',
  CHOOSE_SALES_OPPORTUNITY: 'choose-sales-opportunity',
  QUOTE_AS_NEW_VARIANT: 'quote-as-new-variant',
  CHOOSE_QUOTE_LANGUAGE: 'choose-quote-language',
  CHOOSE_QUOTE_VARIANT: 'choose-quote-variant',
  CONFIRM_OVERWRITE_VARIANT: 'confirm-overwrite-variant',
  VERSIONS_FOR_QUOTE_VARIANT: 'versions-for-quote-variant',
};

interface QuoteDialogsProps {
  onCreateQuote: () => Promise<any>;
  children: React.ReactNode;
}

// Dialog Components
const NewQuoteDialogComponent: FC = () => {
  const { openDialog } = useDialogManager();

  const handleNo = () => {
    openDialog(QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY);
  };

  const handleYes = () => {
    openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE);
  };

  return <NewOfferFromExistingDialog 
    onNo={handleNo} 
    onYes={handleYes}
  />;
};

const ChooseQuoteDialogComponent: FC = () => {
  const { openDialog } = useDialogManager();

  const handleWeiter = () => {
    openDialog(QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY);
  };

  return <ChooseOfferDialog onWeiter={handleWeiter} />;
};

const ChooseSalesOpportunityDialogComponent: FC = () => {
  const { openDialog } = useDialogManager();

  const handleWeiter = (selectedChance: SaleChance) => {
    openDialog(QUOTE_DIALOGS.QUOTE_AS_NEW_VARIANT);
  };

  return (
    <ChooseSalesOpportunityDialog
      data={saleChancesData}
      onWeiter={handleWeiter}
    />
  );
};

const QuoteAsNewVariantDialogComponent: FC<{
  fromVariantSelection?: boolean;
}> = ({ fromVariantSelection }) => {
  const { openDialog } = useDialogManager();

  const handleJa = () => {
    openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE);
  };

  const handleNein = () => {
    openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_VARIANT, { isCreatingNewVersion: true });
  };

  return <OfferAsNewVariantDialog onJa={handleJa} onNein={handleNein} />;
};

const ChooseQuoteLanguageDialogComponent: FC<{ onCreateQuote: () => Promise<any> }> = ({
  onCreateQuote
}) => {
  const { closeDialog } = useDialogManager();

  const handleErstellen = async () => {
    try {
      await onCreateQuote();
      closeDialog();
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  return (
    <ChooseOfferLanguageDialog
      onErstellen={handleErstellen}
    />
  );
};

const ChooseQuoteVariantDialogComponent: FC<{
  isCreatingNewVersion?: boolean;
}> = ({ isCreatingNewVersion = false }) => {
  const { openDialog } = useDialogManager();

  const handleCreate = (identifier: any) => {
    openDialog(QUOTE_DIALOGS.CONFIRM_OVERWRITE_VARIANT, {
      variantIdentifier: identifier,
    });
  };

  return (
    <ChooseOfferVariantDialog
      onCreate={handleCreate}
      header={
        isCreatingNewVersion
          ? 'Zu welcher Angebotsvariante soll eine neue Version erstellt werden?'
          : undefined
      }
    />
  );
};

const ConfirmOverwriteVariantDialogComponent: FC<{ onCreateQuote: () => Promise<any> }> = ({
  onCreateQuote
}) => {
  const { closeDialog } = useDialogManager();

  const handleConfirm = async () => {
    try {
      await onCreateQuote();
      closeDialog();
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  return (
    <ConfirmOverwriteVariantDialog
      offerNumber="ANG-2023-0001"
      variantIdentifier="V2"
      onConfirm={handleConfirm}
    />
  );
};

const VersionsForQuoteVariantDialogComponent: FC<{
  dialogData?: { quoteNumber: string; variantIdentifier: string };
}> = ({ dialogData }) => {
  if (!dialogData) return null;
  
  return (
    <VersionsForOfferVariantDialog
      offerNumber={dialogData.quoteNumber}
      variantIdentifier={dialogData.variantIdentifier}
    />
  );
};

// Dialog configuration for DialogRenderer
const createQuoteDialogComponents = (onCreateQuote: () => Promise<any>) => [
  { id: QUOTE_DIALOGS.NEW_QUOTE, component: NewQuoteDialogComponent },
  { id: QUOTE_DIALOGS.CHOOSE_QUOTE, component: ChooseQuoteDialogComponent },
  { id: QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY, component: ChooseSalesOpportunityDialogComponent },
  { id: QUOTE_DIALOGS.QUOTE_AS_NEW_VARIANT, component: QuoteAsNewVariantDialogComponent },
  { 
    id: QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE, 
    component: (dialogProps: any) => <ChooseQuoteLanguageDialogComponent onCreateQuote={onCreateQuote} />
  },
  { id: QUOTE_DIALOGS.CHOOSE_QUOTE_VARIANT, component: ChooseQuoteVariantDialogComponent },
  { 
    id: QUOTE_DIALOGS.CONFIRM_OVERWRITE_VARIANT, 
    component: (dialogProps: any) => <ConfirmOverwriteVariantDialogComponent onCreateQuote={onCreateQuote} />
  },
  { 
    id: QUOTE_DIALOGS.VERSIONS_FOR_QUOTE_VARIANT, 
    component: (dialogProps: any) => <VersionsForQuoteVariantDialogComponent dialogData={dialogProps} />
  },
];

// Main component with dialog management
const QuoteDialogs: FC<QuoteDialogsProps> = ({ onCreateQuote, children }) => {
  return (
    <DialogManagerProvider>
      {children}
      <DialogRenderer dialogs={createQuoteDialogComponents(onCreateQuote)} />
    </DialogManagerProvider>
  );
};

export default QuoteDialogs;
export { useDialogManager }; 