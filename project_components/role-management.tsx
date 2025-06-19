import { useState, useEffect } from 'react';
import RoleListTable from './role-list-table';
import type { Role, Permission } from '@/lib/db/schema';
import { toast } from 'sonner';
import { useTabReload } from './tabbed-interface-provider';
import { usePermissionGuard } from './use-permission-guard';

type RoleListItem = {
  id: string;
  name: string;
  description: string | null;
  permissionCount: number;
  lastModified: string;
};

const RoleManagement = () => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent } = usePermissionGuard('admin');
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions')
      ]);

      if (!rolesResponse.ok || !permissionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [rolesData, permissionsData] = await Promise.all([
        rolesResponse.json(),
        permissionsResponse.json()
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for roles
  useTabReload('roles', loadData);

  useEffect(() => {
    // Only load data if user has access
    if (hasAccess && !permissionLoading) {
      loadData();
    }
  }, [hasAccess, permissionLoading]);

  const handleSaveRoleChanges = async (roleId: string, roleData: { name: string; description?: string | null }) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      await loadData();
    } catch (error) {
      console.error('Error saving role changes:', error);
      toast.error('Fehler beim Speichern der Rolle');
    }
  };

  const handleSaveRolePermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role permissions');
      }

      await loadData();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error('Fehler beim Speichern der Berechtigungen');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      toast.success('Rolle gelöscht');
      setRoles(prev => prev.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Fehler beim Löschen der Rolle');
    }
  };

  const handleCreateRole = async (): Promise<RoleListItem> => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Neue Rolle',
          description: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      const roleListItem = await response.json();
      
      toast.success('Neue Rolle erstellt');
      setRoles(prev => [...prev, roleListItem]);
      return roleListItem;
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Fehler beim Erstellen der Rolle');
      throw error;
    }
  };

  const handleCopyRole = async (originalRole: RoleListItem): Promise<RoleListItem> => {
    try {
      const response = await fetch('/api/roles/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalRoleId: originalRole.id,
          name: `${originalRole.name} (Kopie)`,
          description: originalRole.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to copy role');
      }

      const roleListItem = await response.json();

      toast.success(`Rolle "${originalRole.name}" wurde kopiert`);
      setRoles(prev => [...prev, roleListItem]);
      return roleListItem;
    } catch (error) {
      console.error('Error copying role:', error);
      toast.error('Fehler beim Kopieren der Rolle');
      throw error;
    }
  };

  // Permission checking in render
  if (permissionLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Rollenverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Prüfe Berechtigungen...</div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Rollenverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Rollenverwaltung</h2>
      <RoleListTable 
        data={roles}
        permissions={permissions}
        onSaveRoleChanges={handleSaveRoleChanges}
        onSaveRolePermissions={handleSaveRolePermissions}
        onDeleteRole={handleDeleteRole}
        onCreateRole={handleCreateRole}
        onCopyRole={handleCopyRole}
      />
    </div>
  );
};

export default RoleManagement; 