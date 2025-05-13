'use client';

import * as React from 'react';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Copy, Edit, FileText, Search, Trash, Check, Square } from 'lucide-react';
import offersData from '@/data/offers.json';
import { useTabbedInterface } from './tabbed-interface-provider';
import TabbedSplitPanelDemo from '../demo/tabbed-split-panel-demo';
import InteractiveSplitPanel from './interactive-split-panel';
import OfferDetail from './offer-detail';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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
  onOpenVersionsDialog?: (offerNumber: string, variantIdentifier: string) => void;
}

// Context to provide offers to header
const OffersTableOffersContext = React.createContext<any[] | undefined>(undefined);

export function OffersTable({ 
  reducedMode = false, 
  onOpenVersionsDialog 
}: OffersTableProps) {
  const [offers, setOffers] = React.useState<Offer[]>(offersData);
  const { openNewTab } = useTabbedInterface();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [calendarPopoverOpen, setCalendarPopoverOpen] = React.useState(false);

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

  // Unique values for dropdowns
  const responsibleOptions = React.useMemo(() => [
    ...Array.from(new Set(offers.map(o => o.responsible))).sort()
  ], [offers]);
  const modifiedByOptions = React.useMemo(() => [
    ...Array.from(new Set(offers.map(o => o.modifiedBy))).sort()
  ], [offers]);

  const columns = React.useMemo<ColumnDef<Offer>[]>(() => [
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
      {
        accessorKey: 'published',
        header: () => <Checkbox />,
        cell: ({ row }: { row: Row<Offer> }) => <Checkbox checked={row.original.published} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
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
      header: ModifiedOnHeader,
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
            <button className="rounded p-1 hover:bg-gray-100"><Edit className="h-4 w-4" /></button>
            <button className="rounded p-1 hover:bg-gray-100"><FileText className="h-4 w-4" /></button>
            <button className="rounded p-1 hover:bg-gray-100"><Copy className="h-4 w-4" /></button>
            <button className="rounded p-1 hover:bg-gray-100"><Trash className="h-4 w-4" /></button>
                </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ] : []),
  ], [reducedMode, responsibleOptions, modifiedByOptions]);

  const table = useReactTable({
    data: offers,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <OffersTableOffersContext.Provider value={offers}>
      <div className="overflow-x-auto">
        <div className="flex items-center py-4">
          <input
            placeholder="Filtern nach Angebot..."
            value={(table.getColumn('offer')?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn('offer')?.setFilterValue(e.target.value)}
            className="max-w-sm border rounded px-2 py-1"
            aria-label="Angebot filtern"
          />
              </div>
        <Table className="w-full border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Offer>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<Offer, unknown>) => {
                  const isSortable = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  let sortIcon = null;
                  if (isSortable) {
                    if (sortState === 'asc') sortIcon = <span className="ml-1">▲</span>;
                    else if (sortState === 'desc') sortIcon = <span className="ml-1">▼</span>;
                    else sortIcon = <span className="ml-1">⇅</span>;
                  }
                  return (
                    <TableHead
                      key={header.id}
                      className="border p-2 text-left cursor-pointer select-none"
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      aria-sort={sortState ? (sortState === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={isSortable ? 0 : undefined}
                      onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => {
                        if ((e.key === 'Enter' || e.key === ' ') && isSortable) {
                          header.column.toggleSorting();
                        }
                      }}
                    >
                      <span className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && sortIcon}
                </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row: Row<Offer>) => (
              <TableRow key={row.id} className={row.original.checked ? 'bg-blue-50' : ''}>
                {row.getVisibleCells().map((cell: Cell<Offer, unknown>) => (
                  <TableCell key={cell.id} className="border p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </OffersTableOffersContext.Provider>
  );
}

const ModifiedOnHeader = ({ column }: { column: any }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const filterValue = column.getFilterValue();
  const offers = React.useContext(OffersTableOffersContext);
  // Always format as DD.MM.YYYY with leading zeros
  const formatDate = (date: Date) =>
    date
      ? `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${date.getFullYear()}`
      : '';
  const handleReset = () => {
    setSelectedDate(undefined);
    column.setFilterValue(undefined);
    setOpen(false);
  };
  // Get all unique valid dates from offers
  const validDates = React.useMemo(() => {
    if (!offers) return [];
    return Array.from(
      new Set(
        offers
          .map((o: any) => o.modifiedOn)
          .filter(Boolean)
      )
    ).map((d: string) => {
      const [day, month, year] = d.split('.');
      return new Date(Number(year), Number(month) - 1, Number(day));
    });
  }, [offers]);
  // Disable all dates except those in validDates
  const isDateEnabled = (date: Date) =>
    validDates.some(
      d =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <span>Geändert am</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-1 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Datum wählen"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date: Date | undefined) => {
              setSelectedDate(date ?? undefined);
              setOpen(false);
              if (date) {
                column.setFilterValue(formatDate(date));
              }
            }}
            initialFocus
            disabled={date => !isDateEnabled(date)}
          />
          <button
            type="button"
            className="mt-2 w-full rounded bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
            onClick={handleReset}
          >
            Filter zurücksetzen
          </button>
        </PopoverContent>
      </Popover>
      {filterValue && (
        <span
          className="ml-2 text-xs text-muted-foreground underline cursor-pointer hover:text-foreground"
          tabIndex={0}
          role="button"
          aria-label="Filter zurücksetzen"
          onClick={handleReset}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleReset();
          }}
        >
          {filterValue}
        </span>
      )}
    </div>
  );
};
