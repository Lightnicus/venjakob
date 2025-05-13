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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Eye, Copy } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { useTabbedInterface } from './tabbed-interface-provider';
import { SalesOpportunityDetail, SalesOpportunityDetailData } from './sales-opportunity-detail';
import salesOpportunityDetailData from '@/data/sales-opportunity-detail.json';

export type SaleChance = {
  titel: string;
  kunde: string;
  verantwortlicher: string;
  status: string;
  gb: string;
  volumen: string;
  liefertermin: string;
  geaendertAm: string;
  angebote: number;
};

interface SaleChancesProps {
  data: SaleChance[];
  reducedMode?: boolean;
}

const SaleOpportunitiesTable = ({ data, reducedMode = false }: SaleChancesProps) => {
  const { openNewTab } = useTabbedInterface();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Dropdown options for Verantwortlicher
  const verantwortlicherOptions = React.useMemo(
    () => Array.from(new Set(data.map(d => d.verantwortlicher))).sort(),
    [data]
  );
  // Valid dates for Geändert am
  const validDates = React.useMemo(() =>
    Array.from(new Set(data.map(d => d.geaendertAm)))
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
  const GeaendertAmHeader = ({ column }: { column: any }) => {
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

  const columns = React.useMemo<ColumnDef<SaleChance>[]>(() => [
    {
      accessorKey: 'titel',
      header: 'Titel',
      cell: ({ row }: { row: Row<SaleChance> }) => (
        <Link
          href="#"
          tabIndex={0}
          aria-label={`Details zu ${row.original.titel}`}
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={e => {
            e.preventDefault();
            openNewTab({
              id: 'verkaufschance-details',
              title: 'Verkaufschance Details',
              content: <SalesOpportunityDetail data={salesOpportunityDetailData as SalesOpportunityDetailData} />,
              closable: true,
            });
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openNewTab({
                id: 'verkaufschance-details',
                title: 'Verkaufschance Details',
                content: <SalesOpportunityDetail data={salesOpportunityDetailData as SalesOpportunityDetailData} />,
                closable: true,
              });
            }
          }}
        >
          {row.original.titel}
        </Link>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'kunde',
      header: 'Kunde',
      cell: ({ row }: { row: Row<SaleChance> }) => (
        <span className="text-blue-600 hover:underline cursor-pointer">{row.original.kunde}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'verantwortlicher',
      header: ({ column }: { column: any }) => (
        <div className="flex flex-row items-center gap-2 min-w-[150px]">
          <span>Verantwortlicher</span>
          <select
            className="h-6 flex-1 appearance-none rounded border bg-white px-2 py-0 pr-8 text-sm"
            value={column.getFilterValue() ?? ''}
            onChange={e => column.setFilterValue(e.target.value || undefined)}
            aria-label="Verantwortlicher filtern"
          >
            <option value="">Alle</option>
            {verantwortlicherOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ),
      cell: ({ row }: { row: Row<SaleChance> }) => (
        <span className="min-w-[150px] block">{row.original.verantwortlicher}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      { accessorKey: 'gb', header: 'GB', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'volumen', header: 'Volumen', enableSorting: true, enableColumnFilter: true },
      { accessorKey: 'liefertermin', header: 'Liefertermin', enableSorting: true, enableColumnFilter: true },
    ] : []),
    {
      accessorKey: 'geaendertAm',
      header: GeaendertAmHeader,
      cell: ({ row }: { row: Row<SaleChance> }) => (
        <span className="min-w-[150px] block">{row.original.geaendertAm}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
    },
    ...(!reducedMode ? [
      {
        accessorKey: 'angebote',
        header: 'Angebote',
        cell: ({ row }: { row: Row<SaleChance> }) => (
          <span className="text-center block">{row.original.angebote}</span>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'aktion',
        header: 'Aktion',
        cell: ({ row }: { row: Row<SaleChance> }) => (
          <div className="flex gap-2">
            <button aria-label="Anzeigen" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
              <Eye className="h-4 w-4" />
            </button>
            <button aria-label="Kopieren" tabIndex={0} className="rounded p-1 hover:bg-gray-100">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ] : []),
  ], [openNewTab, reducedMode, verantwortlicherOptions, validDates]);

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
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<SaleChance>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<SaleChance, unknown>) => {
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
          {table.getRowModel().rows.map((row: Row<SaleChance>) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell: Cell<SaleChance, unknown>) => (
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

export default SaleOpportunitiesTable;
