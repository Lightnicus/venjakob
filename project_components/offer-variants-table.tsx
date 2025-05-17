'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Calendar,
  Check,
  Edit,
  FileText,
  Search,
  Square,
  Trash,
} from 'lucide-react';
import offerVariantsData from '@/data/offer-variants.json';
import { FilterableTable, DateFilterConfig } from './filterable-table';
import type { ColumnDef, Row } from '@tanstack/react-table';

type OfferVariant = {
  id: string;
  checked: boolean;
  offerNumber: string;
  accepted: boolean;
  salesOpportunity: string;
  customer: string;
  language: string;
  gb: string;
  amount: string;
  version: string;
  published: boolean;
  createdBy: string;
  modifiedOn: string;
};

interface OfferVariantsTableProps {
  showActions?: boolean;
  onSelectionChange?: (id: string | null) => void;
}

export function OfferVariantsTable({ 
  showActions = true, 
  onSelectionChange 
}: OfferVariantsTableProps) {
  const [offerVariants, setOfferVariants] =
    useState<OfferVariant[]>(offerVariantsData.map(variant => ({
      ...variant,
      checked: false
    })));
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const selectVariant = (id: string) => {
    const newSelectedId = id === selectedVariantId ? null : id;
    setSelectedVariantId(newSelectedId);
    setOfferVariants(
      offerVariants.map(variant => ({
        ...variant,
        checked: variant.id === id && id !== selectedVariantId
      }))
    );
    if (onSelectionChange) {
      onSelectionChange(newSelectedId);
    }
  };

  const columns = useMemo<ColumnDef<OfferVariant>[]>(
    () => [
      {
        id: 'select',
        header: () => <span className="sr-only">Auswählen</span>,
        cell: ({ row }: { row: Row<OfferVariant> }) => (
          <div className="flex items-center justify-center">
            <RadioGroupItem 
              value={row.original.id}
              checked={row.original.checked}
              onClick={() => selectVariant(row.original.id)}
              aria-label="Auswählen"
            />
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'offerNumber',
        header: () => (
          <div className="flex items-center gap-1">Angebots-Nr.</div>
        ),
        cell: ({ row }: { row: Row<OfferVariant> }) => (
          <span className="text-blue-600 hover:underline">
            {row.original.offerNumber}
          </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'accepted',
        header: () => 'Angen.',
        cell: ({ row }: { row: Row<OfferVariant> }) =>
          row.original.accepted ? (
            <Check
              className="h-5 w-5 text-green-600"
              aria-label="Angenommen"
              tabIndex={0}
            />
          ) : (
            <Square
              className="h-5 w-5 text-gray-400"
              aria-label="Nicht angenommen"
              tabIndex={0}
            />
          ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'salesOpportunity',
        header: () => (
          <div className="flex items-center gap-1">Verkaufschance</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'customer',
        header: () => <div className="flex items-center gap-1">Kunde</div>,
        cell: ({ row }: { row: Row<OfferVariant> }) => (
          <span className="text-blue-600 hover:underline">
            {row.original.customer}
          </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'language',
        header: () => <div className="flex items-center gap-1">Sprache</div>,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'gb',
        header: () => <div className="flex items-center gap-1">GB</div>,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'amount',
        header: () => <div className="flex items-center gap-1">Betrag</div>,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'version',
        header: () => <div className="flex items-center gap-1">Version</div>,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'published',
        header: () => 'Veröffentlicht',
        cell: ({ row }: { row: Row<OfferVariant> }) => (
          <Checkbox
            checked={row.original.published}
            disabled
            aria-label={
              row.original.published ? 'Veröffentlicht' : 'Nicht veröffentlicht'
            }
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'createdBy',
        header: () => (
          <div className="flex items-center gap-1">
            Erstellt von
            <div className="relative inline-block">
              <select className="h-6 w-full appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm">
                <option>Alle</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'modifiedOn',
        header: 'Geändert am',
        enableSorting: true,
        enableColumnFilter: true,
      },
      ...(showActions ? [
        {
          id: 'actions',
          header: () => 'Aktionen',
          cell: ({ row }: { row: Row<OfferVariant> }) => (
            <div className="flex items-center gap-1">
              <button
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Bearbeiten"
                tabIndex={0}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Details anzeigen"
                tabIndex={0}
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Löschen"
                tabIndex={0}
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          ),
          enableSorting: false,
          enableColumnFilter: false,
        }
      ] : []),
    ],
    [showActions],
  );

  // Define date filter configurations
  const dateFilterConfigs: Record<string, DateFilterConfig> = {
    modifiedOn: {
      dateFieldPath: 'modifiedOn',
    }
  };

  const getRowClassName = (row: Row<OfferVariant>) => {
    const isChecked = row.original.checked;
    return `${isChecked ? 'bg-blue-50' : ''} cursor-pointer hover:bg-blue-100`;
  };

  return (
    <RadioGroup value={selectedVariantId || undefined} onValueChange={selectVariant}>
      <FilterableTable
        data={offerVariants}
        columns={columns}
        filterColumn="offerNumber"
        filterPlaceholder="Filtern nach Angebots-Nr..."
        getRowClassName={getRowClassName}
        tableClassName="w-full border"
        headerClassName="border p-2 text-left bg-gray-50 cursor-pointer select-none"
        dateFilterColumns={dateFilterConfigs}
        onRowClick={(row) => selectVariant(row.original.id)}
      />
    </RadioGroup>
  );
}
