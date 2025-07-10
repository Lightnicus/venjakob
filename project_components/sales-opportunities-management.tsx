import { useState, useEffect, useCallback } from 'react';
import { useTabReload } from '@/project_components/tabbed-interface-provider';
import SalesOpportunitiesListTable from '@/project_components/sales-opportunities-list-table';
import ManagementWrapper from './management-wrapper';
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

  // Load data on mount
  useEffect(() => {
    loadSalesOpportunities();
  }, []);



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

  return (
    <ManagementWrapper title="Verkaufschancen-Verwaltung" permission="verkaufschancen" loading={isLoading}>
      <SalesOpportunitiesListTable
        data={salesOpportunities}
        isLoading={isLoading}
        onSaveSalesOpportunity={handleSaveSalesOpportunity}
        onDeleteSalesOpportunity={handleDeleteSalesOpportunity}
        onCopySalesOpportunity={handleCopySalesOpportunity}
      />
    </ManagementWrapper>
  );
};

export default SalesOpportunitiesManagement; 