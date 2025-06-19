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
import UserDetail from './user-detail';
import { useTabbedInterface } from './tabbed-interface-provider';
import type { Role } from '@/lib/db/schema';

type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  roleCount: number;
  lastModified: string;
};

interface UserListTableProps {
  data: UserListItem[];
  roles: Role[];
  onSaveUserChanges?: (
    userId: string,
    userData: { name: string | null; email: string }
  ) => Promise<void>;
  onSaveUserRoles?: (userId: string, roleIds: string[]) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onCreateUser?: () => Promise<UserListItem>;
  onCopyUser?: (originalUser: UserListItem) => Promise<UserListItem>;
}

const UserListTable: FC<UserListTableProps> = ({
  data,
  roles,
  onSaveUserChanges,
  onSaveUserRoles,
  onDeleteUser,
  onCreateUser,
  onCopyUser,
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const { openNewTab } = useTabbedInterface();
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [tableData, setTableData] = useState<UserListItem[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const getLastModified = (user: UserListItem): string => {
    if (user.lastModified === 'Nie') return 'Nie';
    return new Date(user.lastModified).toLocaleDateString('de-DE');
  };

  const handleOpenUserDetail = (user: UserListItem) => {
    openNewTab({
      id: `user-detail-${user.id}`,
      title: `Benutzer: ${user.name || user.email}`,
      content: (
        <UserDetail 
          userId={user.id}
          roles={roles}
          onSaveUserChanges={onSaveUserChanges}
          onSaveUserRoles={onSaveUserRoles}
        />
      ),
      closable: true,
    });
  };

  const handleAddNewUser = async () => {
    if (!onCreateUser) {
      toast.error('Benutzer-Erstellung nicht verfügbar');
      return;
    }
    
    try {
      const newUser = await onCreateUser();

      const newUserId = `user-detail-${newUser.id}`;
      openNewTab({
        id: newUserId,
        title: 'Neuer Benutzer',
        content: (
          <UserDetail 
            userId={newUser.id}
            roles={roles}
            onSaveUserChanges={onSaveUserChanges}
            onSaveUserRoles={onSaveUserRoles}
          />
        ),
        closable: true,
      });
    } catch (error) {
      toast.error('Fehler beim Erstellen des Benutzers');
    }
  };

  const handleCopyUser = async (user: UserListItem) => {
    if (!onCopyUser) {
      toast.error('Benutzer-Kopierung nicht verfügbar');
      return;
    }

    try {
      const copiedUser = await onCopyUser(user);
      
      setTableData(prevData => [...prevData, copiedUser]);
      
      toast.success(`Benutzer "${user.name || user.email}" wurde kopiert`);
      
      const copiedUserId = `user-detail-${copiedUser.id}`;
      openNewTab({
        id: copiedUserId,
        title: `Benutzer: ${copiedUser.name || copiedUser.email}`,
        content: (
          <UserDetail 
            userId={copiedUser.id}
            roles={roles}
            onSaveUserChanges={onSaveUserChanges}
            onSaveUserRoles={onSaveUserRoles}
          />
        ),
        closable: true,
      });
    } catch (error) {
      console.error('Fehler beim Kopieren des Benutzers:', error);
      toast.error('Fehler beim Kopieren des Benutzers');
    }
  };

  const handleInitiateDelete = (user: UserListItem) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    
    if (onDeleteUser) {
      onDeleteUser(userToDelete.id);
    }
    
    setTableData(prevData =>
      prevData.filter(u => u.id !== userToDelete.id)
    );
    toast.success('Benutzer wurde gelöscht');
    setUserToDelete(null);
  };

  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span
          className="text-blue-700 underline cursor-pointer hover:text-blue-900 font-medium"
          onClick={e => {
            e.stopPropagation();
            handleOpenUserDetail(row.original);
          }}
          tabIndex={0}
          aria-label={`Benutzer ${row.original.name || row.original.email} öffnen`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              handleOpenUserDetail(row.original);
            }
          }}
        >
          {row.original.name || '-'}
        </span>
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: 'email',
      header: 'E-Mail',
      cell: ({ row }) => row.original.email,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'roleCount',
      header: 'Rollen',
      cell: ({ row }) => `${row.original.roleCount} Rolle${row.original.roleCount !== 1 ? 'n' : ''}`,
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
              handleOpenUserDetail(row.original);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                handleOpenUserDetail(row.original);
              }
            }}
          />
          <IconButton
            icon={<Copy size={16} />}
            aria-label="Kopieren"
            disabled={!onCopyUser}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await handleCopyUser(row.original);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                await handleCopyUser(row.original);
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

  const getRowClassName = (row: Row<UserListItem>) => {
    let className = 'cursor-pointer hover:bg-blue-100';
    if (selectedRow === row.id) {
      className += ' bg-blue-200';
    } else {
      className += row.index % 2 === 0 ? ' bg-white' : ' bg-gray-100';
    }
    return className;
  };

  const handleRowClick = (row: Row<UserListItem>) => {
    setSelectedRow(row.id);
    handleOpenUserDetail(row.original);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 cursor-pointer"
          aria-label="Benutzer hinzufügen"
          tabIndex={0}
          onClick={handleAddNewUser}
          disabled={!onCreateUser}
        >
          + Benutzer hinzufügen
        </Button>
      </div>
      <div className="overflow-x-auto">
        <FilterableTable
          data={tableData}
          columns={columns}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          globalFilterColumnIds={['name', 'email']}
          filterPlaceholder="Filtern..."
        />
      </div>
      <DeleteConfirmationDialog
        open={!!userToDelete}
        onOpenChange={open => !open && setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Benutzer löschen"
        description={`Möchten Sie den Benutzer "${userToDelete?.name || userToDelete?.email || ''}" wirklich löschen?`}
      />
    </div>
  );
};

export default UserListTable; 