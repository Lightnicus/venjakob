import { eq, and, count, asc, isNull, inArray } from 'drizzle-orm';
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

// Optimized version of getArticleList with batch queries and parallel execution
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
      
      if (allArticles.length === 0) {
        return [];
      }
      
      const articleIds = allArticles.map(article => article.id);
      
      // PARALLEL EXECUTION: Run independent queries simultaneously
      const [defaultLanguageResult, allLanguages, allArticleContent] = await Promise.all([
        // Monitor the default language query
        withQueryMonitoring(
          () => db
            .select()
            .from(languages)
            .where(eq(languages.default, true))
            .limit(1),
          'getDefaultLanguage'
        )(),
        
        // Monitor the all languages query
        withQueryMonitoring(
          () => db.select().from(languages),
          'getAllLanguages'
        )(),
        
        // Monitor the article content query
        withQueryMonitoring(
          () => db
            .select({
              articleId: blockContent.articleId,
              title: blockContent.title,
              languageId: blockContent.languageId,
            })
            .from(blockContent)
            .where(and(isNull(blockContent.blockId), eq(blockContent.deleted, false))),
          'getAllArticleContent'
        )()
      ]);
      
      // PARALLEL EXECUTION: Run the two batch queries simultaneously
      const [calculationCounts, defaultLanguageTitles] = await Promise.all([
        // BATCH QUERY 1: Get all calculation counts in one query
        withQueryMonitoring(
          () => db
            .select({
              articleId: articleCalculationItem.articleId,
              count: count(articleCalculationItem.id)
            })
            .from(articleCalculationItem)
            .where(and(inArray(articleCalculationItem.articleId, articleIds), eq(articleCalculationItem.deleted, false)))
            .groupBy(articleCalculationItem.articleId),
          'getAllCalculationCountsBatch'
        )(),
        
        // BATCH QUERY 2: Get all titles for default language in one query
        defaultLanguageResult[0] ? withQueryMonitoring(
          () => db
            .select({
              articleId: blockContent.articleId,
              title: blockContent.title
            })
            .from(blockContent)
            .where(
              and(
                inArray(blockContent.articleId, articleIds),
                eq(blockContent.languageId, defaultLanguageResult[0].id),
                eq(blockContent.deleted, false)
              )
            ),
          'getAllDefaultLanguageTitlesBatch'
        )() : Promise.resolve([])
      ]);
      
      // Create maps for quick lookup
      const calculationCountMap = new Map(
        calculationCounts.map(item => [item.articleId, Number(item.count)])
      );
      
      const titleMap = new Map(
        defaultLanguageTitles
          .filter(item => item.articleId !== null)
          .map(item => [item.articleId!, item.title])
      );
      
      // Process results using the batch data
      const articlesWithCounts = allArticles.map((article) => {
        // Get title from batch data
        const title = titleMap.get(article.id) || '';
        
        // Get calculation count from batch data
        const calculationCount = calculationCountMap.get(article.id) || 0;
        
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
          calculationCount: calculationCount,
          languages: languagesString
        };
      });
      
      return articlesWithCounts;
    } catch (error) {
      console.error('Error fetching article list:', error);
      throw new Error('Failed to fetch article list');
    }
  },
  'getArticleList'
);
