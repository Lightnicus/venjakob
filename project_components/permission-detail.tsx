'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatGermanDate } from '@/helper/date-formatter';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Permission } from '@/lib/db/schema';

interface PermissionDetailProps {
  permissionId: string;
  onSavePermissionChanges?: (
    permissionId: string,
    permissionData: { name: string; description?: string | null; resource: string }
  ) => Promise<void>;
}

const PermissionDetail: React.FC<PermissionDetailProps> = ({
  permissionId,
  onSavePermissionChanges,
}) => {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
  });

  useEffect(() => {
    const loadPermission = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/permissions/${permissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch permission');
        }
        
        const permissionData = await response.json();
        setPermission(permissionData);
        
        setFormData({
          name: permissionData.name || '',
          description: permissionData.description || '',
          resource: permissionData.resource || '',
        });
      } catch (error) {
        console.error('Error loading permission:', error);
        toast.error('Fehler beim Laden der Berechtigung');
      } finally {
        setLoading(false);
      }
    };

    loadPermission();
  }, [permissionId]);

  const handleToggleEdit = () => {
    if (isEditing && permission) {
      // Reset to original data
      setFormData({
        name: permission.name || '',
        description: permission.description || '',
        resource: permission.resource || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (onSavePermissionChanges) {
        await onSavePermissionChanges(permissionId, {
          name: formData.name,
          description: formData.description || null,
          resource: formData.resource,
        });
      }
      
      toast.success('Berechtigung gespeichert');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving permission:', error);
      toast.error('Fehler beim Speichern der Berechtigung');
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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Lade Berechtigung...</div>
        </div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-500">Berechtigung nicht gefunden</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{permission.name}</h2>
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

      <Card>
        <CardHeader>
          <CardTitle>Eigenschaften</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="z.B. artikel.lesen"
                readOnly={!isEditing}
                className="read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resource">Ressource *</Label>
              <Input
                id="resource"
                value={formData.resource}
                onChange={(e) => handleInputChange('resource', e.target.value)}
                placeholder="z.B. artikel"
                readOnly={!isEditing}
                className="read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschreibung der Berechtigung..."
              rows={3}
              readOnly={!isEditing}
              className="read-only:bg-gray-100 read-only:cursor-not-allowed"
            />
          </div>
          
          <div className="text-sm text-gray-500">
                          <div>Erstellt am: {formatGermanDate(permission.createdAt)}</div>
              <div>Zuletzt geändert: {formatGermanDate(permission.updatedAt)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionDetail; 