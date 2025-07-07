import React, { useMemo, useCallback } from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterableTable } from '@/project_components/filterable-table';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import SalesOpportunityDetail from '@/project_components/sales-opportunity-detail';
import type { SalesOpportunityListItem } from '@/lib/api/sales-opportunities';
import type { SalesOpportunity } from '@/lib/db/schema';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import { toast } from 'sonner';

interface SalesOpportunitiesListTableProps {
  data: SalesOpportunityListItem[];
  isLoading?: boolean;
  onSaveSalesOpportunity: (id: string, salesOpportunityData: Partial<SalesOpportunity>) => Promise<void>;
  onDeleteSalesOpportunity: (id: string) => Promise<void>;
  onCopySalesOpportunity: (originalSalesOpportunityId: string) => Promise<void>;
}

const SalesOpportunitiesListTable: React.FC<SalesOpportunitiesListTableProps> = ({
  data,
  isLoading = false,
  onSaveSalesOpportunity,
  onDeleteSalesOpportunity,
  onCopySalesOpportunity,
}) => {
  const { openNewTab } = useTabbedInterface();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [salesOpportunityToDelete, setSalesOpportunityToDelete] = React.useState<SalesOpportunityListItem | null>(null);

  // Open sales opportunity details in new tab
  const handleOpenSalesOpportunityDetails = useCallback((salesOpportunity: SalesOpportunityListItem) => {
    openNewTab({
      id: `verkaufschance-${salesOpportunity.id}`,
      title: `Verkaufschance: ${salesOpportunity.keyword || salesOpportunity.clientName}`,
      content: <SalesOpportunityDetail salesOpportunityId={salesOpportunity.id} />,
      closable: true,
    });
  }, [openNewTab]);

  // Handle copy sales opportunity
  const handleCopySalesOpportunity = useCallback(async (salesOpportunity: SalesOpportunityListItem) => {
    try {
      await onCopySalesOpportunity(salesOpportunity.id);
    } catch (error) {
      console.error('Error copying sales opportunity:', error);
    }
  }, [onCopySalesOpportunity]);

  // Handle delete sales opportunity
  const handleDeleteClick = useCallback((salesOpportunity: SalesOpportunityListItem) => {
    setSalesOpportunityToDelete(salesOpportunity);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (salesOpportunityToDelete) {
      try {
        await onDeleteSalesOpportunity(salesOpportunityToDelete.id);
        setDeleteConfirmOpen(false);
        setSalesOpportunityToDelete(null);
      } catch (error) {
        console.error('Error deleting sales opportunity:', error);
      }
    }
  }, [salesOpportunityToDelete, onDeleteSalesOpportunity]);



  const columns = useMemo<ColumnDef<SalesOpportunityListItem>[]>(() => [
    {
      accessorKey: 'keyword',
      header: 'Stichwort',
      cell: ({ row }) => (
        <button
          className="text-blue-600 hover:underline text-left"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenSalesOpportunityDetails(row.original);
          }}
        >
          {row.original.keyword || 'Ohne Stichwort'}
        </button>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'clientName',
      header: 'Kunde',
      enableSorting: true,
    },
    {
      accessorKey: 'contactPersonName',
      header: 'Ansprechpartner',
      cell: ({ row }) => row.original.contactPersonName || 'Kein Ansprechpartner',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
    },
    {
      accessorKey: 'businessArea',
      header: 'Geschäftsbereich',
      cell: ({ row }) => row.original.businessArea || '-',
      enableSorting: true,
    },
    {
      accessorKey: 'quoteVolume',
      header: 'Angebotswert',
      cell: ({ row }) => {
        const volume = row.original.quoteVolume;
        return volume ? `€ ${parseFloat(volume).toLocaleString('de-DE')}` : '-';
      },
      enableSorting: true,
    },
    {
      accessorKey: 'quotesCount',
      header: 'Angebote',
      cell: ({ row }) => (
        <span className="text-center block">{row.original.quotesCount}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Geändert am',
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
        return date.toLocaleDateString('de-DE');
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSalesOpportunityDetails(row.original);
            }}
            title="Bearbeiten"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleCopySalesOpportunity(row.original);
            }}
            title="Kopieren"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
            title="Löschen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ], [handleOpenSalesOpportunityDetails, handleCopySalesOpportunity, handleDeleteClick, isLoading]);

  const handleRowClick = useCallback((row: Row<SalesOpportunityListItem>) => {
    handleOpenSalesOpportunityDetails(row.original);
  }, [handleOpenSalesOpportunityDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Lade Verkaufschancen...</div>
      </div>
    );
  }

  return (
    <>
      <FilterableTable<SalesOpportunityListItem>
        data={data}
        columns={columns}
        onRowClick={handleRowClick}
        defaultSorting={[{ id: 'updatedAt', desc: true }]}
        globalFilterColumnIds={['keyword']}
        filterPlaceholder="Verkaufschancen filtern..."
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setSalesOpportunityToDelete(null);
          }
        }}
        title="Verkaufschance löschen"
        description={
          salesOpportunityToDelete
            ? `Möchten Sie die Verkaufschance "${salesOpportunityToDelete.keyword || salesOpportunityToDelete.clientName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default SalesOpportunitiesListTable; 