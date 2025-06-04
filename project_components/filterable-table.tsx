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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DateFilterConfig {
  getValidDates?: (data: any[]) => Date[];
  formatDate?: (date: Date) => string;
  dateFieldPath?: string;
}

export interface FilterableTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  defaultSorting?: SortingState;
  defaultColumnFilters?: ColumnFiltersState;
  filterPlaceholder?: string;
  globalFilterColumnIds?: string[];
  getRowClassName?: (row: Row<TData>) => string;
  tableClassName?: string;
  cellClassName?: string;
  headerClassName?: string;
  contextValue?: any;
  ContextProvider?: React.FC<{ value: any; children: React.ReactNode }>;
  dateFilterColumns?: Record<string, DateFilterConfig>;
  onRowClick?: (row: Row<TData>) => void;
}

function DateFilterHeader<TData>({ 
  column, 
  title, 
  data, 
  config = {}
}: { 
  column: any; 
  title: string;
  data: TData[];
  config: DateFilterConfig;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const filterValue = column.getFilterValue();
  
  // Default date formatter (DD.MM.YYYY with leading zeros)
  const formatDate = config.formatDate || ((date: Date) => 
    date
      ? `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${date.getFullYear()}`
      : '');
  
  const handleReset = () => {
    setSelectedDate(undefined);
    column.setFilterValue(undefined);
    setOpen(false);
  };
  
  // Get valid dates from data either using provided function or by extracting from data
  const validDates = React.useMemo(() => {
    if (config.getValidDates) {
      return config.getValidDates(data);
    }
    
    // Default implementation - extract dates from data using dateFieldPath if provided
    if (!config.dateFieldPath) return [];
    
    const uniqueDateStrings = new Set<string>();
    
    // Extract date strings from nested path if provided
    data.forEach(item => {
      const parts = config.dateFieldPath?.split('.');
      let value = item as any;
      
      if (parts) {
        for (const part of parts) {
          if (value && typeof value === 'object') {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
      }
      
      if (value && typeof value === 'string') {
        uniqueDateStrings.add(value);
      }
    });
    
    // Convert strings to Date objects
    return Array.from(uniqueDateStrings)
      .filter(Boolean)
      .map(dateStr => {
        const [day, month, year] = dateStr.split('.');
        return new Date(Number(year), Number(month) - 1, Number(day));
      });
  }, [data, config]);
  
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
      <span>{title}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Datum wählen"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
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
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleReset}
          >
            Filter zurücksetzen
          </Button>
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
}

export function FilterableTable<TData>({
  data,
  columns: initialColumns,
  defaultSorting = [],
  defaultColumnFilters = [],
  filterPlaceholder = "Filtern...",
  globalFilterColumnIds,
  getRowClassName,
  tableClassName = "w-full border",
  cellClassName = "border p-2",
  headerClassName = "border p-2 text-left cursor-pointer select-none",
  contextValue,
  ContextProvider,
  dateFilterColumns = {},
  onRowClick,
}: FilterableTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const columns = React.useMemo(() => {
    return initialColumns.map(colDef => {
      let enableGlobally = true; 
      if (globalFilterColumnIds && globalFilterColumnIds.length > 0) {
        const effectiveId = colDef.id ?? (typeof (colDef as any).accessorKey === 'string' ? (colDef as any).accessorKey : undefined);
        enableGlobally = effectiveId ? globalFilterColumnIds.includes(effectiveId) : false;
      }
      return {
        ...colDef,
        enableGlobalFilter: enableGlobally,
      };
    });
  }, [initialColumns, globalFilterColumnIds]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const content = (
    <div className="overflow-x-auto w-full">
      <div className="flex items-center py-4">
        <input
          placeholder={filterPlaceholder}
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm border rounded px-2 py-1"
          aria-label={filterPlaceholder}
        />
      </div>
      <Table className={tableClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<TData, unknown>) => {
                const isSortable = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                let sortIcon = null;
                if (isSortable) {
                  if (sortState === 'asc') sortIcon = <span className="ml-1">▲</span>;
                  else if (sortState === 'desc') sortIcon = <span className="ml-1">▼</span>;
                  else sortIcon = <span className="ml-1">⇅</span>;
                }
                
                // Check if this column has a date filter
                const columnId = header.column.id;
                const isDateFilter = columnId in dateFilterColumns;
                
                return (
                  <TableHead
                    key={header.id}
                    className={headerClassName}
                    onClick={isSortable && !isDateFilter ? header.column.getToggleSortingHandler() : undefined}
                    aria-sort={sortState ? (sortState === 'asc' ? 'ascending' : 'descending') : 'none'}
                    tabIndex={isSortable && !isDateFilter ? 0 : undefined}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTableCellElement>) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isSortable && !isDateFilter) {
                        header.column.toggleSorting();
                      }
                    }}
                  >
                    <span className="flex items-center">
                      {isDateFilter ? (
                        <DateFilterHeader 
                          column={header.column}
                          title={header.column.columnDef.header as string || columnId}
                          data={data}
                          config={dateFilterColumns[columnId]}
                        />
                      ) : (
                        <>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && sortIcon}
                        </>
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row: Row<TData>) => (
            <TableRow 
              key={row.id} 
              className={getRowClassName ? getRowClassName(row) : ''}
              onClick={() => onRowClick?.(row)}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(row);
                }
              }}
            >
              {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                <TableCell key={cell.id} className={cellClassName}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (ContextProvider && contextValue) {
    return <ContextProvider value={contextValue}>{content}</ContextProvider>;
  }

  return content;
} 