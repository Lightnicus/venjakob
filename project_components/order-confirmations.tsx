import * as React from 'react';
import type {
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { Edit, History, Trash } from 'lucide-react';
import Link from 'next/link';
import { FilterableTable, type DateFilterConfig } from './filterable-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OfferVersionsTable from './offer-versions-table';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { toast } from 'sonner';
import { useTabbedInterface } from './tabbed-interface-provider';
import OfferDetail from './offer-detail';

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
  // It would be good to have an onDelete callback if data is managed by parent
  // onDeleteConfirmation?: (abNumber: string) => void; 
};

const OrderConfirmations = ({ data /*, onDeleteConfirmation */ }: Props) => {
  const [tableData, setTableData] = React.useState<OrderConfirmation[]>(data); // Manage local state for data
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null); // State for dialog
  const { openNewTab } = useTabbedInterface();

  // Update local state if prop data changes
  React.useEffect(() => {
    setTableData(data);
  }, [data]);
  
  // Dropdown options
  const responsibleOptions = React.useMemo(() => Array.from(new Set(tableData.map(d => d.responsible))).sort(), [tableData]);
  const modifiedByOptions = React.useMemo(() => Array.from(new Set(tableData.map(d => d.modifiedBy))).sort(), [tableData]);

  const [showHistoryDialog, setShowHistoryDialog] = React.useState(false);

  const handleShowHistory = () => {
    setShowHistoryDialog(true);
  };

  const handleDeleteOrderConfirmation = (abNumber: string) => {
    setTableData(prevData => prevData.filter(item => item.abNumber !== abNumber));
    setConfirmDeleteId(null);
    toast.success('Auftragsbestätigung gelöscht');
    // if (onDeleteConfirmation) {
    //   onDeleteConfirmation(abNumber);
    // }
  };

  // Function to get valid dates for the 'modifiedOn' filter
  const getValidDatesForModifiedOn = React.useCallback((currentTableData: OrderConfirmation[]): Date[] => {
    const dateStrings = new Set<string>();
    currentTableData.forEach(d => {
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
          <button 
            aria-label="Bearbeiten" 
            tabIndex={0} 
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            onClick={() => {
              openNewTab({
                id: `offer-detail-${row.original.abNumber}`,
                title: `Angebot ${row.original.abNumber}`,
                content: <OfferDetail title={row.original.abNumber} /> 
              });
            }}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            aria-label="Historie" 
            tabIndex={0} 
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            onClick={() => handleShowHistory()}
          >
            <History className="h-4 w-4" />
          </button>
          <button 
            aria-label="Löschen" 
            tabIndex={0} 
            className="cursor-pointer rounded p-1 hover:bg-gray-100"
            onClick={() => setConfirmDeleteId(row.original.abNumber)}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [responsibleOptions, modifiedByOptions, getValidDatesForModifiedOn, openNewTab]);

  const dateFilterConfigForModifiedOn: DateFilterConfig = {
    getValidDates: getValidDatesForModifiedOn,
    dateFieldPath: 'modifiedOn',
  };

  return (
    <>
      <FilterableTable<OrderConfirmation>
        data={tableData}
        columns={columns}
        dateFilterColumns={{ modifiedOn: dateFilterConfigForModifiedOn }}
      />
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Angebotshistorie</DialogTitle>
          </DialogHeader>
          <OfferVersionsTable />
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        open={!!confirmDeleteId}
        onOpenChange={open => !open && setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            handleDeleteOrderConfirmation(confirmDeleteId);
          }
        }}
        title="Auftragsbestätigung löschen"
        description="Möchten Sie diese Auftragsbestätigung wirklich löschen?  "
      />
    </>
  );
};

export default OrderConfirmations; 