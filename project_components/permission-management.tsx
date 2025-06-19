import { useState, useEffect } from 'react';
import PermissionListTable from './permission-list-table';
import type { Permission } from '@/lib/db/schema';
import { toast } from 'sonner';
import { useTabReload } from './tabbed-interface-provider';

type PermissionListItem = {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  lastModified: string;
};

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState<PermissionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions');

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const permissionsData = await response.json();

      // Transform permissions data to the list format
      const permissionListItems = permissionsData.map((permission: Permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        lastModified: permission.updatedAt.toString(),
      }));

      setPermissions(permissionListItems);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for permissions
  useTabReload('permissions', loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePermissionChanges = async (
    permissionId: string, 
    permissionData: { name: string; description?: string | null; resource: string }
  ) => {
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to update permission');
      }

      await loadData();
    } catch (error) {
      console.error('Error saving permission changes:', error);
      toast.error('Fehler beim Speichern der Berechtigung');
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete permission');
      }

      toast.success('Berechtigung gelöscht');
      setPermissions(prev => prev.filter(permission => permission.id !== permissionId));
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Fehler beim Löschen der Berechtigung');
    }
  };

  const handleCreatePermission = async (): Promise<PermissionListItem> => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'neue.berechtigung',
          description: null,
          resource: 'resource'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create permission');
      }

      const newPermission = await response.json();
      
      const permissionListItem: PermissionListItem = {
        id: newPermission.id,
        name: newPermission.name,
        description: newPermission.description,
        resource: newPermission.resource,
        lastModified: newPermission.createdAt
      };
      
      toast.success('Neue Berechtigung erstellt');
      setPermissions(prev => [...prev, permissionListItem]);
      return permissionListItem;
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Fehler beim Erstellen der Berechtigung');
      throw error;
    }
  };

  const handleCopyPermission = async (originalPermission: PermissionListItem): Promise<PermissionListItem> => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${originalPermission.name}.kopie`,
          description: originalPermission.description,
          resource: originalPermission.resource
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to copy permission');
      }

      const copiedPermission = await response.json();

      const permissionListItem: PermissionListItem = {
        id: copiedPermission.id,
        name: copiedPermission.name,
        description: copiedPermission.description,
        resource: copiedPermission.resource,
        lastModified: copiedPermission.createdAt
      };

      toast.success(`Berechtigung "${originalPermission.name}" wurde kopiert`);
      setPermissions(prev => [...prev, permissionListItem]);
      return permissionListItem;
    } catch (error) {
      console.error('Error copying permission:', error);
      toast.error('Fehler beim Kopieren der Berechtigung');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Berechtigungsverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Berechtigungsverwaltung</h2>
      <PermissionListTable 
        data={permissions}
        onSavePermissionChanges={handleSavePermissionChanges}
        onDeletePermission={handleDeletePermission}
        onCreatePermission={handleCreatePermission}
        onCopyPermission={handleCopyPermission}
      />
    </div>
  );
};

export default PermissionManagement; 