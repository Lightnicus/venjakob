import { useState, useEffect } from 'react';
import QuotesListTable from '@/project_components/quotes-list-table';
import type { Language } from '@/lib/db/schema';
import { toast } from 'sonner';
import {
  fetchQuotesList,
  saveQuotePropertiesAPI,
  deleteQuoteAPI,
  createNewQuoteAPI,
  copyQuoteAPI,
} from '@/lib/api/quotes';
import { fetchLanguages } from '@/lib/api/blocks';
import { useTabReload } from './tabbed-interface-provider';
import { usePermissionGuard } from '@/hooks/use-permission-guard';

type QuoteListItem = {
  id: string;
  quoteNumber: string;
  title: string | null;
  salesOpportunityKeyword: string | null;
  variantsCount: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

const QuotesManagement = () => {
  const { isLoading: permissionLoading, hasAccess, AccessDeniedComponent } = usePermissionGuard('angebote');
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotesData, languagesData] = await Promise.all([
        fetchQuotesList(),
        fetchLanguages()
      ]);
      setQuotes(quotesData);
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
    // Only load data if user has access
    if (hasAccess && !permissionLoading) {
      loadData();
    }
  }, [hasAccess, permissionLoading]);

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

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuoteAPI(quoteId);
      toast.success('Angebot gelöscht');
      // Remove from local state immediately
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Fehler beim Löschen des Angebots');
    }
  };

  const handleCreateQuote = async (): Promise<QuoteListItem> => {
    try {
      // This would need a sales opportunity ID in a real implementation
      // For now, we'll use a placeholder
      const newQuote = await createNewQuoteAPI({
        title: 'Neues Angebot',
        salesOpportunityId: '00000000-0000-0000-0000-000000000000', // Placeholder - would come from a dialog
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });
      toast.success('Neues Angebot erstellt');
      
      // Convert to QuoteListItem format
      const quoteListItem: QuoteListItem = {
        id: newQuote.id,
        quoteNumber: newQuote.quoteNumber,
        title: newQuote.title,
        salesOpportunityKeyword: null, // New quotes don't have sales opportunity data loaded
        variantsCount: 0,
        validUntil: newQuote.validUntil,
        createdAt: newQuote.createdAt,
        updatedAt: newQuote.updatedAt
      };
      
      setQuotes(prev => [...prev, quoteListItem]);
      return quoteListItem;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Fehler beim Erstellen des Angebots');
      throw error;
    }
  };

  const handleCopyQuote = async (quote: QuoteListItem): Promise<QuoteListItem> => {
    try {
      const copiedQuote = await copyQuoteAPI(quote);
      toast.success(`Angebot "${quote.title || quote.quoteNumber}" wurde kopiert`);
      
      // Convert to QuoteListItem format
      const quoteListItem: QuoteListItem = {
        id: copiedQuote.id,
        quoteNumber: copiedQuote.quoteNumber,
        title: copiedQuote.title,
        salesOpportunityKeyword: null, // Copied quotes will get their data when reloaded
        variantsCount: 0,
        validUntil: copiedQuote.validUntil,
        createdAt: copiedQuote.createdAt,
        updatedAt: copiedQuote.updatedAt
      };
      
      setQuotes(prev => [...prev, quoteListItem]);
      return quoteListItem;
    } catch (error) {
      console.error('Error copying quote:', error);
      toast.error('Fehler beim Kopieren des Angebots');
      throw error;
    }
  };

  // Permission checking in render
  if (permissionLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Angebotsverwaltung</h2>
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
        <h2 className="text-2xl font-bold mb-2">Angebotsverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Angebotsverwaltung</h2>
      <QuotesListTable 
        data={quotes}
        languages={languages}
        onSaveQuoteProperties={handleSaveQuoteProperties}
        onDeleteQuote={handleDeleteQuote}
        onCreateQuote={handleCreateQuote}
        onCopyQuote={handleCopyQuote}
      />
    </div>
  );
};

export default QuotesManagement; 