import { useState, FC, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { FilterableTable } from '@/project_components/filterable-table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import QuoteDetail from '@/project_components/quote-detail';
import type { Language } from '@/lib/db/schema';
import { Edit, Copy, Trash2, Lock } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import QuoteDialogs, {
  QUOTE_DIALOGS,
  useDialogManager,
} from '@/project_components/quote_dialogs/quotes-dialogs';
import {
  TableActionsCell,
  TableAction,
} from '@/project_components/table-actions-cell';
import { translateSalesOpportunityStatus } from '@/helper/status-translations';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type VariantListItem = {
  id: string;
  quoteId: string;
  quoteNumber: string | null;
  quoteTitle: string | null;
  variantNumber: number;
  variantDescriptor: string;
  languageId: string;
  languageLabel: string | null;
  salesOpportunityStatus: string | null;
  clientForeignId: string | null;
  clientName: string | null;
  latestVersionNumber: number;
  lastModifiedBy: string | null;
  lastModifiedByUserName: string | null;
  lastModifiedAt: string;
  // Lock status for the latest version
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
};

interface QuotesListTableProps {
  data: VariantListItem[];
  languages: Language[];
  onSaveQuoteProperties: (
    quoteId: string,
    quoteData: any,
    reloadData?: boolean,
  ) => Promise<void>;
  onDeleteVariant: (variantId: string) => Promise<void>;
  onCreateQuote: () => Promise<VariantListItem>;
  onCopyVariant: (variant: VariantListItem) => Promise<VariantListItem>;
  reducedMode?: boolean;
  onVariantSelect?: (variant: VariantListItem) => void;
}

// Variants list content component that uses DialogManager
const QuotesListContent: FC<QuotesListTableProps> = ({
  data,
  onDeleteVariant,
  onCopyVariant,
  reducedMode = false,
  onVariantSelect,
}) => {
  const { openDialog } = useDialogManager();
  const { openNewTab } = useTabbedInterface();
  const [selectedStatus, setSelectedStatus] = useState('Alle');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] =
    useState<VariantListItem | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null,
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const handleCreateQuote = () => {
    openDialog(QUOTE_DIALOGS.SMART_ENTRY);
  };

  const handleEditVariant = (variant: VariantListItem) => {
    openNewTab({
      id: `variant-${variant.id}`,
      title: `${variant.quoteTitle || variant.quoteNumber || 'Angebot'} - Variante ${variant.variantNumber}`,
      content: (
        <QuoteDetail
          title={variant.quoteTitle || variant.quoteNumber || 'Angebot'}
          quoteId={variant.quoteId}
          variantId={variant.id}
        />
      ),
      closable: true,
    });
  };

  const handleCopyVariant = async (variant: VariantListItem) => {
    try {
      await onCopyVariant(variant);
    } catch (error) {
      console.error('Error copying variant:', error);
    }
  };

  const handleDeleteClick = (variant: VariantListItem) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (variantToDelete) {
      try {
        setDeletingVariantId(variantToDelete.id);
        await onDeleteVariant(variantToDelete.id);
        setDeleteDialogOpen(false);
        setVariantToDelete(null);
        toast.success('Variante erfolgreich gelöscht');
      } catch (error) {
        console.error('Error deleting variant:', error);
        toast.error('Fehler beim Löschen der Variante');
      } finally {
        setDeletingVariantId(null);
      }
    }
  };

  const handleRowClick = (row: Row<VariantListItem>) => {
    if (reducedMode) {
      const variant = row.original;
      setSelectedVariantId(variant.id);
      onVariantSelect?.(variant);
    } else {
      handleEditVariant(row.original);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = data.find(v => v.id === variantId);
    if (variant) {
      onVariantSelect?.(variant);
    }
  };

  // Define columns for the FilterableTable
  const columns = useMemo<ColumnDef<VariantListItem>[]>(
    () => [
      // Selection column for reduced mode
      ...(reducedMode ? [
        {
          id: 'selection',
          header: 'Auswahl',
          cell: ({ row }: { row: Row<VariantListItem> }) => (
            <div className="pl-4">
              <RadioGroupItem
                value={row.original.id}
                id={`select-${row.original.id}`}
                checked={selectedVariantId === row.original.id}
                onClick={() => handleVariantSelect(row.original.id)}
                aria-label={`Variante ${row.original.quoteNumber || row.original.quoteTitle || 'Angebot'} auswählen`}
              />
            </div>
          ),
          enableSorting: false,
          enableGlobalFilter: false,
        }
      ] : []),
      {
        accessorKey: 'quoteNumber',
        header: 'Angebots-Nr',
        cell: ({ row }) => {
          const quoteNumber = row.getValue('quoteNumber') as string | null;
          const variantNumber = row.original.variantNumber;
          const displayValue = quoteNumber
            ? `${quoteNumber}-${variantNumber}`
            : `-${variantNumber}`;
          return <span className="font-medium">{displayValue}</span>;
        },
      },
      {
        accessorKey: 'quoteTitle',
        header: 'Titel',
        cell: ({ row }) => <span>{row.getValue('quoteTitle') || '-'}</span>,
      },
      {
        accessorKey: 'salesOpportunityStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('salesOpportunityStatus') as
            | string
            | null;
          return (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {status ? translateSalesOpportunityStatus(status) : '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'clientForeignId',
        header: 'KdNr',
        cell: ({ row }) => (
          <span>{row.getValue('clientForeignId') || '-'}</span>
        ),
      },
      {
        accessorKey: 'clientName',
        header: 'AngebotsEmpfänger',
        cell: ({ row }) => <span>{row.getValue('clientName') || '-'}</span>,
      },
      {
        accessorKey: 'latestVersionNumber',
        header: 'Version',
        cell: ({ row }) => <span>{row.getValue('latestVersionNumber')}</span>,
      },
      {
        accessorKey: 'lastModifiedByUserName',
        header: 'Geändert von',
        cell: ({ row }) => (
          <span>{row.getValue('lastModifiedByUserName') || '-'}</span>
        ),
      },
      {
        accessorKey: 'lastModifiedAt',
        header: 'Geändert am',
        cell: ({ row }) => {
          const dateValue = row.getValue('lastModifiedAt') as string;
          const date = new Date(dateValue);
          const formattedDate = date.toLocaleDateString('de-DE');
          const formattedTime = date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <span>
              {formattedDate} {formattedTime}
            </span>
          );
        },
      },
      // Lock status column - only show in non-reduced mode
      ...(!reducedMode ? [
        {
          accessorKey: 'isLocked',
          header: 'Gesperrt',
          cell: ({ row }: { row: Row<VariantListItem> }) => {
            const isLocked = row.getValue('isLocked') as boolean;
            const lockedByName = row.original.lockedByName;

            if (!isLocked) {
              return <span className="text-gray-400">-</span>;
            }

            return (
              <div className="flex items-center gap-1">
                <Lock size={12} className="text-red-600" />
                <span className="text-xs text-red-600">
                  {lockedByName || 'Unbekannt'}
                </span>
              </div>
            );
          },
        }
      ] : []),
      // Actions column - only show in non-reduced mode
      ...(!reducedMode ? [
        {
          id: 'actions',
          header: 'Aktionen',
          cell: ({ row }: { row: Row<VariantListItem> }) => {
            const actions: TableAction[] = [
              {
                icon: Edit,
                title: 'Bearbeiten',
                onClick: () => handleEditVariant(row.original),
                disabled: row.original.isLocked,
              },
              {
                icon: Copy,
                title: 'Kopieren',
                onClick: () => handleCopyVariant(row.original),
                disabled: row.original.isLocked,
              },
              {
                icon: Trash2,
                title: 'Löschen',
                onClick: () => handleDeleteClick(row.original),
                variant: 'destructive' as const,
                isLoading: deletingVariantId === row.original.id,
              },
            ];

            return <TableActionsCell actions={actions} />;
          },
          enableSorting: false,
          enableGlobalFilter: false,
        }
      ] : []),
    ],
    [deletingVariantId, reducedMode, selectedVariantId, handleVariantSelect],
  );

  // Filter data based on selected status
  const filteredData = data.filter(variant => {
    if (selectedStatus === 'Alle') return true;
    return variant.salesOpportunityStatus === selectedStatus;
  });

  const getRowClassName = (row: Row<VariantListItem>) => {
    let classes = ['cursor-pointer hover:bg-gray-50'];
    
    if (reducedMode && selectedVariantId === row.original.id) {
      classes.push('bg-blue-50');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          className="flex items-center gap-1"
          variant="outline"
          size="sm"
          onClick={handleCreateQuote}
        >
          + Erstellen
        </Button>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger
            className="h-8 w-[140px] rounded border px-2 py-1 text-sm"
            aria-label="Status wählen"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alle">Alle Status</SelectItem>
            <SelectItem value="open">Offen</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="won">Gewonnen</SelectItem>
            <SelectItem value="lost">Verloren</SelectItem>
            <SelectItem value="cancelled">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RadioGroup value={selectedVariantId || ""}>
        <FilterableTable
          data={filteredData}
          columns={columns}
          filterPlaceholder="Varianten suchen..."
          globalFilterColumnIds={[
            'quoteNumber',
            'quoteTitle',
            'clientName',
            'clientForeignId',
          ]}
          onRowClick={handleRowClick}
          getRowClassName={getRowClassName}
          defaultSorting={[{ id: 'lastModifiedAt', desc: true }]}
        />
      </RadioGroup>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={open => {
          setDeleteDialogOpen(open);
          if (!open) setVariantToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Variante "${variantToDelete?.quoteTitle || variantToDelete?.quoteNumber}" löschen?`}
        description="Diese Aktion kann nicht rückgängig gemacht werden. Die Variante und alle zugehörigen Daten werden dauerhaft gelöscht."
      />
    </div>
  );
};

// Main component with dialog management
const QuotesListTable: FC<QuotesListTableProps> = props => {
  return (
    <QuoteDialogs onCreateQuote={props.onCreateQuote}>
      <QuotesListContent {...props} />
    </QuoteDialogs>
  );
};

export default QuotesListTable;
