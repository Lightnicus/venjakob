import { ManagedDialog } from '@/project_components/managed-dialog';
import { OffersTable } from '@/project_components/offers-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FC, useState } from 'react';
import { useDialogManager } from '@/project_components/dialog-manager';

type Offer = {
  id: string;
  [key: string]: any;
};

type ChooseOfferDialogProps = {
  onWeiter?: (selectedOffer?: Offer) => void;
};

const ChooseOfferDialog: FC<ChooseOfferDialogProps> = ({ 
  onWeiter 
}) => {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { closeDialog } = useDialogManager();

  const handleWeiter = () => {
    if (onWeiter && selectedOffer) {
      onWeiter(selectedOffer);
    } else {
      closeDialog();
    }
  };

  const footer = (
    <Button 
      type="button" 
      aria-label="Weiter" 
      disabled={!selectedOffer}
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
        <OffersTable 
          reducedMode 
          selectMode 
          onSelectOffer={setSelectedOffer} 
        />
      </div>
    </ManagedDialog>
  );
};

export default ChooseOfferDialog; 