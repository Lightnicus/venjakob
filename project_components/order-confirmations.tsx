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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Edit, FileText, Copy, Trash } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';

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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Dropdown options
  const responsibleOptions = React.useMemo(() => Array.from(new Set(data.map(d => d.responsible))).sort(), [data]);
  const modifiedByOptions = React.useMemo(() => Array.from(new Set(data.map(d => d.modifiedBy))).sort(), [data]);
  // Valid dates for Geändert am
  const validDates = React.useMemo(() =>
    Array.from(new Set(data.map(d => d.modifiedOn)))
      .filter(Boolean)
      .map((d: string) => {
        const [day, month, year] = d.split('.');
        return new Date(Number(year), Number(month) - 1, Number(day));
      }),
    [data]
  );
  const isDateEnabled = (date: Date) =>
    validDates.some(
      d =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );

  // Calendar header component
  const ModifiedOnHeader = ({ column }: { column: any }) => {
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
    const filterValue = column.getFilterValue();
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
    return (
      <div className="flex items-center gap-2 min-w-[150px]">
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
      header: ModifiedOnHeader,
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
  ], [responsibleOptions, modifiedByOptions, validDates]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<OrderConfirmation>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<OrderConfirmation, unknown>) => {
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
                    onKeyDown={e => {
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
          {table.getRowModel().rows.map((row: Row<OrderConfirmation>) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell: Cell<OrderConfirmation, unknown>) => (
                <TableCell key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderConfirmations; 