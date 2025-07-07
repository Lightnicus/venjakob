import { useState, useEffect, useCallback } from 'react';
import { usePermissionGuard } from '@/hooks/use-permission-guard';
import { useTabReload } from '@/project_components/tabbed-interface-provider';
import SalesOpportunitiesListTable from '@/project_components/sales-opportunities-list-table';
import { 
  fetchSalesOpportunitiesList, 
  saveSalesOpportunityPropertiesAPI, 
  deleteSalesOpportunityAPI, 
  copySalesOpportunityAPI,
  type SalesOpportunityListItem 
} from '@/lib/api/sales-opportunities';
import type { SalesOpportunity } from '@/lib/db/schema';
import { toast } from 'sonner';

const SalesOpportunitiesManagement = () => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent } = usePermissionGuard('verkaufschancen');
  
  const [salesOpportunities, setSalesOpportunities] = useState<SalesOpportunityListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sales opportunities data
  const loadSalesOpportunities = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSalesOpportunitiesList();
      setSalesOpportunities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Verkaufschancen';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up reload functionality for sales opportunities
  useTabReload('sales-opportunities', loadSalesOpportunities);

  // Load data on mount when permission is granted
  useEffect(() => {
    if (hasAccess && !permissionLoading) {
      loadSalesOpportunities();
    }
  }, [hasAccess, permissionLoading]);



  // Save sales opportunity properties
  const handleSaveSalesOpportunity = useCallback(async (
    id: string, 
    salesOpportunityData: Partial<SalesOpportunity>
  ) => {
    try {
      await saveSalesOpportunityPropertiesAPI(id, salesOpportunityData);
      toast.success('Verkaufschance erfolgreich gespeichert');
      await loadSalesOpportunities();
    } catch (err: any) {
      if (err.type === 'EDIT_LOCK_ERROR') {
        toast.error(`Verkaufschance wird bereits bearbeitet: ${err.message}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern der Verkaufschance';
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [loadSalesOpportunities]);

  // Delete sales opportunity
  const handleDeleteSalesOpportunity = useCallback(async (id: string) => {
    try {
      await deleteSalesOpportunityAPI(id);
      toast.success('Verkaufschance erfolgreich gelöscht');
      await loadSalesOpportunities();
    } catch (err: any) {
      if (err.type === 'EDIT_LOCK_ERROR') {
        toast.error(`Verkaufschance wird bereits bearbeitet: ${err.message}`);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen der Verkaufschance';
        toast.error(errorMessage);
      }
      throw err;
    }
  }, [loadSalesOpportunities]);

  // Copy sales opportunity
  const handleCopySalesOpportunity = useCallback(async (originalSalesOpportunityId: string) => {
    try {
      await copySalesOpportunityAPI(originalSalesOpportunityId);
      toast.success('Verkaufschance erfolgreich kopiert');
      await loadSalesOpportunities();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Kopieren der Verkaufschance';
      toast.error(errorMessage);
      throw err;
    }
  }, [loadSalesOpportunities]);

  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-sm text-muted-foreground">Berechtigungen werden überprüft...</div>
      </div>
    );
  }

  // Permission checking in render
  if (permissionLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Verkaufschancen-Verwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Prüfe Berechtigungen...</div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Verkaufschancen-Verwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Verkaufschancen-Verwaltung</h2>
      <SalesOpportunitiesListTable
        data={salesOpportunities}
        isLoading={isLoading}
        onSaveSalesOpportunity={handleSaveSalesOpportunity}
        onDeleteSalesOpportunity={handleDeleteSalesOpportunity}
        onCopySalesOpportunity={handleCopySalesOpportunity}
      />
    </div>
  );
};

export default SalesOpportunitiesManagement; 