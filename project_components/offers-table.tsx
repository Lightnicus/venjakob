'use client';

import * as React from 'react';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Row,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Edit, FileText, Trash, Check, Square } from 'lucide-react';
import offersData from '@/data/offers.json';
import { useTabbedInterface } from './tabbed-interface-provider';
import OfferDetail from './offer-detail';
import { FilterableTable, DateFilterConfig } from './filterable-table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

type Offer = {
  id: string;
  checked: boolean;
  offerNumber: string;
  offer: string;
  vcStatus: string;
  customerNumber: string;
  recipient: string;
  location: string;
  gb: string;
  amount: string;
  version: string;
  published: boolean;
  responsible: string;
  modifiedBy: string;
  modifiedOn: string;
};

export interface OffersTableProps {
  reducedMode?: boolean;
  selectMode?: boolean;
  onOpenVersionsDialog?: (offerNumber: string, variantIdentifier: string) => void;
  onSelectOffer?: (offer: Offer) => void;
}

// Context to provide offers to header
const OffersTableOffersContext = React.createContext<any[] | undefined>(undefined);

export function OffersTable({ 
  reducedMode = false,
  selectMode = false, 
  onOpenVersionsDialog,
  onSelectOffer 
}: OffersTableProps) {
  const [offers, setOffers] = React.useState<Offer[]>(offersData);
  const [selectedOfferId, setSelectedOfferId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();

  const toggleCheckbox = (id: string) => {
    setOffers(
      offers.map(offer => {
        if (offer.id === id) {
          return { ...offer, checked: !offer.checked };
        }
        return offer;
      }),
    );
  };

  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    if (onSelectOffer) {
      const selectedOffer = offers.find(offer => offer.id === offerId);
      if (selectedOffer) {
        onSelectOffer(selectedOffer);
      }
    }
  };

  const handleRowClick = (row: Row<Offer>) => {
    if (selectMode) {
      handleSelectOffer(row.original.id);
    }
  };

  const handleOfferNumberClick = (offerNumber: string) => {
    if (onOpenVersionsDialog) {
      const selectedOffer = offers.find(offer => offer.offerNumber === offerNumber);
      const variantIdentifier = selectedOffer?.version?.split(' ')[0] || 'A';
      onOpenVersionsDialog(offerNumber, variantIdentifier);
    }
  };

  const handleOfferNameClick = (offer: Offer) => {
    openNewTab({
      id: `split-panel-demo-${offer.id}`,
      title: `Angebot ${offer.offer}`,
      content: <OfferDetail title={offer.offer} />,
      closable: true,
    });
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter(o => o.id !== id));
    setConfirmDeleteId(null);
    toast('Angebot gelöscht');
  };

  // Unique values for dropdowns
  const responsibleOptions = React.useMemo(() => [
    ...Array.from(new Set(offers.map(o => o.responsible))).sort()
  ], [offers]);
  const modifiedByOptions = React.useMemo(() => [
    ...Array.from(new Set(offers.map(o => o.modifiedBy))).sort()
  ], [offers]);

  const columns = React.useMemo<ColumnDef<Offer>[]>(() => [
    ...(selectMode ? [
      {
        id: 'select',
        header: () => <div className="pl-4">Auswahl</div>,
        cell: ({ row }: { row: Row<Offer> }) => (
          <div className="pl-4">
            <RadioGroupItem
              value={row.original.id}
              id={`select-${row.original.id}`}
              checked={selectedOfferId === row.original.id}
              onClick={() => handleSelectOffer(row.original.id)}
              aria-label={`Angebot ${row.original.offer} auswählen`}
            />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      }
    ] : []),
    {
      accessorKey: 'offerNumber',
      header: () => (
        <div className="flex items-center gap-1">
          Angebote-Nr.
        </div>
      ),
      cell: ({ row }: { row: Row<Offer> }) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          tabIndex={0}
          onClick={() => handleOfferNumberClick(row.original.offerNumber)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleOfferNumberClick(row.original.offerNumber);
          }}
          aria-label={`Versionen für Angebot ${row.original.offerNumber} anzeigen`}
        >
          {row.original.offerNumber}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'checked',
      header: () => 'Angen.',
      cell: ({ row }: { row: Row<Offer> }) => row.original.id === '3' ? (
        <Check className="h-5 w-5 text-green-600" aria-label="Ausgewählt" tabIndex={0} />
      ) : (
        <Square className="h-5 w-5 text-gray-400" aria-label="Nicht ausgewählt" tabIndex={0} />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'offer',
      header: () => (
        <div className="flex items-center gap-1">
          Angebot
        </div>
      ),
      cell: ({ row }: { row: Row<Offer> }) => (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          tabIndex={0}
          onClick={() => handleOfferNameClick(row.original)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleOfferNameClick(row.original);
          }}
          aria-label={`Baumansicht für ${row.original.offer} öffnen`}
        >
          {row.original.offer}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      {
        accessorKey: 'vcStatus',
        header: () => (
          <div className="flex items-center gap-1">VC-Status</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'customerNumber',
        header: () => (
          <div className="flex items-center gap-1">KdNr</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ] : []),
    {
      accessorKey: 'recipient',
      header: () => (
        <div className="flex items-center gap-1">Kunde</div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }: { row: Row<Offer> }) => (
        <span className="text-blue-600 hover:underline">{row.original.recipient}</span>
      ),
    },
    ...(!reducedMode ? [
      {
        accessorKey: 'location',
        header: () => (
          <div className="flex items-center gap-1">Ort</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ] : []),
    {
      accessorKey: 'gb',
      header: () => (
        <div className="flex items-center gap-1">GB</div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'amount',
      header: () => (
        <div className="flex items-center gap-1">Betrag</div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      {
        accessorKey: 'version',
        header: () => (
          <div className="flex items-center gap-1">Version</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      // {
      //   accessorKey: 'published',
      //   header: () => <Checkbox />,
      //   cell: ({ row }: { row: Row<Offer> }) => <Checkbox checked={row.original.published} />,
      //   enableSorting: false,
      //   enableColumnFilter: false,
      // },
    ] : []),
    {
      accessorKey: 'responsible',
      header: ({ column }: { column: any }) => (
        <div className="flex flex-row items-center gap-2 min-w-[180px]">
          <span>Verantwortlich VC</span>
          <select
            className="h-6 flex-1 appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm"
            value={column.getFilterValue() ?? ''}
            onChange={e => column.setFilterValue(e.target.value || undefined)}
            aria-label="Verantwortlich VC filtern"
          >
            <option value="">Alle</option>
            {responsibleOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ),
      cell: ({ row }: { row: Row<Offer> }) => (
        <span className="min-w-[180px] w-[200px] block">{row.original.responsible}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      {
        accessorKey: 'modifiedBy',
        header: ({ column }: { column: any }) => (
          <div className="flex flex-row items-center gap-2 min-w-[180px]">
            <span>Geändert von</span>
            <select
              className="h-6 flex-1 appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm"
              value={column.getFilterValue() ?? ''}
              onChange={e => column.setFilterValue(e.target.value || undefined)}
              aria-label="Geändert von filtern"
            >
              <option value="">Alle</option>
              {modifiedByOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ),
        cell: ({ row }: { row: Row<Offer> }) => (
          <span className="min-w-[180px] w-[200px] block">{row.original.modifiedBy}</span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ] : []),
    {
      accessorKey: 'modifiedOn',
      header: 'Geändert am',
      cell: ({ row }: { row: Row<Offer> }) => (
        <span className="min-w-[180px] w-[200px] block">{row.original.modifiedOn}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      {
        id: 'actions',
        header: () => 'Aktionen',
        cell: ({ row }: { row: Row<Offer> }) => (
          <div className="flex items-center gap-1">
            <button className="rounded p-1 hover:bg-gray-100 cursor-pointer" onClick={() => handleOfferNameClick(row.original)} aria-label="Bearbeiten" tabIndex={0}>
              <Edit className="h-4 w-4" />
            </button>
            <button 
              className="rounded p-1 hover:bg-gray-100 cursor-pointer" 
              aria-label="PDF anzeigen" 
              tabIndex={0}
              onClick={() => window.open('/dummy.pdf', '_blank')}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button 
              className="rounded p-1 hover:bg-gray-100 cursor-pointer" 
              aria-label="Kopieren" 
              tabIndex={0}
              onClick={() => toast("Angebot kopiert")}
            >
              <Copy className="h-4 w-4" />
            </button>
            <button 
              className="rounded p-1 hover:bg-gray-100 cursor-pointer" 
              aria-label="Löschen" 
              tabIndex={0}
              onClick={() => setConfirmDeleteId(row.original.id)}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ] : []),
  ], [reducedMode, responsibleOptions, modifiedByOptions, selectMode, selectedOfferId, handleSelectOffer]);

  const getRowClassName = (row: Row<Offer>) => {
    let classes = [];
    
    if (selectMode) {
      classes.push('cursor-pointer hover:bg-blue-50/50');
      if (selectedOfferId === row.original.id) {
        classes.push('bg-blue-50');
      }
    } else if (row.original.checked) {
      classes.push('bg-blue-50');
    }
    
    return classes.join(' ');
  };

  // Define date filter configurations
  const dateFilterConfigs: Record<string, DateFilterConfig> = {
    modifiedOn: {
      dateFieldPath: 'modifiedOn',
    }
  };

  return (
    <RadioGroup value={selectedOfferId || ""}>
      <FilterableTable
        data={offers}
        columns={columns}
        filterColumn="offer"
        filterPlaceholder="Filtern nach Angebot..."
        getRowClassName={getRowClassName}
        contextValue={offers}
        ContextProvider={OffersTableOffersContext.Provider}
        dateFilterColumns={dateFilterConfigs}
        onRowClick={handleRowClick}
      />
      <DeleteConfirmationDialog
        open={!!confirmDeleteId}
        onOpenChange={open => !open && setConfirmDeleteId(null)}
        onConfirm={() => handleDeleteOffer(confirmDeleteId!)}
        description="Möchten Sie das Angebot wirklich löschen?"
      />
    </RadioGroup>
  );
}
