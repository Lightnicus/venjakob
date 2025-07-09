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
import { fetchQuotesList } from '@/lib/api/quotes';
import { useLoading } from '@/project_components/loading-provider';
import { toast } from 'sonner';

// Dialog IDs
export const QUOTE_DIALOGS = {
  SMART_ENTRY: 'smart-entry',
  NEW_QUOTE: 'new-quote',
  CHOOSE_QUOTE: 'choose-quote',
  CHOOSE_SALES_OPPORTUNITY: 'choose-sales-opportunity',
  QUOTE_AS_NEW_VARIANT: 'quote-as-new-variant',
  CHOOSE_QUOTE_LANGUAGE: 'choose-quote-language',
  CHOOSE_QUOTE_VARIANT: 'choose-quote-variant',
  CONFIRM_OVERWRITE_VARIANT: 'confirm-overwrite-variant',
  VERSIONS_FOR_QUOTE_VARIANT: 'versions-for-quote-variant',
};

// Data availability interface
interface DataAvailability {
  hasExistingQuotes: boolean;
  hasSalesOpportunities: boolean;
  hasQuoteVariants: boolean;
  isLoading: boolean;
}

interface QuoteDialogsProps {
  onCreateQuote: () => Promise<any>;
  children: React.ReactNode;
}

// Smart Entry Point Component
const SmartEntryDialogComponent: FC = () => {
  const { replaceDialog } = useDialogManager();
  const { setLoading } = useLoading();

  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        setLoading('quote-creation-routing', true);
        
        const [quotesData, salesOppsData] = await Promise.all([
          fetchQuotesList().catch(() => []),
          fetchSalesOpportunitiesList().catch(() => []),
        ]);

        const hasExistingQuotes = quotesData.length > 0;
        const hasSalesOpportunities = salesOppsData.length > 0;

        // No sales opportunities = can't create quotes
        if (!hasSalesOpportunities) {
          toast.error('Keine Verkaufschancen verfügbar. Bitte erstellen Sie zuerst eine Verkaufschance.');
          return;
        }

        // No existing quotes = skip "copy from existing" question
        if (!hasExistingQuotes) {
          replaceDialog(QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY);
          return;
        }

        // Has both = show choice dialog
        replaceDialog(QUOTE_DIALOGS.NEW_QUOTE);
      } catch (error) {
        console.error('Error checking data availability:', error);
        toast.error('Fehler beim Überprüfen der verfügbaren Daten');
      } finally {
        setLoading('quote-creation-routing', false);
      }
    };

    checkDataAvailability();
  }, []); // Empty dependency array to run only once

  // This component just routes using global loading state, doesn't render anything
  return null;
};

