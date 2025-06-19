'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User, Role } from '@/lib/db/schema';

interface UserDetailProps {
  userId: string;
  roles: Role[];
  onSaveUserChanges?: (
    userId: string,
    userData: { name: string | null; email: string }
  ) => Promise<void>;
  onSaveUserRoles?: (userId: string, roleIds: string[]) => Promise<void>;
}

const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  roles,
  onSaveUserChanges,
  onSaveUserRoles,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const [userResponse, rolesResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/roles`)
        ]);
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await userResponse.json();
        const userRolesData = rolesResponse.ok ? await rolesResponse.json() : [];
        
        setUser(userData);
        setFormData({ name: userData.name || '', email: userData.email || '' });
        setSelectedRoles(new Set(userRolesData.map((role: Role) => role.id)));
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Fehler beim Laden des Benutzers');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  const handleToggleEdit = () => {
    if (isEditing && user) {
      // Reset to original data
      setFormData({ name: user.name || '', email: user.email || '' });
      // Reset roles would require reloading, but we'll keep it simple for now
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const promises = [];
      
      if (onSaveUserChanges) {
        promises.push(onSaveUserChanges(userId, {
          name: formData.name || null,
          email: formData.email,
        }));
      }
      
      if (onSaveUserRoles) {
        promises.push(onSaveUserRoles(userId, Array.from(selectedRoles)));
      }
      
      await Promise.all(promises);
      
      if (promises.length > 0) {
        toast.success('Änderungen erfolgreich gespeichert');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (!isEditing) return;
    
    const newSelectedRoles = new Set(selectedRoles);
    if (checked) {
      newSelectedRoles.add(roleId);
    } else {
      newSelectedRoles.delete(roleId);
    }
    setSelectedRoles(newSelectedRoles);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Lade Benutzer...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-500">Benutzer nicht gefunden</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{user.name || user.email}</h2>
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
            onClick={handleSave} 
            disabled={saving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            aria-label="Änderungen speichern"
          >
            {saving ? (
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

      <Tabs defaultValue="properties" className="mb-6 w-full flex flex-col">
        <TabsList className="shrink-0 bg-white p-0 border-b flex flex-wrap gap-0 justify-start rounded-none w-full">
          <TabsTrigger
            value="properties"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Eigenschaften
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="flex items-center gap-1 rounded-none border-r px-4 py-2 data-[state=active]:bg-gray-100 text-sm"
            tabIndex={0}
          >
            Rollen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Vollständiger Name"
                    readOnly={!isEditing}
                    className="read-only:bg-gray-100 read-only:cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="benutzer@example.com"
                    readOnly={!isEditing}
                    className="read-only:bg-gray-100 read-only:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Erstellt am</Label>
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Zuletzt geändert</Label>
                  <div className="text-sm text-gray-500">
                    {new Date(user.updatedAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rollenzuweisung</CardTitle>
              <p className="text-sm text-gray-600">
                Wählen Sie die Rollen aus, die diesem Benutzer zugewiesen werden sollen.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.has(role.id)}
                      onCheckedChange={(checked) => 
                        handleRoleToggle(role.id, checked as boolean)
                      }
                      disabled={!isEditing}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`role-${role.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {role.name}
                      </label>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {roles.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  Keine Rollen verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetail; 