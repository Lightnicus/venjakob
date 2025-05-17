import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from '@/project_components/dialog-manager';
import SalesOpportunitiesTable, {
  SaleChance,
} from '@/project_components/sale-opportunities-table';

type ChooseSalesOpportunityDialogProps = {
  data?: SaleChance[];
  onWeiter?: (selectedChance: SaleChance) => void;
};

const ChooseSalesOpportunityDialog: FC<ChooseSalesOpportunityDialogProps> = ({
  data = [],
  onWeiter,
}) => {
  const [selectedChance, setSelectedChance] = useState<SaleChance | null>(null);
  const { closeDialog } = useDialogManager();

  const handleRowSelect = (chance: SaleChance) => {
    setSelectedChance(chance);
  };

  const handleWeiter = () => {
    if (selectedChance && onWeiter) {
      onWeiter(selectedChance);
    } else {
      closeDialog();
    }
  };

  const footer = (
    <Button
      type="button"
      aria-label="Weiter"
      disabled={!selectedChance}
      onClick={handleWeiter}
    >
      Weiter
    </Button>
  );

  return (
    <ManagedDialog
      title="Verkaufschance auswählen"
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
      className="max-w-[99%] min-w-[99%]"
    >
      <div className="flex justify-end mb-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox aria-label="Zeige alle Verkaufschancen an" tabIndex={0} />
          <span className="text-sm">Zeige alle Verkaufschancen an</span>
        </label>
      </div>
      <div className="py-2">
        <SalesOpportunitiesTable
          data={data}
          reducedMode
          showSelectionRadio
          onRowSelect={handleRowSelect}
          selectedChance={selectedChance}
        />
      </div>
    </ManagedDialog>
  );
};

export default ChooseSalesOpportunityDialog;
