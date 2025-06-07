import { useState, useEffect } from 'react';
import ArticleListTable from './article-list-table';
import type { Language, ArticleCalculationItem } from '@/lib/db/schema';
import type { ArticleWithCalculations } from '@/lib/db/articles';
import { toast } from 'sonner';
import {
  fetchArticlesWithCalculations,
  fetchCalculationItems,
  saveArticlePropertiesAPI,
  saveArticleContentAPI,
  deleteArticleAPI,
  createNewArticleAPI,
} from '@/lib/api/articles';
import { fetchLanguages } from '@/lib/api/blocks';

const ArticleManagement = () => {
  const [articles, setArticles] = useState<(ArticleWithCalculations & { calculationCount?: number })[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [calculationItems, setCalculationItems] = useState<ArticleCalculationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesData, languagesData, calculationItemsData] = await Promise.all([
        fetchArticlesWithCalculations(),
        fetchLanguages(),
        fetchCalculationItems()
      ]);
      setArticles(articlesData);
      setLanguages(languagesData);
      setCalculationItems(calculationItemsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticleProperties = async (articleId: string, articleData: Parameters<typeof saveArticlePropertiesAPI>[1]) => {
    try {
      await saveArticlePropertiesAPI(articleId, articleData);
      toast.success('Artikel-Eigenschaften gespeichert');
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving article properties:', error);
      toast.error('Fehler beim Speichern der Artikel-Eigenschaften');
    }
  };

  const handleSaveArticleContent = async (articleId: string, contentData: any[]) => {
    try {
      await saveArticleContentAPI(articleId, contentData);
      toast.success('Artikel-Inhalte gespeichert');
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error saving article content:', error);
      toast.error('Fehler beim Speichern der Artikel-Inhalte');
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
        calculationItems={calculationItems}
        onSaveArticleProperties={handleSaveArticleProperties}
        onSaveArticleContent={handleSaveArticleContent}
        onDeleteArticle={handleDeleteArticle}
        onCreateArticle={handleCreateArticle}
      />
    </div>
  );
};

export default ArticleManagement; 