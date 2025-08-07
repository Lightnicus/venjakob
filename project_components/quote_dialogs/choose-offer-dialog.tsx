import { ManagedDialog } from '@/project_components/managed-dialog';
import QuotesListTable from '@/project_components/quotes-list-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FC, useState, useEffect } from 'react';
import { useDialogManager } from './dialog-manager';
import type { Language } from '@/lib/db/schema';
import { fetchLanguages } from '@/lib/api/blocks';
import { fetchVariantsList } from '@/lib/api/quotes';
import { LoadingIndicator } from '@/project_components/loading-indicator';

type VariantListItem = {
  id: string;
  quoteId: string;
  quoteNumber: string | null;
  quoteTitle: string | null;
  variantNumber: number;
  variantDescriptor: string;
  languageId: string;
  languageLabel: string | null;
  salesOpportunityStatus: string | null;
  clientForeignId: string | null;
  clientName: string | null;
  latestVersionNumber: number;
  lastModifiedBy: string | null;
  lastModifiedByUserName: string | null;
  lastModifiedAt: string;
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
};

type ChooseOfferDialogProps = {
  onWeiter?: (selectedVariant?: VariantListItem) => void;
};

const ChooseOfferDialog: FC<ChooseOfferDialogProps> = ({ 
  onWeiter 
}) => {
  const [selectedVariant, setSelectedVariant] = useState<VariantListItem | null>(null);
  const [variants, setVariants] = useState<VariantListItem[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const { closeDialog } = useDialogManager();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [variantsData, languagesData] = await Promise.all([
          fetchVariantsList(),
          fetchLanguages()
        ]);
        setVariants(variantsData);
        setLanguages(languagesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleWeiter = () => {
    if (onWeiter && selectedVariant) {
      onWeiter(selectedVariant);
    } else {
      closeDialog();
    }
  };

  const footer = (
    <Button 
      type="button" 
      aria-label="Weiter" 
      disabled={!selectedVariant}
      onClick={handleWeiter}
    >
      Weiter
    </Button>
  );

  return (
    <ManagedDialog 
      title="Angebot auswählen"
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
      className="max-w-[99%] min-w-[99%]"
    >
      <div className="flex justify-end mb-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox aria-label="Zeige alle Versionen an" tabIndex={0} />
          <span className="text-sm">Zeige alle Versionen an</span>
        </label>
      </div>
      <div className="py-2">
        {loading || variants.length === 0 ? (
          <LoadingIndicator 
            text="Lade Angebote..." 
            variant="centered" 
            size="md"
          />
        ) : (
          <QuotesListTable 
            data={variants}
            languages={languages}
            onSaveQuoteProperties={async () => {}}
            onDeleteVariant={async () => {}}
            onCreateQuote={async () => variants[0]}
            onCopyVariant={async () => variants[0]}
            reducedMode={true}
            onVariantSelect={setSelectedVariant}
          />
        )}
      </div>
    </ManagedDialog>
  );
};

export default ChooseOfferDialog; 