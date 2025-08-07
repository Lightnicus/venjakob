import { FC, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { LoadingIndicator } from '@/project_components/loading-indicator';
import { useDialogManager } from './dialog-manager';
import SalesOpportunitiesTable, {
  SaleChance,
} from '@/project_components/sale-opportunities-table';

type ChooseSalesOpportunityDialogProps = {
  data?: SaleChance[];
  onWeiter?: (selectedChance: SaleChance) => void;
  isLoading?: boolean;
};

const ChooseSalesOpportunityDialog: FC<ChooseSalesOpportunityDialogProps> = ({
  data = [],
  onWeiter,
  isLoading = false,
}) => {
  const [selectedChance, setSelectedChance] = useState<SaleChance | null>(null);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
  const { closeDialog } = useDialogManager();

  // Filter data based on checkbox state
  const filteredData = useMemo(() => {
    if (showAllOpportunities) {
      return data;
    }
    return data.filter(opportunity => opportunity.angebote === 0);
  }, [data, showAllOpportunities]);

  // Check if selected chance is still valid after filtering
  const isValidSelection = useMemo(() => {
    if (!selectedChance) return false;
    if (showAllOpportunities) {
      // When showing all, only allow selection of opportunities without quotes
      return selectedChance.angebote === 0;
    }
    // When filtered, any selected chance is valid
    return filteredData.some(item => item.titel === selectedChance.titel);
  }, [selectedChance, showAllOpportunities, filteredData]);

  const handleRowSelect = (chance: SaleChance) => {
    // Only allow selection of opportunities without quotes
    if (chance.angebote === 0) {
      setSelectedChance(chance);
    }
  };

  const handleWeiter = () => {
    if (selectedChance && isValidSelection && onWeiter) {
      onWeiter(selectedChance);
    } else {
      closeDialog();
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setShowAllOpportunities(checked);
    // Clear selection when switching filter modes
    setSelectedChance(null);
  };

  const footer = (
    <Button
      type="button"
      aria-label="Weiter"
      disabled={!selectedChance || !isValidSelection || isLoading}
      onClick={handleWeiter}
    >
      Weiter
    </Button>
  );

  // Get dialog title based on filter state
  const getDialogTitle = () => {
    if (isLoading) {
      return 'Verkaufschance auswählen';
    }
    if (showAllOpportunities) {
      return `Verkaufschance auswählen (${filteredData.length} verfügbar)`;
    }
    return `Verkaufschance ohne Angebote auswählen (${filteredData.length} verfügbar)`;
  };

  return (
    <ManagedDialog
      title={getDialogTitle()}
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
      className="max-w-[99%] min-w-[99%]"
    >
      <div className="flex justify-end mb-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox 
            checked={showAllOpportunities}
            onCheckedChange={handleCheckboxChange}
            disabled={isLoading}
            aria-label="Zeige alle Verkaufschancen an" 
            tabIndex={0} 
          />
          <span className="text-sm">Zeige alle Verkaufschancen an</span>
        </label>
      </div>
      <div className="py-2">
        {isLoading ? (
          <LoadingIndicator 
            text="Verkaufschancen werden geladen..." 
            variant="centered" 
            size="md"
          />
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            {showAllOpportunities 
              ? 'Keine Verkaufschancen verfügbar.'
              : 'Es sind derzeit keine Verkaufschancen ohne Angebote verfügbar.'
            }
          </div>
        ) : (
          <SalesOpportunitiesTable
            data={filteredData}
            reducedMode
            showSelectionRadio
            onRowSelect={handleRowSelect}
            selectedChance={isValidSelection ? selectedChance : null}
          />
        )}
      </div>
    </ManagedDialog>
  );
};

export default ChooseSalesOpportunityDialog;
