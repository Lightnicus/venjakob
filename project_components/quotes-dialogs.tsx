import { FC, useState, useEffect } from 'react';
import {
  DialogManagerProvider,
  DialogRenderer,
  useDialogManager,
} from '@/project_components/dialog-manager';
import NewOfferFromExistingDialog from '@/project_components/new-offer-from-existing-dialog';
import ChooseOfferDialog from '@/project_components/choose-offer-dialog';
import ChooseSalesOpportunityDialog from '@/project_components/choose-sales-opportunity-dialog';
import OfferAsNewVariantDialog from '@/project_components/offer-as-new-variant-dialog';
import ChooseOfferLanguageDialog from '@/project_components/choose-offer-language-dialog';
import { ChooseOfferVariantDialog } from '@/project_components/choose-offer-variant-dialog';
import { ConfirmOverwriteVariantDialog } from '@/project_components/confirm-overwrite-variant-dialog';
import { VersionsForOfferVariantDialog } from '@/project_components/versions-for-offer-variant-dialog';
import { SaleChance } from '@/project_components/sale-opportunities-table';
import { fetchSalesOpportunitiesList, type SalesOpportunityListItem } from '@/lib/api/sales-opportunities';
import { toast } from 'sonner';

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

// Transform database data to SaleChance format
const transformSalesOpportunityToSaleChance = (item: SalesOpportunityListItem): SaleChance => {
  // Format date from ISO string to German format (DD.MM.YYYY)
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('de-DE');
    } catch {
      return '';
    }
  };

  return {
    titel: item.keyword || item.clientName || 'Unbekannt',
    kunde: item.clientName,
    verantwortlicher: item.salesRepresentativeName || '',
    status: item.status,
    gb: item.businessArea || '',
    volumen: item.quoteVolume || '',
    liefertermin: '', // Not available in current API, could be enhanced
    geaendertAm: formatDate(item.updatedAt),
    angebote: item.quotesCount,
  };
};

const ChooseSalesOpportunityDialogComponent: FC = () => {
  const { openDialog } = useDialogManager();
  const [salesOpportunities, setSalesOpportunities] = useState<SaleChance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sales opportunities data
  const loadSalesOpportunities = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSalesOpportunitiesList();
      const transformedData = data.map(transformSalesOpportunityToSaleChance);
      setSalesOpportunities(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Verkaufschancen';
      toast.error(errorMessage);
      setSalesOpportunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadSalesOpportunities();
  }, []);

  const handleWeiter = (selectedChance: SaleChance) => {
    openDialog(QUOTE_DIALOGS.QUOTE_AS_NEW_VARIANT);
  };

  if (isLoading) {
    return (
      <ChooseSalesOpportunityDialog
        data={[]}
        onWeiter={handleWeiter}
      />
    );
  }

  return (
    <ChooseSalesOpportunityDialog
      data={salesOpportunities}
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