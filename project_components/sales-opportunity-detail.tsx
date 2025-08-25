'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, X, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSalesOpportunity, saveSalesOpportunityPropertiesAPI } from '@/lib/api/sales-opportunities';
import { fetchLanguages } from '@/lib/api/blocks';
import type { SalesOpportunityWithDetails } from '@/lib/db/sales-opportunities';
import type { SalesOpportunity, Language } from '@/lib/db/schema';
import { useTabReload, useTabTitle } from '@/project_components/tabbed-interface-provider';
import { LoadingIndicator } from '@/project_components/loading-indicator';
import LoadingButton from './loading-button';

interface SalesOpportunityDetailProps {
  salesOpportunityId: string;
}

const SalesOpportunityDetail: React.FC<SalesOpportunityDetailProps> = ({ salesOpportunityId }) => {
  const [salesOpportunity, setSalesOpportunity] = useState<SalesOpportunityWithDetails | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<Partial<SalesOpportunity>>({});
  const initialTitleSetRef = useRef(false);

  // Set up reload functionality - triggers reload in other tabs (like SalesOpportunitiesManagement)
  const { triggerReload } = useTabReload('sales-opportunity', () => {});
  
  // Set up tab title functionality
  const { updateTitle } = useTabTitle(`verkaufschance-${salesOpportunityId}`);

  // Load sales opportunity data and languages
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [salesOpportunityData, languagesData] = await Promise.all([
          fetchSalesOpportunity(salesOpportunityId),
          fetchLanguages()
        ]);
        setSalesOpportunity(salesOpportunityData);
        setLanguages(languagesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Fehler beim Laden der Daten');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [salesOpportunityId]);

  // Set initial tab title when data loads (only once)
  useEffect(() => {
    if (salesOpportunity?.keyword && !initialTitleSetRef.current) {
      updateTitle(`Verkaufschance: ${salesOpportunity.keyword}`);
      initialTitleSetRef.current = true;
    }
  }, [salesOpportunity?.keyword, updateTitle]);

  const handleEdit = () => {
    if (salesOpportunity) {
      setEditedData({
        keyword: salesOpportunity.keyword,
        orderInventorySpecification: salesOpportunity.orderInventorySpecification,
        status: salesOpportunity.status,
        businessArea: salesOpportunity.businessArea,
        quoteVolume: salesOpportunity.quoteVolume,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!salesOpportunity) return;

    try {
      setIsSaving(true);
      await saveSalesOpportunityPropertiesAPI(salesOpportunity.id, editedData);
      
      // Update local state
      setSalesOpportunity(prev => prev ? { ...prev, ...editedData } : null);
      setIsEditing(false);
      setEditedData({});
      
      // Update tab title if keyword changed
      if (editedData.keyword && editedData.keyword !== salesOpportunity.keyword) {
        updateTitle(`Verkaufschance: ${editedData.keyword}`);
      }
      
      // Trigger reload for other tabs (like SalesOpportunitiesManagement)
      triggerReload();
      
      toast.success('Verkaufschance erfolgreich gespeichert');
    } catch (error: any) {
      if (error.type === 'EDIT_LOCK_ERROR') {
        toast.error(`Verkaufschance wird bereits bearbeitet: ${error.message}`);
      } else {
        toast.error('Fehler beim Speichern der Verkaufschance');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleInputChange = (field: keyof SalesOpportunity, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to get language label by ID
  const getLanguageLabel = (languageId: string | null): string => {
    if (!languageId) return 'Keine';
    const language = languages.find(lang => lang.id === languageId);
    return language ? language.label : 'Unbekannt';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingIndicator />
      </div>
    );
  }

  if (!salesOpportunity) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">Verkaufschance nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {salesOpportunity.keyword || 'Verkaufschance'}
          </h1>
          <p className="text-gray-600">{salesOpportunity.client.name}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline" disabled={isSaving}>
              <Edit3 className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          ) : (
            <>
              <LoadingButton 
                onClick={handleSave} 
                variant="default" 
                loading={isSaving}
                loadingText="Speichern..."
              >
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </>
              </LoadingButton>
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="eigenschaften" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eigenschaften">Eigenschaften</TabsTrigger>
          <TabsTrigger value="angebote">Angebote ({salesOpportunity.quotesCount})</TabsTrigger>
          <TabsTrigger value="historie">Historie</TabsTrigger>
          <TabsTrigger value="notizen">Notizen</TabsTrigger>
        </TabsList>

        <TabsContent value="eigenschaften" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stichwort
              </label>
              <input
                type="text"
                value={isEditing ? (editedData.keyword || '') : (salesOpportunity.keyword || '')}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                readOnly={!isEditing}
                className="w-full border rounded px-3 py-2 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={isEditing ? (editedData.status || salesOpportunity.status) : salesOpportunity.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={!isEditing}
                className="w-full border rounded px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="open">Offen</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="won">Gewonnen</option>
                <option value="lost">Verloren</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geschäftsbereich
              </label>
              <input
                type="text"
                value={isEditing ? (editedData.businessArea || '') : (salesOpportunity.businessArea || '')}
                onChange={(e) => handleInputChange('businessArea', e.target.value)}
                readOnly={!isEditing}
                className="w-full border rounded px-3 py-2 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angebotswert
              </label>
              <input
                type="text"
                value={isEditing ? (editedData.quoteVolume || '') : (salesOpportunity.quoteVolume || '')}
                onChange={(e) => handleInputChange('quoteVolume', e.target.value)}
                readOnly={!isEditing}
                className="w-full border rounded px-3 py-2 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bestellspezifikation
              </label>
              <textarea
                value={isEditing ? (editedData.orderInventorySpecification || '') : (salesOpportunity.orderInventorySpecification || '')}
                onChange={(e) => handleInputChange('orderInventorySpecification', e.target.value)}
                readOnly={!isEditing}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm bg-white read-only:bg-gray-100 read-only:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Kundendaten</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {salesOpportunity.client.name}</div>
                <div><strong>Fremd-ID:</strong> {salesOpportunity.client.foreignId || 'Keine'}</div>
                <div><strong>Sprache:</strong> {getLanguageLabel(salesOpportunity.client.languageId)}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Kontaktdaten</h3>
              <div className="space-y-2 text-sm">
                {salesOpportunity.contactPerson ? (
                  <>
                    <div><strong>Ansprechpartner:</strong> {salesOpportunity.contactPerson.name}</div>
                    <div><strong>E-Mail:</strong> {salesOpportunity.contactPerson.email || 'Keine'}</div>
                    <div><strong>Telefon:</strong> {salesOpportunity.contactPerson.phone || 'Keine'}</div>
                  </>
                ) : (
                  <div className="text-gray-500">Kein Ansprechpartner zugeordnet</div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="angebote" className="mt-4">
          <div className="text-gray-500">
            Angebote-Liste wird hier angezeigt ({salesOpportunity.quotesCount} Angebote)
          </div>
        </TabsContent>

        <TabsContent value="historie" className="mt-4">
          <div className="text-gray-500">
            Änderungshistorie wird hier angezeigt
          </div>
        </TabsContent>

        <TabsContent value="notizen" className="mt-4">
          <div className="text-gray-500">
            Notizen-Bereich wird hier angezeigt
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesOpportunityDetail;
