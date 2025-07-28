import { useState, useEffect } from 'react';
import QuotesListTable from '@/project_components/quotes-list-table';
import ManagementWrapper from './management-wrapper';
import type { Language } from '@/lib/db/schema';
import { toast } from 'sonner';
import {
  fetchVariantsList,
  saveQuotePropertiesAPI,
  deleteQuoteAPI,
  createNewQuoteAPI,
  createQuoteWithVariantAndVersionAPI,
  copyQuoteAPI,
} from '@/lib/api/quotes';
import { fetchLanguages } from '@/lib/api/blocks';
import { useTabReload, useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import QuoteDetail from '@/project_components/quote-detail';

type VariantListItem = {
  id: string;
  quoteId: string;
  quoteNumber: string | null;
  quoteTitle: string | null;
  variantNumber: number;
  variantDescriptor: string;
  languageId: string;
  languageLabel: string | null;
  salesOpportunityStatus: string | null;
  clientForeignId: string | null;
  clientName: string | null;
  latestVersionNumber: number;
  lastModifiedBy: string | null;
  lastModifiedByUserName: string | null;
  lastModifiedAt: string;
};

const QuotesManagement = () => {
  const [variants, setVariants] = useState<VariantListItem[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const { openNewTab } = useTabbedInterface();

  const loadData = async () => {
    try {
      setLoading(true);
      const [variantsData, languagesData] = await Promise.all([
        fetchVariantsList(),
        fetchLanguages()
      ]);
      setVariants(variantsData);
      setLanguages(languagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for quotes
  useTabReload('quotes', loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveQuoteProperties = async (quoteId: string, quoteData: Parameters<typeof saveQuotePropertiesAPI>[1], reloadData: boolean = true) => {
    try {
      await saveQuotePropertiesAPI(quoteId, quoteData);
      // Only show toast for direct property saves (reloadData=true), not from QuoteDetail
      if (reloadData) {
        toast.success('Angebot-Eigenschaften gespeichert');
        await loadData();
      }
    } catch (error) {
      console.error('Error saving quote properties:', error);
      toast.error('Fehler beim Speichern der Angebot-Eigenschaften');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteQuoteAPI(variantId);
      toast.success('Variante gelöscht');
      // Remove from local state immediately
      setVariants(prev => prev.filter(variant => variant.id !== variantId));
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Fehler beim Löschen der Variante');
    }
  };

  const handleCreateQuote = async (
    salesOpportunityId?: string,
    quoteId?: string,
    variantId?: string,
    versionId?: string,
    languageId?: string
  ): Promise<VariantListItem> => {
    try {
      if (!salesOpportunityId) {
        throw new Error('Sales opportunity ID is required');
      }

      // Flow 1: Create new quote with variant and version (none of the new parameters supplied)
      if (!quoteId && !variantId && !versionId && languageId) {
        const result = await createQuoteWithVariantAndVersionAPI({
          title: 'Neues Angebot',
          salesOpportunityId: salesOpportunityId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          languageId: languageId
        });
        
        toast.success('Neues Angebot mit Variante und Version erstellt');
        
        // Convert to VariantListItem format
        const variantListItem: VariantListItem = {
          id: result.variant.id,
          quoteId: result.quote.id,
          quoteNumber: result.quote.quoteNumber,
          quoteTitle: result.quote.title,
          variantNumber: result.variant.variantNumber,
          variantDescriptor: result.variant.variantDescriptor,
          languageId: result.variant.languageId,
          languageLabel: null, // Will be loaded from database
          salesOpportunityStatus: null, // Will be loaded from database
          clientForeignId: null, // Will be loaded from database
          clientName: null, // Will be loaded from database
                  latestVersionNumber: result.version.versionNumber,
        lastModifiedBy: null,
        lastModifiedByUserName: null,
        lastModifiedAt: result.variant.updatedAt
        };
        
        setVariants(prev => [...prev, variantListItem]);
        await loadData(); // Reload to get updated sales opportunity data
        
        // Get the selected language label for tab title
        const selectedLanguage = languages.find(l => l.id === languageId);
        const languageLabel = selectedLanguage?.label || 'Unbekannt';
        
        // Open a new tab with QuoteDetail
        const tabId = `quote-${result.quote.id}`;
        openNewTab({
          id: tabId,
          title: `${result.quote.title || result.quote.quoteNumber} (${languageLabel})`,
          content: <QuoteDetail 
            title={result.quote.title || result.quote.quoteNumber} 
            quoteId={result.quote.id}
            variantId={result.variant.id}
            versionId={result.version.id}
            language={languageLabel} 
          />,
          closable: true
        });
        
        return variantListItem;
      }

      // Flow 2: Create new variant for existing quote (quoteId supplied, but not variantId/versionId)
      if (quoteId && !variantId && !versionId && languageId) {
        // TODO: Implement variant creation flow
        toast.info('Erstelle neue Variante für vorhandenes Angebot (wird später implementiert)');
        throw new Error('Variant creation flow not yet implemented');
      }

      // Flow 3: Create new version for existing variant (quoteId and variantId supplied, but not versionId)
      if (quoteId && variantId && !versionId) {
        // TODO: Implement version creation flow
        toast.info('Erstelle neue Version für vorhandene Variante (wird später implementiert)');
        throw new Error('Version creation flow not yet implemented');
      }

      // Fallback to original flow for backward compatibility
      const newQuote = await createNewQuoteAPI({
        title: 'Neues Angebot',
        salesOpportunityId: salesOpportunityId,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });
      toast.success('Neues Angebot erstellt');
      
      // Convert to VariantListItem format
      const variantListItem: VariantListItem = {
        id: newQuote.id,
        quoteId: newQuote.id,
        quoteNumber: newQuote.quoteNumber,
        quoteTitle: newQuote.title,
        variantNumber: 1,
        variantDescriptor: 'Variante 1',
        languageId: '',
        languageLabel: null,
        salesOpportunityStatus: null,
        clientForeignId: null,
        clientName: null,
        latestVersionNumber: 1,
        lastModifiedBy: null,
        lastModifiedByUserName: null,
        lastModifiedAt: newQuote.updatedAt
      };
      
      setVariants(prev => [...prev, variantListItem]);
      await loadData(); // Reload to get updated sales opportunity data
      return variantListItem;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Fehler beim Erstellen des Angebots');
      throw error;
    }
  };

  const handleCopyVariant = async (variant: VariantListItem): Promise<VariantListItem> => {
    try {
      const copiedQuote = await copyQuoteAPI({ id: variant.quoteId });
      toast.success(`Variante "${variant.quoteTitle || variant.quoteNumber}" wurde kopiert`);
      
      // Convert to VariantListItem format
      const variantListItem: VariantListItem = {
        id: copiedQuote.id,
        quoteId: copiedQuote.id,
        quoteNumber: copiedQuote.quoteNumber,
        quoteTitle: copiedQuote.title,
        variantNumber: variant.variantNumber,
        variantDescriptor: variant.variantDescriptor,
        languageId: variant.languageId,
        languageLabel: variant.languageLabel,
        salesOpportunityStatus: variant.salesOpportunityStatus,
        clientForeignId: variant.clientForeignId,
        clientName: variant.clientName,
        latestVersionNumber: variant.latestVersionNumber,
        lastModifiedBy: variant.lastModifiedBy,
        lastModifiedByUserName: variant.lastModifiedByUserName,
        lastModifiedAt: copiedQuote.updatedAt
      };
      
      setVariants(prev => [...prev, variantListItem]);
      return variantListItem;
    } catch (error) {
      console.error('Error copying variant:', error);
      toast.error('Fehler beim Kopieren der Variante');
      throw error;
    }
  };

  return (
    <ManagementWrapper title="Angebotsverwaltung" permission="angebote" loading={loading}>
      <QuotesListTable 
        data={variants}
        languages={languages}
        onSaveQuoteProperties={handleSaveQuoteProperties}
        onDeleteVariant={handleDeleteVariant}
        onCreateQuote={handleCreateQuote}
        onCopyVariant={handleCopyVariant}
      />
    </ManagementWrapper>
  );
};

export default QuotesManagement; 