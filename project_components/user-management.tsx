import { useState, useEffect } from 'react';
import UserListTable from './user-list-table';
import ManagementWrapper from './management-wrapper';
import type { User, Role } from '@/lib/db/schema';
import { toast } from 'sonner';
import { useTabReload } from './tabbed-interface-provider';

type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  roleCount: number;
  lastModified: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles')
      ]);

      if (!usersResponse.ok || !rolesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, rolesData] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json()
      ]);

      // Get role counts for each user
      const userListItems = await Promise.all(
        usersData.map(async (user: User) => {
          try {
            const rolesResponse = await fetch(`/api/users/${user.id}/roles`);
            const userRoles = rolesResponse.ok ? await rolesResponse.json() : [];
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              roleCount: userRoles.length,
              lastModified: user.updatedAt.toString(),
            };
          } catch (error) {
            console.error(`Error loading roles for user ${user.id}:`, error);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              roleCount: 0,
              lastModified: user.updatedAt.toString(),
            };
          }
        })
      );

      setUsers(userListItems);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for users
  useTabReload('users', loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUserChanges = async (
    userId: string, 
    userData: { name: string | null; email: string }
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      await loadData();
    } catch (error) {
      console.error('Error saving user changes:', error);
      toast.error('Fehler beim Speichern des Benutzers');
    }
  };

  const handleSaveUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user roles');
      }

      await loadData();
    } catch (error) {
      console.error('Error saving user roles:', error);
      toast.error('Fehler beim Speichern der Benutzerrollen');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('Benutzer gelöscht');
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Fehler beim Löschen des Benutzers');
    }
  };

  const handleCreateUser = async (): Promise<UserListItem> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Neuer Benutzer',
          email: 'neuer.benutzer@example.com'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      
      const userListItem: UserListItem = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleCount: 0,
        lastModified: newUser.createdAt
      };
      
      toast.success('Neuer Benutzer erstellt');
      setUsers(prev => [...prev, userListItem]);
      return userListItem;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Fehler beim Erstellen des Benutzers');
      throw error;
    }
  };

  const handleCopyUser = async (originalUser: UserListItem): Promise<UserListItem> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${originalUser.name || 'Unbekannt'} Kopie`,
          email: `kopie.${originalUser.email}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to copy user');
      }

      const copiedUser = await response.json();

      const userListItem: UserListItem = {
        id: copiedUser.id,
        name: copiedUser.name,
        email: copiedUser.email,
        roleCount: 0,
        lastModified: copiedUser.createdAt
      };

      toast.success(`Benutzer "${originalUser.name || originalUser.email}" wurde kopiert`);
      setUsers(prev => [...prev, userListItem]);
      return userListItem;
    } catch (error) {
      console.error('Error copying user:', error);
      toast.error('Fehler beim Kopieren des Benutzers');
      throw error;
    }
  };

  return (
    <ManagementWrapper title="Benutzerverwaltung" permission="admin" loading={loading}>
      <UserListTable 
        data={users}
        roles={roles}
        onSaveUserChanges={handleSaveUserChanges}
        onSaveUserRoles={handleSaveUserRoles}
        onDeleteUser={handleDeleteUser}
        onCreateUser={handleCreateUser}
        onCopyUser={handleCopyUser}
      />
    </ManagementWrapper>
  );
};

export default UserManagement; 