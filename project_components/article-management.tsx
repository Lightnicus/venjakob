import { useState, useEffect } from 'react';
import ArticleListTable from './article-list-table';
import type { Language } from '@/lib/db/schema';
import type { ArticleWithCalculations } from '@/lib/db/articles';
import { toast } from 'sonner';
import {
  fetchArticlesWithCalculations,
  saveArticlePropertiesAPI,
  saveArticleContentAPI,
  saveArticleCalculationsAPI,
  deleteArticleAPI,
  createNewArticleAPI,
  copyArticleAPI,
} from '@/lib/api/articles';
import { fetchLanguages } from '@/lib/api/blocks';
import { useTabReload } from './tabbed-interface-provider';

const ArticleManagement = () => {
  const [articles, setArticles] = useState<(ArticleWithCalculations & { calculationCount?: number })[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesData, languagesData] = await Promise.all([
        fetchArticlesWithCalculations(),
        fetchLanguages()
      ]);
      setArticles(articlesData);
      setLanguages(languagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Set up reload functionality for articles
  useTabReload('articles', loadData);

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveArticleProperties = async (articleId: string, articleData: Parameters<typeof saveArticlePropertiesAPI>[1], reloadData: boolean = true) => {
    try {
      await saveArticlePropertiesAPI(articleId, articleData);
      // Only show toast for direct property saves (reloadData=true), not from ArticleDetail
      if (reloadData) {
        toast.success('Artikel-Eigenschaften gespeichert');
        await loadData();
      }
    } catch (error) {
      console.error('Error saving article properties:', error);
      toast.error('Fehler beim Speichern der Artikel-Eigenschaften');
    }
  };

  const handleSaveArticleContent = async (articleId: string, contentData: any[]) => {
    try {
      await saveArticleContentAPI(articleId, contentData);
      // Don't show toast when called from ArticleDetail - it handles its own success message
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving article content:', error);
      toast.error('Fehler beim Speichern der Artikel-Inhalte');
    }
  };

  const handleSaveArticleCalculations = async (articleId: string, calculations: any[]) => {
    try {
      await saveArticleCalculationsAPI(articleId, calculations);
      // Don't show toast when called from ArticleDetail - it handles its own success message
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving article calculations:', error);
      toast.error('Fehler beim Speichern der Artikel-Kalkulationen');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleAPI(articleId);
      toast.success('Artikel gelöscht');
      // Remove from local state immediately
      setArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Fehler beim Löschen des Artikels');
    }
  };

  const handleCreateArticle = async (): Promise<ArticleWithCalculations> => {
    try {
      // Generate a default article number - in real app this might be more sophisticated
      const articleCount = articles.length;
      const defaultNumber = `ART-${String(articleCount + 1).padStart(3, '0')}`;
      
      const newArticle = await createNewArticleAPI({
        name: 'Neuer Artikel',
        number: defaultNumber,
        description: 'Beschreibung des neuen Artikels',
        price: '0.00',
        hideTitle: false
      });
      toast.success('Neuer Artikel erstellt');
      // Add to local state immediately
      setArticles(prev => [...prev, { ...newArticle, calculationCount: newArticle.calculations.length }]);
      return newArticle;
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Fehler beim Erstellen des Artikels');
      throw error;
    }
  };

  const handleCopyArticle = async (article: ArticleWithCalculations & { calculationCount?: number }): Promise<ArticleWithCalculations> => {
    try {
      const copiedArticle = await copyArticleAPI(article);
      toast.success(`Artikel "${article.name}" wurde kopiert`);
      // Add to local state immediately
      setArticles(prev => [...prev, { ...copiedArticle, calculationCount: copiedArticle.calculations.length }]);
      return copiedArticle;
    } catch (error) {
      console.error('Error copying article:', error);
      toast.error('Fehler beim Kopieren des Artikels');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">Artikelverwaltung</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Artikelverwaltung</h2>
      <ArticleListTable 
        data={articles}
        languages={languages}
        onSaveArticleProperties={handleSaveArticleProperties}
        onSaveArticleContent={handleSaveArticleContent}
        onSaveArticleCalculations={handleSaveArticleCalculations}
        onDeleteArticle={handleDeleteArticle}
        onCreateArticle={handleCreateArticle}
        onCopyArticle={handleCopyArticle}
      />
    </div>
  );
};

export default ArticleManagement; 