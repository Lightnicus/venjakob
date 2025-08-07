import * as React from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import Link from 'next/link';
import { Eye, Copy } from 'lucide-react';
import { useTabbedInterface } from './tabbed-interface-provider';
import SalesOpportunityDetail from './sales-opportunity-detail';
import salesOpportunityDetailData from '@/data/sales-opportunity-detail.json';

export type SalesOpportunityDetailData = any; // Legacy type for backward compatibility
import { FilterableTable, DateFilterConfig } from './filterable-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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
  onRowSelect?: (chance: SaleChance) => void;
  selectedChance?: SaleChance | null;
  showSelectionRadio?: boolean;
}

const SalesOpportunitiesTable = ({
  data,
  reducedMode = false,
  onRowSelect,
  selectedChance,
  showSelectionRadio = true,
}: SaleChancesProps) => {
  const { openNewTab } = useTabbedInterface();
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<string>('');

  const handleOpenSalesOpportunityDetails = React.useCallback((titel: string) => {
    openNewTab({
      id: `verkaufschance-details-${titel.replace(/\s+/g, '-')}`,
      title: 'Verkaufschance Details',
      content: <div>Legacy Sales Opportunity Detail (deprecated)</div>,
      closable: true,
    });
  }, [openNewTab]);

  React.useEffect(() => {
    if (selectedRowIndex !== '' && onRowSelect) {
      const numericIndex = parseInt(selectedRowIndex, 10);
      if (numericIndex >= 0 && numericIndex < data.length) {
        const chance = data[numericIndex];
        // Only call onRowSelect if the opportunity has no quotes
        if (chance.angebote === 0) {
          onRowSelect(chance);
        }
      }
    }
  }, [selectedRowIndex, data, onRowSelect]);

  React.useEffect(() => {
    if (selectedChance) {
      // Attempt to find by reference first, then by a unique-ish property like titel
      let index = data.findIndex(item => item === selectedChance);
      if (index === -1) {
        index = data.findIndex(item => item.titel === selectedChance.titel);
      }
      
      if (index !== -1) {
        setSelectedRowIndex(index.toString());
      } else {
        // If not found (e.g. data changed), clear selection if current selectedChance is not in new data
        setSelectedRowIndex('');
      }
    } else {
      setSelectedRowIndex('');
    }
  }, [selectedChance, data]);

  const verantwortlicherOptions = React.useMemo(
    () => Array.from(new Set(data.map(d => d.verantwortlicher))).sort(),
    [data]
  );

  const dateFilterConfigForGeaendertAm: DateFilterConfig = React.useMemo(() => ({
    dateFieldPath: 'geaendertAm',
    getValidDates: (tableData: SaleChance[]) =>
      Array.from(new Set(tableData.map(d => d.geaendertAm)))
        .filter(Boolean)
        .map((d: string) => {
          const [day, month, year] = d.split('.');
          return new Date(Number(year), Number(month) - 1, Number(day));
        }),
  }), []); // Empty dependency array as the functions inside don't depend on component state/props directly, data is passed

  const columns = React.useMemo<ColumnDef<SaleChance>[]>(() => {
    const baseColumns: ColumnDef<SaleChance>[] = [
      {
        accessorKey: 'titel',
        header: 'Titel',
        cell: ({ row }: { row: Row<SaleChance> }) => {
          const isDisabled = row.original.angebote > 0;
          return (
            <Link
              href="#"
              tabIndex={isDisabled ? -1 : 0}
              aria-label={`Details zu ${row.original.titel} anzeigen`}
              className={`${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation(); // Prevent row click if link is interactive
                if (!isDisabled) {
                  handleOpenSalesOpportunityDetails(row.original.titel);
                }
              }}
              onKeyDown={e => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenSalesOpportunityDetails(row.original.titel);
                }
              }}
            >
              {row.original.titel}
            </Link>
          );
        },
        enableSorting: true,
        enableColumnFilter: true, // Assuming basic text filtering is desired
      },
      {
        accessorKey: 'kunde',
        header: 'Kunde',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'verantwortlicher',
        header: 'Verantwortlicher',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'gb',
        header: 'GB',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'volumen',
        header: 'Volumen',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'liefertermin',
        header: 'Liefertermin',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'geaendertAm',
        header: 'Geändert am',
        enableSorting: true,
        enableColumnFilter: true,
      },
      ...(!reducedMode ? [
        {
          accessorKey: 'angebote',
          header: 'Angebote',
          cell: ({ row }: { row: Row<SaleChance> }) => {
            const isDisabled = row.original.angebote > 0;
            return (
              <span className={`text-center block ${isDisabled ? 'text-gray-400' : ''}`}>
                {row.original.angebote}
              </span>
            );
          },
          enableSorting: true,
          enableColumnFilter: false, // Explicitly false if not filterable
        } as ColumnDef<SaleChance>,
        {
          id: 'aktion',
          header: 'Aktion',
          cell: ({ row }: { row: Row<SaleChance> }) => {
            const isDisabled = row.original.angebote > 0;
            return (
              <div className="flex gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label={`${row.original.titel} anzeigen`} 
                  disabled={isDisabled}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isDisabled) {
                      handleOpenSalesOpportunityDetails(row.original.titel);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenSalesOpportunityDetails(row.original.titel);
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label={`Aktion Kopieren für ${row.original.titel}`}
                  disabled={isDisabled}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isDisabled) {
                      /* TODO: Implement copy action */ console.log("Copy action for:", row.original.titel);
                      toast("Verkaufschance kopiert")
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            );
          },
          enableSorting: false,
          enableColumnFilter: false,
        } as ColumnDef<SaleChance>,
      ] : []),
    ];

    if (showSelectionRadio) {
      return [
        {
          id: 'select',
          header: () => <span className="sr-only">Auswahl</span>,
          cell: ({ row }: { row: Row<SaleChance> }) => {
            const isSelected = selectedRowIndex === row.index.toString();
            const isDisabled = row.original.angebote > 0;
            return (
              <div className="flex justify-center items-center h-full">
                <div
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Zeile ${row.original.titel} auswählen`}
                  tabIndex={-1} // Not focusable itself, row is focusable
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : isDisabled ? 'border-gray-300 bg-gray-100' : 'border-gray-400'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
              </div>
            );
          },
          enableSorting: false,
          enableColumnFilter: false,
          size: 40,
          minSize: 40,
          maxSize: 40,
        },
        ...baseColumns,
      ];
    }
    return baseColumns;
  }, [openNewTab, reducedMode, verantwortlicherOptions, selectedRowIndex, salesOpportunityDetailData, showSelectionRadio, handleOpenSalesOpportunityDetails]); // Add salesOpportunityDetailData if it's stable or memoize SalesOpportunityDetail component and showSelectionRadio

  const handleRowClick = (row: Row<SaleChance>) => {
    // Only allow selection if the opportunity has no quotes
    if (row.original.angebote === 0) {
      setSelectedRowIndex(row.index.toString());
    }
    // The useEffect for selectedRowIndex will call onRowSelect
  };

  const getRowClassName = (row: Row<SaleChance>) => {
    const isDisabled = row.original.angebote > 0;
    let className = isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';
    if (selectedRowIndex === row.index.toString()) {
      className += ' bg-blue-100 hover:bg-blue-200'; // More distinct selected style
    } else if (!isDisabled) {
      className += ' hover:bg-gray-50';
    }
    return className;
  };
  
  return (
    <FilterableTable<SaleChance>
      data={data}
      columns={columns}
      onRowClick={handleRowClick}
      getRowClassName={getRowClassName}
      dateFilterColumns={{
        geaendertAm: dateFilterConfigForGeaendertAm,
      }}
      // To enable general text filter input (optional, based on FilterableTable features)
      // filterColumn="titel" // Example: if you want a global filter for the 'titel' column
      // filterPlaceholder="Verkaufschancen filtern..."
      tableClassName="w-full border" // Default from FilterableTable, can customize
      headerClassName="border p-2 text-left select-none bg-gray-50" // Add bg for header
      cellClassName="border p-2" // Default from FilterableTable
    />
  );
};

export default SalesOpportunitiesTable;
