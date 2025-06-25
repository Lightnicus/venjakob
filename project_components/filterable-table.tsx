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
  getPaginationRowModel,
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
import { CalendarIcon, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  // Drag & Drop props
  enableDragSort?: boolean;
  sortField?: keyof TData;
  onDragSortEnd?: (reorderedData: TData[]) => void;
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

// SortableRow component for drag and drop
const SortableTableRow: React.FC<{
  row: Row<any>;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  enableDragSort: boolean;
}> = ({ row, children, className, onClick, onKeyDown, tabIndex, enableDragSort }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String((row.original as any).id),
    disabled: !enableDragSort,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!enableDragSort) {
    return (
      <TableRow 
        className={className}
        onClick={onClick}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
      >
        {children}
      </TableRow>
    );
  }

  return (
    <TableRow 
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...attributes}
    >
      <TableCell className="p-2 cursor-grab active:cursor-grabbing" {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
      </TableCell>
      {children}
    </TableRow>
  );
};

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
  enableDragSort = false,
  sortField,
  onDragSortEnd,
}: FilterableTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const [internalData, setInternalData] = React.useState<TData[]>(data);

  // Update internal data when external data changes
  React.useEffect(() => {
    let updatedData = [...data];
    
    // If drag sort is enabled, sort by the sort field
    if (enableDragSort && sortField) {
      updatedData = updatedData.sort((a, b) => {
        const aValue = (a as any)[sortField] || 0;
        const bValue = (b as any)[sortField] || 0;
        return aValue - bValue;
      });
    }
    
    setInternalData(updatedData);
  }, [data, enableDragSort, sortField]);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for sorting
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && enableDragSort && sortField) {
      const sortedData = [...internalData].sort((a, b) => {
        const aValue = (a as any)[sortField] || 0;
        const bValue = (b as any)[sortField] || 0;
        return aValue - bValue;
      });

      const oldIndex = sortedData.findIndex(item => String((item as any).id) === String(active.id));
      const newIndex = sortedData.findIndex(item => String((item as any).id) === String(over?.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(sortedData, oldIndex, newIndex);
        
        // Update the sort field values
        const updatedItems = reorderedItems.map((item, index) => ({
          ...item,
          [sortField]: index + 1,
        }));

        // Update all internal data, not just the sorted subset
        const newInternalData = internalData.map(item => {
          const updatedItem = updatedItems.find(updated => (updated as any).id === (item as any).id);
          return updatedItem || item;
        });
        
        setInternalData(newInternalData);

        // Call parent callback with only the reordered items
        if (onDragSortEnd) {
          onDragSortEnd(updatedItems);
        }
      }
    }
  };

  const columns = React.useMemo(() => {
    let processedColumns = initialColumns.map(colDef => {
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

    // Add drag handle column if drag sort is enabled
    if (enableDragSort) {
      processedColumns = [
        {
          id: 'drag-handle',
          header: '',
          cell: () => null, // Rendered in SortableTableRow
          enableSorting: false,
          enableGlobalFilter: false,
        },
        ...processedColumns,
      ];
    }

    return processedColumns;
  }, [initialColumns, globalFilterColumnIds, enableDragSort]);

  const table = useReactTable({
    data: internalData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableDragSort ? getCoreRowModel() : getSortedRowModel(), // Disable sorting when drag sort is enabled
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  const tableContent = (
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
                          data={internalData}
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
          <SortableTableRow
            key={row.id}
            row={row}
            className={getRowClassName ? getRowClassName(row) : ''}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onRowClick(row);
              }
            }}
            enableDragSort={enableDragSort}
          >
            {row.getVisibleCells().map((cell: Cell<TData, unknown>) => {
              // Skip rendering drag handle cell content as it's handled in SortableTableRow
              if (enableDragSort && cell.column.id === 'drag-handle') {
                return null;
              }
              return (
                <TableCell key={cell.id} className={cellClassName}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </SortableTableRow>
        ))}
      </TableBody>
    </Table>
  );

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
      
      {enableDragSort ? (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={table.getRowModel().rows.map(row => String((row.original as any).id))}
            strategy={verticalListSortingStrategy}
          >
            {tableContent}
          </SortableContext>
        </DndContext>
      ) : (
        tableContent
      )}
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>{table.getFilteredSelectedRowModel().rows.length} von {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.</span>
          )}
          {table.getFilteredSelectedRowModel().rows.length === 0 && (
            <span>Zeige {table.getRowModel().rows.length} von {table.getFilteredRowModel().rows.length} Einträgen</span>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Vorherige Seite"
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Nächste Seite"
            >
              Weiter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (ContextProvider && contextValue) {
    return <ContextProvider value={contextValue}>{content}</ContextProvider>;
  }

  return content;
} 