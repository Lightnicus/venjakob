'use client';

import React, { useState } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import versionsData from '@/data/versions-for-variant.json';
import { Copy, FileText, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import PdfPreview from '@/project_components/pdf-preview';
import { Button } from '@/components/ui/button';

type Version = {
  id: string;
  version: string;
  erstelltAm: string;
  geaendertAm: string;
  betrag: string;
};

const OfferVersionsTable: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>(versionsData);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const { openNewTab } = useTabbedInterface();

  const handleViewVersion = (version: Version) => {
    openNewTab({
      id: `pdf-preview-version-${version.id}-${Date.now()}`,
      title: `Vorschau Version ${version.version}`,
      content: <PdfPreview file="/dummy.pdf" />,
      closable: true,
    });
  };

  const handleCopyVersion = (version: Version) => {
    console.log('Kopiere Version:', version.id);
    toast.success(`Version ${version.version} wurde kopiert`);
  };

  const handleInitiateDelete = (version: Version) => {
    setVersionToDelete(version);
  };

  const handleConfirmDelete = () => {
    if (!versionToDelete) return;
    setVersions(prevVersions =>
      prevVersions.filter(v => v.id !== versionToDelete.id),
    );
    toast.success(`Version ${versionToDelete.version} wurde gelöscht`);
    setVersionToDelete(null);
  };

  const columns: ColumnDef<Version>[] = [
    {
      accessorKey: 'version',
      header: 'Version',
    },
    {
      accessorKey: 'erstelltAm',
      header: 'erstellt am',
    },
    {
      accessorKey: 'geaendertAm',
      header: 'geändert am',
    },
    {
      accessorKey: 'betrag',
      header: 'Betrag',
      cell: ({ row }) => (
        <div className="text-right">{row.original.betrag}</div>
      ),
    },
    {
      id: 'aktionen',
      header: 'Aktionen',
      cell: ({ row }) => {
        const version = row.original;

        return (
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Ansehen"
              onClick={() => handleViewVersion(version)}
            >
              <FileText size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Kopieren"
              onClick={() => handleCopyVersion(version)}
            >
              <Copy size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
              aria-label="Löschen"
              onClick={() => handleInitiateDelete(version)}
            >
              <Trash size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  // Define empty rows for layout
  const getRowClassName = (row: any) => {
    const index = parseInt(row.original.id, 10);
    if (index > versionsData.length) {
      return index % 2 === 0 ? 'bg-gray-100 h-8' : 'bg-white h-8';
    }
    return index % 2 === 0 ? 'bg-gray-100' : 'bg-white';
  };

  return (
    <>
      <FilterableTable
        data={versions}
        columns={columns}
        tableClassName="min-w-full w-full border border-gray-300 text-sm"
        headerClassName="px-3 py-2 bg-gray-200 text-left font-semibold"
        cellClassName="px-3 py-2"
        getRowClassName={getRowClassName}
        globalFilterColumnIds={['version']}
        filterPlaceholder="Version filtern..."
        defaultSorting={[{ id: 'version', desc: false }]}
      />
      <DeleteConfirmationDialog
        open={!!versionToDelete}
        onOpenChange={open => !open && setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Version löschen"
        description={`Möchten Sie die Version "${versionToDelete?.version || ''}" wirklich löschen?`}
      />
    </>
  );
};

export default OfferVersionsTable;
