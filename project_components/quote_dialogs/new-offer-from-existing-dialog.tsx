import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from './dialog-manager';

type NewOfferFromExistingDialogProps = {
  onNo?: () => void;
  onYes?: () => void;
};

const NewOfferFromExistingDialog: FC<NewOfferFromExistingDialogProps> = ({ 
  onNo, 
  onYes
}) => {
  const { closeDialog } = useDialogManager();

  const footer = (
    <>
      <Button variant="outline" onClick={onNo}>
        Nein
      </Button>
      <Button onClick={onYes}>
        Ja
      </Button>
    </>
  );

  return (
    <ManagedDialog 
      title="Angebot erstellen"
      footer={footer}
      showCloseButton={true}
      showBackButton={true}
    >
      <div className="text-base">
        Wollen Sie ein bereits existierendes Angebot kopieren?
      </div>
    </ManagedDialog>
  );
};

export default NewOfferFromExistingDialog; 