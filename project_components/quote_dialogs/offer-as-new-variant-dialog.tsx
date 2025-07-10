import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from './dialog-manager';

type OfferAsNewVariantDialogProps = {
  onNein?: () => void;
  onJa?: () => void;
};

const OfferAsNewVariantDialog: FC<OfferAsNewVariantDialogProps> = ({
  onNein,
  onJa
}) => {
  const { closeDialog } = useDialogManager();

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label="Nein"
        onClick={onNein || closeDialog}
      >
        Nein
      </Button>
      <Button
        type="button"
        aria-label="Ja"
        onClick={onJa || closeDialog}
      >
        Ja
      </Button>
    </>
  );

  return (
    <ManagedDialog 
      title="Angebot als neue Variante?"
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
    >
      <div className="text-base">
        Soll das Angebot als neue Variante erstellt werden?
      </div>
    </ManagedDialog>
  );
};

export default OfferAsNewVariantDialog;
