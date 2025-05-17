'use client';

import { Edit, FileText, Copy, Trash, Check, X as XIcon } from 'lucide-react';
import { FilterableTable } from '@/project_components/filterable-table';
import { ColumnDef } from '@tanstack/react-table';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import OfferDetail from '@/project_components/offer-detail';
import PdfPreview from '@/project_components/pdf-preview';

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

  const columns: ColumnDef<SalesOpportunityOffer>[] = [
    {
      accessorKey: 'offerNumber',
      header: 'Angebots-Nr.'
    },
    {
      accessorKey: 'accepted',
      header: 'Angen.',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.accepted ? (
            <Check className="h-5 w-5 text-green-600" aria-label="Angenommen" tabIndex={0} />
          ) : (
            <XIcon className="h-5 w-5 text-gray-400" aria-label="Nicht angenommen" tabIndex={0} />
          )}
        </div>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Betrag'
    },
    {
      accessorKey: 'version',
      header: 'Version'
    },
    {
      accessorKey: 'published',
      header: 'Veröffentlicht',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.published ? (
            <Check className="h-5 w-5 text-green-600" aria-label="Veröffentlicht" tabIndex={0} />
          ) : (
            <XIcon className="h-5 w-5 text-gray-400" aria-label="Nicht veröffentlicht" tabIndex={0} />
          )}
        </div>
      )
    },
    {
      accessorKey: 'modifiedBy',
      header: 'Geändert von'
    },
    {
      accessorKey: 'modifiedOn',
      header: 'Geändert am'
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            aria-label="Bearbeiten"
            tabIndex={0}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            onClick={() => handleEditOffer(row.original)}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            aria-label="Anzeigen"
            tabIndex={0}
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            onClick={() => handleShowPdf(row.original)}
          >
            <FileText className="h-4 w-4" />
          </button>
          <button aria-label="Kopieren" tabIndex={0} className="cursor-pointer rounded p-1 hover:bg-gray-100">
            <Copy className="h-4 w-4" />
          </button>
          <button aria-label="Löschen" tabIndex={0} className="cursor-pointer rounded p-1 hover:bg-gray-100">
            <Trash className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <FilterableTable
      data={data}
      columns={columns}
      tableClassName="w-full border"
      cellClassName="border p-2"
      headerClassName="border p-2 text-left cursor-pointer select-none bg-gray-50"
      filterColumn="offerNumber"
      filterPlaceholder="Angebots-Nr. filtern..."
      dateFilterColumns={{
        modifiedOn: {
          dateFieldPath: 'modifiedOn'
        }
      }}
    />
  );
};

export default SalesOpportunityOffers; 