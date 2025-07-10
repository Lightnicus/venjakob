'use client';

import { Button } from '@/components/ui/button';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from './dialog-manager';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';

type ConfirmOverwriteVariantProps = {
  offerNumber: string;
  variantIdentifier: string;
  onConfirm: () => void;
};

export function ConfirmOverwriteVariantDialog({
  offerNumber,
  variantIdentifier,
  onConfirm,
}: ConfirmOverwriteVariantProps) {
  const { openNewTab } = useTabbedInterface();

  const handleConfirm = () => {
    // Open a new tab with OfferDetail
    const tabId = `offer-${Date.now()}`;
    openNewTab({
      id: tabId,
      title: 'Neues Angebot',
      content: (
        <OfferDetail title="Neues Angebot" variantId={variantIdentifier} />
      ),
      closable: true,
    });

    onConfirm();
  };

  const footer = (
    <Button onClick={handleConfirm} aria-label="Ja" tabIndex={0}>
      Ja
    </Button>
  );

  return (
    <ManagedDialog
      title="Angebotsvariante überschreiben?"
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
    >
      <div className="text-base">
        Ihre aktuellen Bearbeitungen in Angebotsvariante {offerNumber}-
        {variantIdentifier} werden überschrieben. Wollen Sie fortfahren?
      </div>
    </ManagedDialog>
  );
}
