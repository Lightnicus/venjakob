'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { FilterableTable } from '@/project_components/filterable-table';
import { ManagedDialog } from '@/project_components/managed-dialog';
import { FileText, Copy, Trash } from 'lucide-react';
import versionsData from '@/data/versions-for-variant.json';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';

type OfferVersion = {
  id: string;
  version: string;
  erstelltAm: string;
  geaendertAm: string;
  betrag: string;
};

type VersionsForOfferVariantProps = {
  offerNumber?: string;
  variantIdentifier?: string;
};

export function VersionsForOfferVariantDialog({
  offerNumber = 'ANG-2023-0001',
  variantIdentifier = 'A',
}: VersionsForOfferVariantProps) {
  const [versions, setVersions] = useState<OfferVersion[]>(versionsData);
  const [versionToDelete, setVersionToDelete] = useState<OfferVersion | null>(null);

  const handleCopyVersion = (version: OfferVersion) => {
    console.log('Kopiere Version:', version.id);
    toast.success('Version wurde kopiert');
  };

  const handleInitiateDelete = (version: OfferVersion) => {
    setVersionToDelete(version);
  };

  const handleConfirmDelete = () => {
    if (!versionToDelete) return;
    setVersions(prevVersions => prevVersions.filter(v => v.id !== versionToDelete.id));
    toast.success('Version wurde gelöscht');
    setVersionToDelete(null);
  };

  const columns: ColumnDef<OfferVersion>[] = [
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
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => {
        const version = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Ansehen"
              tabIndex={0}
              onClick={() => window.open('/dummy.pdf', '_blank')}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Kopieren"
              tabIndex={0}
              onClick={() => handleCopyVersion(version)}
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              className="cursor-pointer rounded p-1 hover:bg-gray-100"
              aria-label="Löschen"
              tabIndex={0}
              onClick={() => handleInitiateDelete(version)}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <ManagedDialog
      title={`Versionen für Angebot ${offerNumber} - Variante ${variantIdentifier}`}
      showBackButton={false}
      showCloseButton={true}
      className="max-w-[90%] min-w-[80%]"
    >
      <FilterableTable<OfferVersion>
        data={versions}
        columns={columns}
        tableClassName="w-full border"
        headerClassName="border p-2 text-left bg-gray-50 cursor-pointer"
        cellClassName="border p-2"
      />
      <DeleteConfirmationDialog
        open={!!versionToDelete}
        onOpenChange={(open) => !open && setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Version löschen"
        description={`Möchten Sie die Version "${versionToDelete?.version || ''}" wirklich löschen?`}
      />
    </ManagedDialog>
  );
} 