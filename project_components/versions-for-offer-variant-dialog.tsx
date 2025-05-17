'use client';

import { ManagedDialog } from '@/project_components/managed-dialog';
import OfferVersionsTable from '@/project_components/offer-versions-table';

type VersionsForOfferVariantProps = {
  offerNumber?: string;
  variantIdentifier?: string;
};

export function VersionsForOfferVariantDialog({
  offerNumber = 'ANG-2023-0001',
  variantIdentifier = 'A',
}: VersionsForOfferVariantProps) {
  return (
    <ManagedDialog
      title={`Versionen für Angebot ${offerNumber} - Variante ${variantIdentifier}`}
      showBackButton={false}
      showCloseButton={true}
      className="max-w-[90%] min-w-[80%]"
    >
      <OfferVersionsTable />
    </ManagedDialog>
  );
} 