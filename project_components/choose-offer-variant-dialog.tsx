'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { useDialogManager } from '@/project_components/dialog-manager';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';
import { OfferVariantsTable } from '@/project_components/offer-variants-table';

type ChooseOfferVariantProps = {
  onCreate?: (identifier: string | null) => void;
  header?: string;
};

export function ChooseOfferVariantDialog({
  onCreate,
  header = 'Angebotsvariante auswählen',
}: ChooseOfferVariantProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  const handleCreate = () => {
    if (!selectedVariantId) return;

    // Call the original onCreate callback
    if (onCreate) {
      onCreate(selectedVariantId);
    }
  };

  const handleSelectionChange = (id: string | null) => {
    setSelectedVariantId(id);
  };

  const footer = (
    <Button
      onClick={handleCreate}
      aria-label="Erstellen"
      tabIndex={0}
      disabled={!selectedVariantId}
    >
      Erstellen
    </Button>
  );

  return (
    <ManagedDialog
      title={header}
      footer={footer}
      showBackButton={true}
      showCloseButton={true}
      className="max-w-[99%] min-w-[99%]"
    >
      <div className="overflow-auto">
        <OfferVariantsTable
          showActions={false}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </ManagedDialog>
  );
}
