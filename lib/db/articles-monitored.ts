import { eq, and, count, asc, isNull } from 'drizzle-orm';
import { db } from './index';
import { articles, articleCalculationItem, blockContent, languages, type Article } from './schema';
import { withQueryMonitoring } from '@/lib/performance/performance-monitor';

// Monitored version of getArticlesWithCalculationCounts
export const getArticlesWithCalculationCounts = withQueryMonitoring(
  async (): Promise<(Article & { calculationCount: number })[]> => {
    try {
      // Monitor the main articles query
      const allArticles = await withQueryMonitoring(
        () => db.select().from(articles).where(eq(articles.deleted, false)).orderBy(articles.number),
        'getAllArticles'
      )();
      
      // Monitor the calculation counts queries
      const articlesWithCounts = await Promise.all(
        allArticles.map(async (article) => {
          const [countResult] = await withQueryMonitoring(
            () => db
              .select({ count: count(articleCalculationItem.id) })
              .from(articleCalculationItem)
              .where(and(eq(articleCalculationItem.articleId, article.id), eq(articleCalculationItem.deleted, false))),
            `getCalculationCount_${article.id}`
          )();
          
          return {
            ...article,
            calculationCount: Number(countResult?.count || 0)
          };
        })
      );
      
      return articlesWithCounts;
    } catch (error) {
      console.error('Error fetching articles with calculation counts:', error);
      throw new Error('Failed to fetch articles');
    }
  },
  'getArticlesWithCalculationCounts'
);

// Monitored version of getArticleList
export const getArticleList = withQueryMonitoring(
  async (): Promise<{
    id: string;
    number: string;
    title: string;
    price: string | null;
    hideTitle: boolean;
    updatedAt: string;
    calculationCount: number;
    languages: string;
  }[]> => {
    try {
      // Monitor the main articles query
      const allArticles = await withQueryMonitoring(
        () => db.select().from(articles).where(eq(articles.deleted, false)).orderBy(articles.number),
        'getAllArticlesForList'
      )();
      
      // Monitor the default language query
      const [defaultLanguage] = await withQueryMonitoring(
        () => db
          .select()
          .from(languages)
          .where(eq(languages.default, true))
          .limit(1),
        'getDefaultLanguage'
      )();
      
      // Monitor the all languages query
      const allLanguages = await withQueryMonitoring(
        () => db.select().from(languages),
        'getAllLanguages'
      )();
      
      // Monitor the article content query
      const allArticleContent = await withQueryMonitoring(
        () => db
          .select({
            articleId: blockContent.articleId,
            title: blockContent.title,
            languageId: blockContent.languageId,
          })
          .from(blockContent)
          .where(and(isNull(blockContent.blockId), eq(blockContent.deleted, false))),
        'getAllArticleContent'
      )();
      
      // Monitor the per-article queries
      const articlesWithCounts = await Promise.all(
        allArticles.map(async (article) => {
          // Monitor calculation count query
          const [countResult] = await withQueryMonitoring(
            () => db
              .select({ count: count(articleCalculationItem.id) })
              .from(articleCalculationItem)
              .where(and(eq(articleCalculationItem.articleId, article.id), eq(articleCalculationItem.deleted, false))),
            `getCalculationCountForList_${article.id}`
          )();
          
          // Monitor title query for default language
          let title = '';
          if (defaultLanguage) {
            const [contentResult] = await withQueryMonitoring(
              () => db
                .select({ title: blockContent.title })
                .from(blockContent)
                .where(
                  and(
                    eq(blockContent.articleId, article.id),
                    eq(blockContent.languageId, defaultLanguage.id),
                    eq(blockContent.deleted, false)
                  )
                )
                .limit(1),
              `getTitleForDefaultLanguage_${article.id}`
            )();
            
            if (contentResult?.title) {
              title = contentResult.title;
            }
          }
          
          // Get languages for this article (using already fetched data)
          const articleContents = allArticleContent.filter(content => content.articleId === article.id);
          const uniqueLanguageIds = Array.from(new Set(articleContents.map(ac => ac.languageId)));
          const articleLanguages = uniqueLanguageIds
            .map(languageId => allLanguages.find(l => l.id === languageId))
            .filter((lang): lang is typeof allLanguages[number] => Boolean(lang));
          
          const sortedLanguages = articleLanguages.sort((a, b) => {
            if (a.default && !b.default) return -1;
            if (!a.default && b.default) return 1;
            return a.label.localeCompare(b.label);
          });
          
          const languageLabels = sortedLanguages.map(lang => lang.label);
          const languagesString = languageLabels.length > 0 ? languageLabels.join(', ') : 'Keine Sprachen';
          
          return {
            id: article.id,
            number: article.number,
            title: title,
            price: article.price,
            hideTitle: article.hideTitle,
            updatedAt: article.updatedAt,
            calculationCount: Number(countResult?.count || 0),
            languages: languagesString
          };
        })
      );
      
      return articlesWithCounts;
    } catch (error) {
      console.error('Error fetching article list:', error);
      throw new Error('Failed to fetch article list');
    }
  },
  'getArticleList'
);
