'use client';

import React, { useState } from 'react';
import { FilterableTable } from './filterable-table';
import type { ColumnDef } from '@tanstack/react-table';
import versionsData from '@/data/versions-for-variant.json';
import { Copy, FileText, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/project_components/delete-confirmation-dialog';

type Version = {
  id: string;
  version: string;
  erstelltAm: string;
  geaendertAm: string;
  betrag: string;
};

const handleKeyDown = (
  event: React.KeyboardEvent<HTMLButtonElement>,
  onClick: () => void,
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
};

const ActionButton: React.FC<{
  label: string;
  svg: React.ReactNode;
  onClick: () => void;
}> = ({ label, svg, onClick }) => (
  <button
    className="cursor-pointer p-1 rounded hover:bg-gray-300 focus:bg-gray-300 focus:outline-none"
    tabIndex={0}
    aria-label={label}
    onClick={onClick}
    onKeyDown={e => handleKeyDown(e, onClick)}
    type="button"
  >
    {svg}
  </button>
);

const OfferVersionsTable: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>(versionsData);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);

  const handleViewVersion = () => {
    window.open('/dummy.pdf', '_blank');
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
    setVersions(prevVersions => prevVersions.filter(v => v.id !== versionToDelete.id));
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
        const icons = [
          {
            label: 'Ansehen',
            svg: <FileText size={18} />,
            onClick: handleViewVersion,
          },
          {
            label: 'Kopieren',
            svg: <Copy size={18} />,
            onClick: () => handleCopyVersion(version),
          },
          {
            label: 'Löschen',
            svg: <Trash size={18} />,
            onClick: () => handleInitiateDelete(version),
          },
        ];

        return (
          <div className="flex items-center gap-2 justify-center">
            {icons.map(icon => (
              <ActionButton
                key={icon.label}
                label={icon.label}
                svg={icon.svg}
                onClick={icon.onClick}
              />
            ))}
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
        filterColumn="version"
        filterPlaceholder="Version filtern..."
        defaultSorting={[{ id: 'version', desc: false }]}
      />
      <DeleteConfirmationDialog
        open={!!versionToDelete}
        onOpenChange={(open) => !open && setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Version löschen"
        description={`Möchten Sie die Version "${versionToDelete?.version || ''}" wirklich löschen?`}
      />
    </>
  );
};

export default OfferVersionsTable;
