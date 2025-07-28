'use client';

import type React from 'react';
import { useState, useEffect, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { FilterableTable } from './filterable-table';
import IconButton from './icon-button';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import PermissionDetail from './permission-detail';
import { useTabbedInterface } from './tabbed-interface-provider';
import { formatGermanDate } from '@/helper/date-formatter';

type PermissionListItem = {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  lastModified: string;
};

interface PermissionListTableProps {
  data: PermissionListItem[];
  onSavePermissionChanges?: (
    permissionId: string,
    permissionData: { name: string; description?: string | null; resource: string }
  ) => Promise<void>;
  onDeletePermission?: (permissionId: string) => Promise<void>;
  onCreatePermission?: () => Promise<PermissionListItem>;
  onCopyPermission?: (originalPermission: PermissionListItem) => Promise<PermissionListItem>;
}

const PermissionListTable: FC<PermissionListTableProps> = ({
  data,
  onSavePermissionChanges,
  onDeletePermission,
  onCreatePermission,
  onCopyPermission,
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionListItem | null>(null);
  const [tableData, setTableData] = useState<PermissionListItem[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const getLastModified = (permission: PermissionListItem): string => {
    if (permission.lastModified === 'Nie') return 'Nie';
    return formatGermanDate(permission.lastModified);
  };

  const handleOpenPermissionDetail = (permission: PermissionListItem) => {
    openNewTab({
      id: `permission-detail-${permission.id}`,
      title: `Berechtigung: ${permission.name}`,
      content: (
        <PermissionDetail 
          permissionId={permission.id}
          onSavePermissionChanges={onSavePermissionChanges}
        />
      ),
      closable: true,
    });
  };

  const handleAddNewPermission = async () => {
    if (!onCreatePermission) {
      toast.error('Berechtigungs-Erstellung nicht verfügbar');
      return;
    }
    
    try {
      const newPermission = await onCreatePermission();

      const newPermissionId = `permission-detail-${newPermission.id}`;
      openNewTab({
        id: newPermissionId,
        title: 'Neue Berechtigung',
        content: (
          <PermissionDetail 
            permissionId={newPermission.id}
            onSavePermissionChanges={onSavePermissionChanges}
          />
        ),
        closable: true,
      });
    } catch (error) {
      toast.error('Fehler beim Erstellen der Berechtigung');
    }
  };

  const handleCopyPermission = async (permission: PermissionListItem) => {
    if (!onCopyPermission) {
      toast.error('Berechtigungs-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedPermission = await onCopyPermission(permission);
      
      setTableData(prevData => [...prevData, copiedPermission]);
      
      toast.success(`Berechtigung "${permission.name}" wurde kopiert`);
      
      const copiedPermissionId = `permission-detail-${copiedPermission.id}`;
      openNewTab({
        id: copiedPermissionId,
        title: `Berechtigung: ${copiedPermission.name}`,
        content: (
          <PermissionDetail 
            permissionId={copiedPermission.id}
            onSavePermissionChanges={onSavePermissionChanges}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren der Berechtigung:', error);
      toast.error('Fehler beim Kopieren der Berechtigung');
    }
  };

  const handleInitiateDelete = (permission: PermissionListItem) => {
    setPermissionToDelete(permission);
  };

  const handleConfirmDelete = () => {
    if (!permissionToDelete) return;
    
    if (onDeletePermission) {
      onDeletePermission(permissionToDelete.id);
    }
    
    setTableData(prevData =>
      prevData.filter(p => p.id !== permissionToDelete.id)
    );
    toast.success('Berechtigung wurde gelöscht');
    setPermissionToDelete(null);
  };

  const columns: ColumnDef<PermissionListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={e => {
            e.stopPropagation();
            handleOpenPermissionDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Berechtigung ${row.original.name} öffnen`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              handleOpenPermissionDetail(row.original);
            }
          }}
        >
          {row.original.name}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'resource',
      header: 'Ressource',
      cell: ({ row }) => row.original.resource,
      enableColumnFilter: true,
    },

    {
      accessorKey: 'description',
      header: 'Beschreibung',
      cell: ({ row }) => row.original.description || '-',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'lastModified',
      header: 'zuletzt geändert am',
      cell: ({ row }) => getLastModified(row.original),
    },
    {
      id: 'aktionen',
      header: 'Aktion',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            icon={<Pencil size={16} />}
            aria-label="Bearbeiten"
            onClick={e => {
              e.stopPropagation();
              handleOpenPermissionDetail(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleOpenPermissionDetail(row.original);
              }
            }}
          />
          <IconButton
            icon={<Copy size={16} />}
            aria-label="Kopieren"
            disabled={!onCopyPermission}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleCopyPermission(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                await handleCopyPermission(row.original);
              }
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          />
          <IconButton
            icon={<Trash2 size={16} />}
            aria-label="Löschen"
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={e => {
              e.stopPropagation();
              handleInitiateDelete(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleInitiateDelete(row.original);
              }
            }}
          />
        </div>
      ),
    },
  ];

  const getRowClassName = (row: Row<PermissionListItem>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<PermissionListItem>) => {
    setSelectedRow(row.id);
    handleOpenPermissionDetail(row.original);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          aria-label="Berechtigung hinzufügen"
          tabIndex={0}
          onClick={handleAddNewPermission}
          disabled={!onCreatePermission}
        >
          + Berechtigung hinzufügen
        </Button>
      </div>
      <div className="overflow-x-auto">
        <FilterableTable
          data={tableData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['name', 'resource', 'description']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!permissionToDelete}
        onOpenChange={open => !open && setPermissionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Berechtigung löschen"
        description={`Möchten Sie die Berechtigung "${permissionToDelete?.name || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default PermissionListTable; 