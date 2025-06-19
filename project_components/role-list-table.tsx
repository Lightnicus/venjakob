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
import RoleDetail from './role-detail';
import { useTabbedInterface } from './tabbed-interface-provider';
import type { Permission } from '@/lib/db/schema';

type RoleListItem = {
  id: string;
  name: string;
  description: string | null;
  permissionCount: number;
  lastModified: string;
};

interface RoleListTableProps {
  data: RoleListItem[];
  permissions: Permission[];
  onSaveRoleChanges?: (roleId: string, roleData: { name: string; description?: string | null }) => Promise<void>;
  onSaveRolePermissions?: (roleId: string, permissionIds: string[]) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
  onCreateRole?: () => Promise<RoleListItem>;
  onCopyRole?: (originalRole: RoleListItem) => Promise<RoleListItem>;
}

const RoleListTable: FC<RoleListTableProps> = ({ 
  data, 
  permissions,
  onSaveRoleChanges,
  onSaveRolePermissions,
  onDeleteRole,
  onCreateRole,
  onCopyRole
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [roleToDelete, setRoleToDelete] = useState<RoleListItem | null>(null);
  const [tableData, setTableData] = useState<RoleListItem[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const getLastModified = (role: RoleListItem): string => {
    if (role.lastModified === 'Nie') return 'Nie';
    return new Date(role.lastModified).toLocaleDateString('de-DE');
  };

  const handleOpenRoleDetail = (role: RoleListItem) => {
    openNewTab({
      id: `role-detail-${role.id}`,
      title: `Rolle: ${role.name}`,
      content: (
        <RoleDetail 
          roleId={role.id}
          permissions={permissions}
          onSaveRoleChanges={onSaveRoleChanges}
          onSaveRolePermissions={onSaveRolePermissions}
        />
      ),
      closable: true,
    });
  };

  const handleAddNewRole = async () => {
    if (!onCreateRole) {
      toast.error('Rollen-Erstellung nicht verfügbar');
      return;
    }
    
    try {
      const newRole = await onCreateRole();

      const newRoleId = `role-detail-${newRole.id}`;
      openNewTab({
        id: newRoleId,
        title: 'Neue Rolle',
        content: (
          <RoleDetail 
            roleId={newRole.id}
            permissions={permissions}
            onSaveRoleChanges={onSaveRoleChanges}
            onSaveRolePermissions={onSaveRolePermissions}
          />
        ),
        closable: true,
      });
    } catch (error) {
      toast.error('Fehler beim Erstellen der Rolle');
    }
  };

  const handleCopyRole = async (role: RoleListItem) => {
    if (!onCopyRole) {
      toast.error('Rollen-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedRole = await onCopyRole(role);
      
      setTableData(prevData => [...prevData, copiedRole]);
      
      toast.success(`Rolle "${role.name}" wurde kopiert`);
      
      const copiedRoleId = `role-detail-${copiedRole.id}`;
      openNewTab({
        id: copiedRoleId,
        title: `Rolle: ${copiedRole.name}`,
        content: (
          <RoleDetail 
            roleId={copiedRole.id}
            permissions={permissions}
            onSaveRoleChanges={onSaveRoleChanges}
            onSaveRolePermissions={onSaveRolePermissions}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren der Rolle:', error);
      toast.error('Fehler beim Kopieren der Rolle');
    }
  };

  const handleInitiateDelete = (role: RoleListItem) => {
    setRoleToDelete(role);
  };

  const handleConfirmDelete = () => {
    if (!roleToDelete) return;
    
    if (onDeleteRole) {
      onDeleteRole(roleToDelete.id);
    }
    
    setTableData(prevData =>
      prevData.filter(r => r.id !== roleToDelete.id)
    );
    toast.success('Rolle wurde gelöscht');
    setRoleToDelete(null);
  };

  const columns: ColumnDef<RoleListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={e => {
            e.stopPropagation();
            handleOpenRoleDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Rolle ${row.original.name} öffnen`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              handleOpenRoleDetail(row.original);
            }
          }}
        >
          {row.original.name}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'description',
      header: 'Beschreibung',
      cell: ({ row }) => row.original.description || '-',
      enableColumnFilter: true,
    },
    {
      accessorKey: 'permissionCount',
      header: 'Berechtigungen',
      cell: ({ row }) => `${row.original.permissionCount} Berechtigung${row.original.permissionCount !== 1 ? 'en' : ''}`,
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
              handleOpenRoleDetail(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleOpenRoleDetail(row.original);
              }
            }}
          />
          <IconButton
            icon={<Copy size={16} />}
            aria-label="Kopieren"
            disabled={!onCopyRole}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleCopyRole(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                await handleCopyRole(row.original);
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

  const getRowClassName = (row: Row<RoleListItem>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<RoleListItem>) => {
    setSelectedRow(row.id);
    handleOpenRoleDetail(row.original);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          aria-label="Rolle hinzufügen"
          tabIndex={0}
          onClick={handleAddNewRole}
          disabled={!onCreateRole}
        >
          + Rolle hinzufügen
        </Button>
      </div>
      <div className="overflow-x-auto">
        <FilterableTable
          data={tableData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['name', 'description']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!roleToDelete}
        onOpenChange={open => !open && setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Rolle löschen"
        description={`Möchten Sie die Rolle "${roleToDelete?.name || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default RoleListTable; 