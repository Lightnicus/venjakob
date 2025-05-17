'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OfferVariantsTable } from '@/project_components/offer-variants-table';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';
import { useState } from 'react';

interface ChooseOfferVariantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onBack: () => void;
  onCreate: () => void;
  header?: string;
}

export function ChooseOfferVariantDialog({
  open,
  onOpenChange,
  onCancel,
  onBack,
  onCreate,
  header = "Angebotsvariante auswählen"
}: ChooseOfferVariantProps) {
  const { openNewTab } = useTabbedInterface();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!selectedVariantId) return;
    
    // Call the original onCreate callback
    onCreate();
    
    // Open a new tab with OfferDetail
    const tabId = `offer-${Date.now()}`;
    openNewTab({
      id: tabId,
      title: "Neues Angebot",
      content: <OfferDetail title="Neues Angebot" variantId={selectedVariantId} />,
      closable: true
    });
    
    // Close the dialog
    onOpenChange(false);
  };

  const handleSelectionChange = (id: string | null) => {
    setSelectedVariantId(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99%] min-w-[99%]">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-auto my-4">
          <OfferVariantsTable showActions={false} onSelectionChange={handleSelectionChange} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            aria-label="Abbrechen"
            tabIndex={0}
          >
            Abbrechen
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            aria-label="Zurück"
            tabIndex={0}
          >
            Zurück
          </Button>
          <Button 
            onClick={handleCreate} 
            aria-label="Erstellen" 
            tabIndex={0}
            disabled={!selectedVariantId}
          >
            Erstellen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
