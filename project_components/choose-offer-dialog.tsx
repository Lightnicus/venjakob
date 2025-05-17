import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { OffersTable } from '@/project_components/offers-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FC, useState } from 'react';

type Offer = {
  id: string;
  [key: string]: any;
};

type ChooseOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAbbrechen?: () => void;
  onZurueck?: () => void;
  onWeiter?: (selectedOffer?: Offer) => void;
};

const ChooseOfferDialog: FC<ChooseOfferDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAbbrechen, 
  onZurueck, 
  onWeiter 
}) => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const handleWeiter = () => {
    if (onWeiter && selectedOffer) {
      onWeiter(selectedOffer);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99%] min-w-[99%]" aria-label="Angebot auswählen">
        <DialogHeader>
          <DialogTitle>Angebot auswählen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end mb-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox aria-label="Zeige alle Versionen an" tabIndex={0} />
            <span className="text-sm">Zeige alle Versionen an</span>
          </label>
        </div>
        <div className="py-2">
          <OffersTable 
            reducedMode 
            selectMode 
            onSelectOffer={setSelectedOffer} 
          />
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button 
              type="button" 
              variant="outline" 
              aria-label="Abbrechen" 
              onClick={() => {
                if (onAbbrechen) onAbbrechen();
                else onOpenChange(false);
              }}
            >
              Abbrechen
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              aria-label="Zurück" 
              onClick={() => {
                if (onZurueck) onZurueck();
                else onOpenChange(false);
              }}
            >
              Zurück
            </Button>
            <Button 
              type="button" 
              aria-label="Weiter" 
              disabled={!selectedOffer}
              onClick={handleWeiter}
            >
              Weiter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseOfferDialog; 