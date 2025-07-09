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
import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import QuoteDialogs, { QUOTE_DIALOGS, useDialogManager } from '@/project_components/quotes-dialogs';

type QuoteListItem = {
  id: string;
  quoteNumber: string;
  title: string | null;
  salesOpportunityKeyword: string | null;
  variantsCount: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
};



interface QuotesListTableProps {
  data: QuoteListItem[];
  languages: Language[];
  onSaveQuoteProperties: (quoteId: string, quoteData: any, reloadData?: boolean) => Promise<void>;
  onDeleteQuote: (quoteId: string) => Promise<void>;
  onCreateQuote: () => Promise<QuoteListItem>;
  onCopyQuote: (quote: QuoteListItem) => Promise<QuoteListItem>;
}

// Quotes list content component that uses DialogManager
const QuotesListContent: FC<QuotesListTableProps> = ({
  data,
  languages,
  onSaveQuoteProperties,
  onDeleteQuote,
  onCreateQuote,
  onCopyQuote,
}) => {
  const { openDialog } = useDialogManager();
  const { openNewTab } = useTabbedInterface();
  const [selectedStatus, setSelectedStatus] = useState('Alle');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteListItem | null>(null);
  const [selectedQuoteNumber, setSelectedQuoteNumber] = useState('ANG-2023-0001');
  const [selectedVariantIdentifier, setSelectedVariantIdentifier] = useState('A');

  const handleCreateQuote = () => {
    openDialog(QUOTE_DIALOGS.SMART_ENTRY);
  };

  const handleOpenVersionsDialog = (
    quoteNumber: string,
    variantIdentifier: string,
  ) => {
    setSelectedQuoteNumber(quoteNumber);
    setSelectedVariantIdentifier(variantIdentifier);
    openDialog(QUOTE_DIALOGS.VERSIONS_FOR_QUOTE_VARIANT, {
      quoteNumber,
      variantIdentifier,
    });
  };

  const handleEditQuote = (quote: QuoteListItem) => {
    openNewTab({
      id: `angebot-${quote.id}`,
      title: `${quote.title || quote.quoteNumber}`,
      content: <QuoteDetail title={quote.title || quote.quoteNumber} quoteId={quote.id} />,
      closable: true
    });
  };

  const handleCopyQuote = async (quote: QuoteListItem) => {
    try {
      await onCopyQuote(quote);
    } catch (error) {
      console.error('Error copying quote:', error);
    }
  };

  const handleDeleteClick = (quote: QuoteListItem) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quoteToDelete) {
      try {
        await onDeleteQuote(quoteToDelete.id);
        setDeleteDialogOpen(false);
        setQuoteToDelete(null);
      } catch (error) {
        console.error('Error deleting quote:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const handleRowClick = (row: Row<QuoteListItem>) => {
    handleEditQuote(row.original);
  };

  // Define columns for the FilterableTable
  const columns = useMemo<ColumnDef<QuoteListItem>[]>(() => [
    {
      accessorKey: 'quoteNumber',
      header: 'Angebotsnummer',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('quoteNumber')}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Titel',
      cell: ({ row }) => (
        <span>{row.getValue('title') || '-'}</span>
      ),
    },
    {
      accessorKey: 'salesOpportunityKeyword',
      header: 'Verkaufschance',
      cell: ({ row }) => (
        <span>{row.getValue('salesOpportunityKeyword') || '-'}</span>
      ),
    },
    {
      accessorKey: 'variantsCount',
      header: 'Varianten',
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {row.getValue('variantsCount')}
        </span>
      ),
    },
    {
      accessorKey: 'validUntil',
      header: 'Gültig bis',
      cell: ({ row }) => {
        const validUntil = row.getValue('validUntil') as string | null;
        return <span>{validUntil ? formatDate(validUntil) : '-'}</span>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Erstellt am',
      cell: ({ row }) => (
        <span>{formatDate(row.getValue('createdAt'))}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Zuletzt geändert',
      cell: ({ row }) => (
        <span>{formatDate(row.getValue('updatedAt'))}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger 
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleEditQuote(row.original);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleCopyQuote(row.original);
            }}>
              <Copy className="mr-2 h-4 w-4" />
              Kopieren
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row.original);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
  ], []);

  // Filter data based on selected status
  const filteredData = data.filter(quote => {
    if (selectedStatus === 'Alle') return true;
    // Add status filtering logic here when status field is available
    return true;
  });

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
            <SelectItem value="Alle">Alle</SelectItem>
            <SelectItem value="Offen">Offen</SelectItem>
            <SelectItem value="Geschlossen">Geschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FilterableTable
        data={filteredData}
        columns={columns}
        filterPlaceholder="Angebote suchen..."
        globalFilterColumnIds={['quoteNumber', 'title', 'salesOpportunityKeyword']}
        onRowClick={handleRowClick}
        getRowClassName={() => "cursor-pointer hover:bg-gray-50"}
        defaultSorting={[{ id: 'updatedAt', desc: true }]}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setQuoteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Angebot "${quoteToDelete?.title || quoteToDelete?.quoteNumber}" löschen?`}
        description="Diese Aktion kann nicht rückgängig gemacht werden. Das Angebot und alle zugehörigen Daten werden dauerhaft gelöscht."
      />
    </div>
  );
};



// Main component with dialog management
const QuotesListTable: FC<QuotesListTableProps> = (props) => {
  return (
    <QuoteDialogs onCreateQuote={props.onCreateQuote}>
      <QuotesListContent {...props} />
    </QuoteDialogs>
  );
};

export default QuotesListTable; 