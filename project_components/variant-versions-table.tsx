'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import PdfPreview from '@/project_components/pdf-preview';
import { TableActionsCell, type TableAction } from '@/project_components/table-actions-cell';
import { LoadingIndicator } from '@/project_components/loading-indicator';
import { fetchVersionsForVariant, softDeleteVersion } from '@/lib/api/quotes';
import { formatGermanDateTime } from '@/helper/date-formatter';

type VersionRow = {
  id: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  totalPrice: string | null;
  isLatest: boolean;
};

type Props = {
  variantId: string;
};

const VariantVersionsTable: React.FC<Props> = ({ variantId }) => {
  const [versions, setVersions] = useState<VersionRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [versionToDelete, setVersionToDelete] = useState<VersionRow | null>(null);
  const { openNewTab } = useTabbedInterface();

  const handleLoad = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVersionsForVariant(variantId);
      // Ensure default sort by versionNumber desc
      data.sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
      setVersions(data);
    } catch (e) {
      console.error(e);
      setError('Fehler beim Laden der Versionen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (variantId) {
      handleLoad();
    }
  }, [variantId]);

  const handleViewVersion = (version: VersionRow) => {
    openNewTab({
      id: `pdf-preview-version-${version.id}-${Date.now()}`,
      title: `Vorschau Version ${version.versionNumber}`,
      content: <PdfPreview file="/dummy.pdf" />,
      closable: true,
    });
  };

  const handleInitiateDelete = (version: VersionRow) => {
    setVersionToDelete(version);
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;
    try {
      await softDeleteVersion(versionToDelete.id);
      setVersions(prev => (prev || []).filter(v => v.id !== versionToDelete.id));
      toast.success(`Version ${versionToDelete.versionNumber} wurde gelöscht`);
    } catch (e) {
      console.error(e);
      toast.error('Löschen der Version fehlgeschlagen');
    } finally {
      setVersionToDelete(null);
    }
  };

  const columns: ColumnDef<VersionRow>[] = useMemo(() => [
    { accessorKey: 'versionNumber', header: 'Version' },
    { accessorKey: 'createdAt', header: 'erstellt am', cell: ({ row }) => formatGermanDateTime(row.original.createdAt) },
    { accessorKey: 'updatedAt', header: 'geändert am', cell: ({ row }) => formatGermanDateTime(row.original.updatedAt) },
    {
      accessorKey: 'totalPrice',
      header: 'Betrag',
      cell: ({ row }) => (
        <div className="text-right">{row.original.totalPrice ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(row.original.totalPrice)) : '-'}</div>
      ),
    },
    {
      id: 'aktionen',
      header: 'Aktionen',
      cell: ({ row }) => {
        const version = row.original;
        const actions: TableAction[] = [
          { icon: FileText, title: 'PDF ansehen', onClick: () => handleViewVersion(version), variant: 'ghost' },
          { icon: Trash2, title: 'Löschen', onClick: () => handleInitiateDelete(version), variant: 'destructive' },
        ];
        return <TableActionsCell actions={actions} />;
      },
      enableSorting: false,
      enableGlobalFilter: false,
    },
  ], []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <LoadingIndicator text="Versionen werden geladen..." variant="centered" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm" role="alert" aria-live="polite">{error}</div>
    );
  }

  if (!versions) {
    return null;
  }

  return (
    <>
      <FilterableTable
        data={versions}
        columns={columns}
        tableClassName="min-w-full w-full border border-gray-300 text-sm"
        headerClassName="px-3 py-2 bg-gray-200 text-left font-semibold"
        cellClassName="px-3 py-2"
        globalFilterColumnIds={[ 'versionNumber' ]}
        filterPlaceholder="Version filtern..."
        defaultSorting={[{ id: 'versionNumber', desc: true }]}
      />
      <DeleteConfirmationDialog
        open={!!versionToDelete}
        onOpenChange={open => !open && setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Version löschen"
        description={`Möchten Sie die Version "${versionToDelete?.versionNumber ?? ''}" wirklich löschen?`}
      />
    </>
  );
};

export default VariantVersionsTable;


