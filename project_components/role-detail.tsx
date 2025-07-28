'use client';

import type React from 'react';
import { useState, useEffect, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatGermanDate } from '@/helper/date-formatter';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTabReload, useTabTitle } from './tabbed-interface-provider';
import type { Role, Permission } from '@/lib/db/schema';

interface RoleDetailProps {
  roleId: string;
  permissions: Permission[];
  onSaveRoleChanges?: (roleId: string, roleData: { name: string; description?: string | null }) => Promise<void>;
  onSaveRolePermissions?: (roleId: string, permissionIds: string[]) => Promise<void>;
}

const RoleDetail: FC<RoleDetailProps> = ({
  roleId,
  permissions,
  onSaveRoleChanges,
  onSaveRolePermissions,
}) => {
  const [role, setRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('eigenschaften');

  // State for editing
  const [editedRole, setEditedRole] = useState<{ name: string; description: string | null }>({
    name: '',
    description: null
  });
  const [editedPermissionIds, setEditedPermissionIds] = useState<string[]>([]);

  // Set up reload functionality
  const { triggerReload } = useTabReload('roles', () => {});
  
  // Set up tab title functionality
  const { updateTitle } = useTabTitle(`role-detail-${roleId}`);

  // Load role data
  const loadRoleData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const [roleResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/roles/${roleId}`),
        fetch(`/api/roles/${roleId}/permissions`)
      ]);
      
      if (!roleResponse.ok || !permissionsResponse.ok) {
        throw new Error('Failed to fetch role data');
      }
      
      const [roleData, rolePermissionsData] = await Promise.all([
        roleResponse.json(),
        permissionsResponse.json()
      ]);
      
      setRole(roleData);
      setRolePermissions(rolePermissionsData);
      
      // Initialize editing state
      setEditedRole({
        name: roleData.name,
        description: roleData.description
      });
      setEditedPermissionIds(rolePermissionsData.map((p: Permission) => p.id));
      
    } catch (error) {
      console.error('Error loading role:', error);
      setLoadError('Fehler beim Laden der Rolle');
    } finally {
      setIsLoading(false);
    }
  };

  // Load role data when roleId changes
  useEffect(() => {
    if (roleId) {
      loadRoleData();
    }
  }, [roleId]);

  const handleToggleEdit = () => {
    if (isEditing && role) {
      // Reset to original data
      setEditedRole({
        name: role.name,
        description: role.description
      });
      setEditedPermissionIds(rolePermissions.map(p => p.id));
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (isSaving || !role) return;

    setIsSaving(true);
    try {
      // Save role properties
      if (onSaveRoleChanges) {
        await onSaveRoleChanges(role.id, editedRole);
      }

      // Save permissions
      if (onSaveRolePermissions) {
        await onSaveRolePermissions(role.id, editedPermissionIds);
      }

      setIsEditing(false);
      toast.success('Rolle gespeichert');
      
      // Update tab title if role name changed
      if (editedRole.name !== role.name) {
        updateTitle(`Rolle: ${editedRole.name}`);
      }
      
      // Reload data to reflect changes
      await loadRoleData();
      
      // Trigger reload for other tabs
      triggerReload();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (!isEditing) return;
    
    setEditedPermissionIds(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((groups, permission) => {
    if (!groups[permission.resource]) {
      groups[permission.resource] = [];
    }
    groups[permission.resource].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin mr-2" />
          <span>Rolle wird geladen...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || !role) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">{loadError || 'Rolle nicht gefunden'}</div>
          <Button onClick={loadRoleData} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{role.name}</h2>
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          aria-label={isEditing ? 'Abbrechen' : 'Bearbeiten'}
        >
          {isEditing ? (
            'Abbrechen'
          ) : (
            <>
              <Edit3 size={14} className="inline-block" /> Bearbeiten
            </>
          )}
        </Button>
        {isEditing && (
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving}
            aria-label="Änderungen speichern"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="inline-block animate-spin mr-1" />
                Speichern...
              </>
            ) : (
              <>
                <Save size={14} className="inline-block mr-1" />
                Speichern
              </>
            )}
          </Button>
        )}
      </div>
      
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mb-6 w-full flex flex-col"
      >
        <TabsList className="shrink-0 bg-white p-0 border-b flex flex-wrap gap-0 justify-start rounded-none w-full">
          <TabsTrigger
            value="eigenschaften"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger
            value="berechtigungen"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Berechtigungen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="eigenschaften" className="mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Rollen-Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={editedRole.name}
                  onChange={e => setEditedRole(prev => ({ ...prev, name: e.target.value }))}
                  readOnly={!isEditing}
                  className="read-only:bg-gray-100 read-only:cursor-not-allowed"
                />
              </div>
              <div>
                <Label htmlFor="role-description">Beschreibung</Label>
                <Textarea
                  id="role-description"
                  value={editedRole.description || ''}
                  onChange={e => setEditedRole(prev => ({ ...prev, description: e.target.value || null }))}
                  readOnly={!isEditing}
                  className="read-only:bg-gray-100 read-only:cursor-not-allowed"
                  rows={3}
                />
              </div>
              <div className="text-sm text-gray-500">
                              <div>Erstellt am: {formatGermanDate(role.createdAt)}</div>
              <div>Zuletzt geändert: {formatGermanDate(role.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="berechtigungen" className="mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Berechtigungen</h3>
              <p className="text-sm text-gray-600">
                Wählen Sie die Berechtigungen aus, die dieser Rolle zugewiesen werden sollen.
              </p>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Keine Berechtigungen verfügbar.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="border rounded-lg p-4">
                      <h4 className="font-medium text-lg mb-3 capitalize">{resource}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {resourcePermissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={editedPermissionIds.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(permission.id, checked as boolean)
                              }
                              disabled={!isEditing}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`permission-${permission.id}`}
                                className={`text-sm font-medium ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {permission.name}
                              </label>
                              {permission.description && (
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleDetail; 