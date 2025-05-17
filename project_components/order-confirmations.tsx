import * as React from 'react';
import type {
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { Edit, FileText, Copy, Trash } from 'lucide-react';
import Link from 'next/link';
import { FilterableTable, type DateFilterConfig } from './filterable-table';

export type OrderConfirmation = {
  abNumber: string;
  opportunity: string;
  customerNumber: string;
  customer: string;
  location: string;
  gb: string;
  amount: string;
  version: string;
  responsible: string;
  modifiedBy: string;
  modifiedOn: string;
};

type Props = {
  data: OrderConfirmation[];
};

const OrderConfirmations = ({ data }: Props) => {
  // Dropdown options
  const responsibleOptions = React.useMemo(() => Array.from(new Set(data.map(d => d.responsible))).sort(), [data]);
  const modifiedByOptions = React.useMemo(() => Array.from(new Set(data.map(d => d.modifiedBy))).sort(), [data]);

  // Function to get valid dates for the 'modifiedOn' filter
  const getValidDatesForModifiedOn = React.useCallback((tableData: OrderConfirmation[]): Date[] => {
    const dateStrings = new Set<string>();
    tableData.forEach(d => {
      if (d.modifiedOn && typeof d.modifiedOn === 'string') {
        dateStrings.add(d.modifiedOn);
      }
    });

    return Array.from(dateStrings)
      .map((dateStr: string) => {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // month is 1-indexed in string
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month - 1, day); // month is 0-indexed for Date constructor
          }
        }
        return null;
      })
      .filter((date): date is Date => date instanceof Date && !isNaN(date.getTime()));
  }, []);

  const columns = React.useMemo<ColumnDef<OrderConfirmation>[]>(() => [
    { accessorKey: 'abNumber', header: 'AB-Nr.', enableSorting: true, enableColumnFilter: true,
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <Link href="#" tabIndex={0} aria-label={`Details zu AB ${row.original.abNumber}`} className="text-blue-600 hover:underline cursor-pointer">{row.original.abNumber}</Link>
      ) },
    { accessorKey: 'opportunity', header: 'Verkaufschance', enableSorting: true, enableColumnFilter: true,
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <Link href="#" tabIndex={0} aria-label={`Verkaufschance ${row.original.opportunity}`} className="text-blue-600 hover:underline cursor-pointer">{row.original.opportunity}</Link>
      ) },
    { accessorKey: 'customerNumber', header: 'KdNr', enableSorting: true, enableColumnFilter: true },
    { accessorKey: 'customer', header: 'Kunde', enableSorting: true, enableColumnFilter: true,
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <Link href="#" tabIndex={0} aria-label={`Kunde ${row.original.customer}`} className="text-blue-600 hover:underline cursor-pointer">{row.original.customer}</Link>
      ) },
    { accessorKey: 'location', header: 'Ort', enableSorting: true, enableColumnFilter: true },
    { accessorKey: 'gb', header: 'GB', enableSorting: true, enableColumnFilter: true },
    { accessorKey: 'amount', header: 'Betrag', enableSorting: true, enableColumnFilter: true },
    { accessorKey: 'version', header: 'Version', enableSorting: true, enableColumnFilter: true },
    { accessorKey: 'responsible',
      header: ({ column }: { column: any }) => (
        <div className="flex flex-row items-center gap-2 min-w-[150px]">
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
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <span className="min-w-[150px] block">{row.original.responsible}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    { accessorKey: 'modifiedBy',
      header: ({ column }: { column: any }) => (
        <div className="flex flex-row items-center gap-2 min-w-[150px]">
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
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <span className="min-w-[150px] block">{row.original.modifiedBy}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    { accessorKey: 'modifiedOn',
      header: 'Geändert am',
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <span className="min-w-[150px] block">{row.original.modifiedOn}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    { id: 'aktionen', header: 'Aktionen',
      cell: ({ row }: { row: Row<OrderConfirmation> }) => (
        <div className="flex gap-2">
          <button aria-label="Bearbeiten" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
            <Edit className="h-4 w-4" />
          </button>
          <button aria-label="Anzeigen" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
            <FileText className="h-4 w-4" />
          </button>
          <button aria-label="Kopieren" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
            <Copy className="h-4 w-4" />
          </button>
          <button aria-label="Löschen" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [responsibleOptions, modifiedByOptions, getValidDatesForModifiedOn]);

  const dateFilterConfigForModifiedOn: DateFilterConfig = {
    getValidDates: getValidDatesForModifiedOn,
    dateFieldPath: 'modifiedOn',
  };

  return (
    <FilterableTable<OrderConfirmation>
      data={data}
      columns={columns}
      dateFilterColumns={{ modifiedOn: dateFilterConfigForModifiedOn }}
    />
  );
};

export default OrderConfirmations; 