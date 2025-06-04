'use client';

import React, { useState, useEffect } from 'react';
import { Edit, FileText, Copy, Trash, Check, X as XIcon } from 'lucide-react';
import { FilterableTable } from '@/project_components/filterable-table';
import { ColumnDef } from '@tanstack/react-table';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';
import PdfPreview from '@/project_components/pdf-preview';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import { Button } from '@/components/ui/button';

export type SalesOpportunityOffer = {
  offerNumber: string;
  accepted: boolean;
  amount: string;
  version: string;
  published: boolean;
  modifiedBy: string;
  modifiedOn: string;
};

type Props = {
  data: SalesOpportunityOffer[];
};

const SalesOpportunityOffers = ({ data }: Props) => {
  const { openNewTab } = useTabbedInterface();
  const [offersList, setOffersList] = useState<SalesOpportunityOffer[]>(data);
  const [offerToDelete, setOfferToDelete] =
    useState<SalesOpportunityOffer | null>(null);

  useEffect(() => {
    setOffersList(data);
  }, [data]);

  const handleEditOffer = (offer: SalesOpportunityOffer) => {
    openNewTab({
      id: `offer-detail-${offer.offerNumber}-${Date.now()}`, // Ensure unique ID
      title: `Angebot ${offer.offerNumber}`,
      content: <OfferDetail title={offer.offerNumber} />,
      closable: true,
    });
  };

  const handleShowPdf = (offer: SalesOpportunityOffer) => {
    openNewTab({
      id: `offer-pdf-${offer.offerNumber}-${Date.now()}`,
      title: `Vorschau ${offer.offerNumber}`,
      content: <PdfPreview file="/dummy.pdf" />,
      closable: true,
    });
  };

  const handleCopyOffer = (offer: SalesOpportunityOffer) => {
    toast.success('Angebot wurde kopiert');
    openNewTab({
      id: `offer-detail-copy-${offer.offerNumber}-${Date.now()}`,
      title: `Kopie von Angebot ${offer.offerNumber}`,
      content: <OfferDetail title={`Kopie von ${offer.offerNumber}`} />,
      closable: true,
    });
  };

  const handleInitiateDelete = (offer: SalesOpportunityOffer) => {
    setOfferToDelete(offer);
  };

  const handleConfirmDelete = () => {
    if (offerToDelete) {
      setOffersList(prevOffers =>
        prevOffers.filter(o => o.offerNumber !== offerToDelete.offerNumber),
      );
      toast.success(`Angebot ${offerToDelete.offerNumber} wurde gelöscht.`);
      setOfferToDelete(null);
    }
  };

  const columns: ColumnDef<SalesOpportunityOffer>[] = [
    {
      accessorKey: 'offerNumber',
      header: 'Angebots-Nr.',
    },
    {
      accessorKey: 'accepted',
      header: 'Angen.',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.accepted ? (
            <Check
              className="h-5 w-5 text-green-600"
              aria-label="Angenommen"
              tabIndex={0}
            />
          ) : (
            <XIcon
              className="h-5 w-5 text-gray-400"
              aria-label="Nicht angenommen"
              tabIndex={0}
            />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Betrag',
    },
    {
      accessorKey: 'version',
      header: 'Version',
    },
    {
      accessorKey: 'published',
      header: 'Veröffentlicht',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.published ? (
            <Check
              className="h-5 w-5 text-green-600"
              aria-label="Veröffentlicht"
              tabIndex={0}
            />
          ) : (
            <XIcon
              className="h-5 w-5 text-gray-400"
              aria-label="Nicht veröffentlicht"
              tabIndex={0}
            />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'modifiedBy',
      header: 'Geändert von',
    },
    {
      accessorKey: 'modifiedOn',
      header: 'Geändert am',
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Bearbeiten"
            onClick={() => handleEditOffer(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Anzeigen"
            onClick={() => handleShowPdf(row.original)}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Kopieren"
            onClick={() => handleCopyOffer(row.original)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Löschen"
            onClick={() => handleInitiateDelete(row.original)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <FilterableTable
        data={offersList}
        columns={columns}
        tableClassName="w-full border"
        cellClassName="border p-2"
        headerClassName="border p-2 text-left cursor-pointer select-none bg-gray-50"
        globalFilterColumnIds={['offerNumber']}
        filterPlaceholder="Angebots-Nr. filtern..."
        dateFilterColumns={{
          modifiedOn: {
            dateFieldPath: 'modifiedOn',
          },
        }}
      />
      <DeleteConfirmationDialog
        open={!!offerToDelete}
        onOpenChange={isOpen => !isOpen && setOfferToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Angebot löschen"
        description={`Möchten Sie das Angebot "${offerToDelete?.offerNumber || ''}" wirklich löschen?`}
      />
    </>
  );
};

export default SalesOpportunityOffers;
