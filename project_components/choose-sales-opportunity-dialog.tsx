import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FC } from 'react';
import SaleOpportunitiesTable from './sale-opportunities-table';
import { SaleChance } from './sale-opportunities-table';

type ChooseSalesOpportunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SaleChance[];
  onAbbrechen?: () => void;
  onZurueck?: () => void;
  onWeiter?: () => void;
};

const ChooseSalesOpportunityDialog: FC<ChooseSalesOpportunityDialogProps> = ({
  open,
  onOpenChange,
  data,
  onAbbrechen,
  onZurueck,
  onWeiter,
}) => {
  console.log('props', open, onOpenChange, onAbbrechen, onZurueck, onWeiter);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[99%] min-w-[99%]"
        aria-label="Verkaufschance auswählen"
      >
        <DialogHeader>
          <DialogTitle>Verkaufschance auswählen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end mb-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox aria-label="Zeige alle Verkaufschancen an" tabIndex={0} />
            <span className="text-sm">Zeige alle Verkaufschancen an</span>
          </label>
        </div>
        <div className="py-2">
          <SaleOpportunitiesTable data={data} reducedMode />
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button
              type="button"
              variant="outline"
              aria-label="Abbrechen"
              onClick={() =>
                onAbbrechen ? onAbbrechen() : onOpenChange(false)
              }
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label="Zurück"
              onClick={() => (onZurueck ? onZurueck() : onOpenChange(false))}
            >
              Zurück
            </Button>
            <Button
              type="button"
              aria-label="Weiter"
              onClick={() => {
                console.log('Weiter clicked', onWeiter);
                onWeiter ? onWeiter() : onOpenChange(false);
              }}
            >
              Weiter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseSalesOpportunityDialog;