// Dialog Components
const NewQuoteDialogComponent: FC<{
  dialogData?: any;
}> = ({ dialogData }) => {
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

const ChooseQuoteDialogComponent: FC<{
  dialogData?: any;
}> = ({ dialogData }) => {
  const { openDialog } = useDialogManager();

  const handleWeiter = (selectedQuote?: any) => {
    // When copying from existing quote, we still need to select sales opportunity
    // but we can pass the selected quote context
    openDialog(QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY, { 
      selectedQuote: selectedQuote,
      isCopyingFromExisting: true 
    });
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

const ChooseSalesOpportunityDialogComponent: FC<{
  dialogData?: { 
    selectedQuote?: any; 
    isCopyingFromExisting?: boolean;
  };
}> = ({ dialogData }) => {
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

  // Context-aware routing based on selected sales opportunity and flow context
  const handleWeiter = (selectedChance: SaleChance) => {
    const hasExistingQuotes = selectedChance.angebote > 0;
    const isCopyingFromExisting = dialogData?.isCopyingFromExisting ?? false;
    
    if (isCopyingFromExisting) {
      // User is copying from existing quote -> go to language selection
      openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE, { 
        selectedSalesOpportunity: selectedChance,
        selectedQuote: dialogData?.selectedQuote,
        isCopyingFromExisting: true 
      });
    } else if (!hasExistingQuotes) {
      // No existing quotes for this sales opportunity -> skip to language selection
      openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE, { 
        selectedSalesOpportunity: selectedChance,
        skipVariantQuestion: true 
      });
    } else {
      // Has existing quotes -> ask if user wants to create variant or new version
      openDialog(QUOTE_DIALOGS.QUOTE_AS_NEW_VARIANT, { 
        selectedSalesOpportunity: selectedChance,
        hasExistingQuotes: true 
      });
    }
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
  dialogData?: { 
    selectedSalesOpportunity?: SaleChance; 
    hasExistingQuotes?: boolean;
  };
}> = ({ fromVariantSelection, dialogData }) => {
  const { openDialog } = useDialogManager();

  const handleJa = () => {
    // Creating new variant -> go to language selection
    openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE, { 
      selectedSalesOpportunity: dialogData?.selectedSalesOpportunity,
      isNewVariant: true 
    });
  };

  const handleNein = () => {
    // Creating new version of existing variant -> check if variants exist for this sales opportunity
    const hasExistingQuotes = dialogData?.hasExistingQuotes ?? false;
    
    if (!hasExistingQuotes) {
      // No existing quotes -> show message and redirect to create variant
      toast.info('Keine vorhandenen Angebote für neue Version. Erstelle stattdessen eine neue Variante.');
      handleJa();
    } else {
      // Has existing quotes -> show variant selection
      openDialog(QUOTE_DIALOGS.CHOOSE_QUOTE_VARIANT, { 
        isCreatingNewVersion: true,
        selectedSalesOpportunity: dialogData?.selectedSalesOpportunity 
      });
    }
  };

  return <OfferAsNewVariantDialog onJa={handleJa} onNein={handleNein} />;
};

const ChooseQuoteLanguageDialogComponent: FC<{ 
  onCreateQuote: () => Promise<any>;
  dialogData?: { 
    selectedSalesOpportunity?: SaleChance; 
    skipVariantQuestion?: boolean;
    isNewVariant?: boolean;
  };
}> = ({ onCreateQuote, dialogData }) => {
  const { closeDialog } = useDialogManager();

  const handleErstellen = async () => {
    try {
      // Pass the sales opportunity context to the create function if needed
      // This could be enhanced to pass selectedSalesOpportunity.id to the API
      await onCreateQuote();
      closeDialog();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Fehler beim Erstellen des Angebots');
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
  dialogData?: { 
    selectedSalesOpportunity?: SaleChance;
  };
}> = ({ isCreatingNewVersion = false, dialogData }) => {
  const { openDialog } = useDialogManager();

  const handleCreate = (identifier: any) => {
    openDialog(QUOTE_DIALOGS.CONFIRM_OVERWRITE_VARIANT, {
      variantIdentifier: identifier,
      selectedSalesOpportunity: dialogData?.selectedSalesOpportunity,
    });
  };

  // Context-aware header based on sales opportunity
  const getContextualHeader = () => {
    if (isCreatingNewVersion) {
      const salesOppName = dialogData?.selectedSalesOpportunity?.titel || 'dieser Verkaufschance';
      return `Zu welcher Angebotsvariante von "${salesOppName}" soll eine neue Version erstellt werden?`;
    }
    return undefined;
  };

  return (
    <ChooseOfferVariantDialog
      onCreate={handleCreate}
      header={getContextualHeader()}
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
  { id: QUOTE_DIALOGS.SMART_ENTRY, component: SmartEntryDialogComponent },
  { 
    id: QUOTE_DIALOGS.NEW_QUOTE, 
    component: (dialogProps: any) => <NewQuoteDialogComponent dialogData={dialogProps} />
  },
  { 
    id: QUOTE_DIALOGS.CHOOSE_QUOTE, 
    component: (dialogProps: any) => <ChooseQuoteDialogComponent dialogData={dialogProps} />
  },
  { 
    id: QUOTE_DIALOGS.CHOOSE_SALES_OPPORTUNITY, 
    component: (dialogProps: any) => <ChooseSalesOpportunityDialogComponent dialogData={dialogProps} />
  },
  { 
    id: QUOTE_DIALOGS.QUOTE_AS_NEW_VARIANT, 
    component: (dialogProps: any) => <QuoteAsNewVariantDialogComponent dialogData={dialogProps} />
  },
  { 
    id: QUOTE_DIALOGS.CHOOSE_QUOTE_LANGUAGE, 
    component: (dialogProps: any) => <ChooseQuoteLanguageDialogComponent onCreateQuote={onCreateQuote} dialogData={dialogProps} />
  },
  { 
    id: QUOTE_DIALOGS.CHOOSE_QUOTE_VARIANT, 
    component: (dialogProps: any) => <ChooseQuoteVariantDialogComponent dialogData={dialogProps} isCreatingNewVersion={dialogProps?.isCreatingNewVersion} />
  },
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