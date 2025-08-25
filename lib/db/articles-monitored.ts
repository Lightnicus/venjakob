import { eq, and, count, asc, isNull, inArray, or, desc } from 'drizzle-orm';
import { db } from './index';
import { articles, articleCalculationItem, blockContent, languages, changeHistory, users, type Article } from './schema';
import { withQueryMonitoring, performanceMonitor } from '@/lib/performance/performance-monitor';
import { getArticleWithCalculations as originalGetArticleWithCalculations, saveArticle as originalSaveArticle, deleteArticle as originalDeleteArticle, saveArticleCalculations as originalSaveArticleCalculations, saveArticleContent as originalSaveArticleContent, getArticlesByLanguage as originalGetArticlesByLanguage, copyArticle as originalCopyArticle, EditLockError } from './articles';

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

// Optimized version of getArticleList with batch queries, parallel execution, and combined queries
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
      // PARALLEL EXECUTION: Run all independent queries simultaneously
      const [allArticles, defaultLanguage, allLanguages, allArticleContent, calculationCounts, defaultLanguageTitles] = await Promise.all([
        // Monitor the main articles query
        withQueryMonitoring(
          () => db.select().from(articles).where(eq(articles.deleted, false)).orderBy(articles.number),
          'getAllArticlesForList'
        )(),
        
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
        )(),
        
        // BATCH QUERY 1: Get all calculation counts in one query
        withQueryMonitoring(
          () => db
            .select({
              articleId: articleCalculationItem.articleId,
              count: count(articleCalculationItem.id)
            })
            .from(articleCalculationItem)
            .where(and(eq(articleCalculationItem.deleted, false)))
            .groupBy(articleCalculationItem.articleId),
          'getAllCalculationCountsBatch'
        )(),
        
        // BATCH QUERY 2: Get all titles for default language in one query
        withQueryMonitoring(
          () => db
            .select({
              articleId: blockContent.articleId,
              title: blockContent.title
            })
            .from(blockContent)
            .where(
              and(
                isNull(blockContent.blockId),
                eq(blockContent.deleted, false)
              )
            ),
          'getAllDefaultLanguageTitlesBatch'
        )()
      ]);
      
      if (allArticles.length === 0) {
        return [];
      }
      
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
        // Get title from batch data (filter by default language if available)
        let title = '';
        if (defaultLanguage[0]) {
          const articleTitles = defaultLanguageTitles.filter(
            item => item.articleId === article.id && 
            allArticleContent.some(content => 
              content.articleId === article.id && 
              content.languageId === defaultLanguage[0].id
            )
          );
          title = articleTitles[0]?.title || '';
        }
        
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

// Optimized version of getArticleWithCalculations with parallel execution
export const getArticleWithCalculations = async (articleId: string) => {
  const startTime = performance.now();
  try {
    // PARALLEL EXECUTION: Run all independent queries simultaneously
    const [articleResult, calculationItems, articleContent] = await Promise.all([
      // Monitor the main article query
      withQueryMonitoring(
        () => db.select().from(articles).where(and(eq(articles.id, articleId), eq(articles.deleted, false))),
        `getArticle_${articleId}`
      )(),
      
      // Monitor the calculation items query
      withQueryMonitoring(
        () => db
          .select()
          .from(articleCalculationItem)
          .where(and(eq(articleCalculationItem.articleId, articleId), eq(articleCalculationItem.deleted, false)))
          .orderBy(asc(articleCalculationItem.order)),
        `getCalculationItems_${articleId}`
      )(),
      
      // Monitor the article content query
      withQueryMonitoring(
        () => db
          .select()
          .from(blockContent)
          .where(and(eq(blockContent.articleId, articleId), eq(blockContent.deleted, false))),
        `getArticleContent_${articleId}`
      )()
    ]);

    const [article] = articleResult;
    if (!article) return null;

    // OPTIMIZATION: Only fetch change history if we have content or need it
    let lastChangedBy = null;
    if (articleContent.length > 0) {
      // Get content IDs for change history query
      const contentIds = articleContent.map(content => content.id);
      
      // Monitor the change history query (only if we have content)
      const recentChanges = await withQueryMonitoring(
        () => db
          .select({
            timestamp: changeHistory.timestamp,
            entityType: changeHistory.entityType,
            userId: changeHistory.userId,
            userName: users.name,
            userEmail: users.email,
          })
          .from(changeHistory)
          .leftJoin(users, eq(changeHistory.userId, users.id))
          .where(or(
            and(
              eq(changeHistory.entityType, 'articles'),
              eq(changeHistory.entityId, articleId)
            ),
            and(
              eq(changeHistory.entityType, 'block_content'),
              inArray(changeHistory.entityId, contentIds)
            )
          ))
          .orderBy(desc(changeHistory.timestamp))
          .limit(1),
        `getChangeHistory_${articleId}`
      )();

      if (recentChanges.length > 0) {
        const recentChange = recentChanges[0];
        lastChangedBy = {
          id: recentChange.userId,
          name: recentChange.userName,
          email: recentChange.userEmail || '',
          timestamp: recentChange.timestamp,
          changeType: recentChange.entityType === 'articles' ? 'article' as const : 'content' as const
        };
      }
    } else {
      // OPTIMIZATION: Simpler query when no content exists
      const recentChanges = await withQueryMonitoring(
        () => db
          .select({
            timestamp: changeHistory.timestamp,
            entityType: changeHistory.entityType,
            userId: changeHistory.userId,
            userName: users.name,
            userEmail: users.email,
          })
          .from(changeHistory)
          .leftJoin(users, eq(changeHistory.userId, users.id))
          .where(and(
            eq(changeHistory.entityType, 'articles'),
            eq(changeHistory.entityId, articleId)
          ))
          .orderBy(desc(changeHistory.timestamp))
          .limit(1),
        `getChangeHistory_${articleId}`
      )();

      if (recentChanges.length > 0) {
        const recentChange = recentChanges[0];
        lastChangedBy = {
          id: recentChange.userId,
          name: recentChange.userName,
          email: recentChange.userEmail || '',
          timestamp: recentChange.timestamp,
          changeType: recentChange.entityType === 'articles' ? 'article' as const : 'content' as const
        };
      }
    }

    const result = {
      ...article,
      calculations: calculationItems,
      content: articleContent,
      lastChangedBy
    };

    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticleWithCalculations_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticleWithCalculations_${articleId}`, duration);
    throw error;
  }
};

// Monitored version of saveArticle
export const saveArticle = async (articleId: string, articleData: any) => {
  const startTime = performance.now();
  try {
    const result = await originalSaveArticle(articleId, articleData);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticle_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticle_${articleId}`, duration);
    throw error;
  }
};

// Monitored version of deleteArticle
export const deleteArticle = async (articleId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalDeleteArticle(articleId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`deleteArticle_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`deleteArticle_${articleId}`, duration);
    throw error;
  }
};

// Monitored version of saveArticleCalculations
export const saveArticleCalculations = async (articleId: string, calculations: any[]) => {
  const startTime = performance.now();
  try {
    const result = await originalSaveArticleCalculations(articleId, calculations);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticleCalculations_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticleCalculations_${articleId}`, duration);
    throw error;
  }
};

// Monitored version of saveArticleContent
export const saveArticleContent = async (articleId: string, content: any[]) => {
  const startTime = performance.now();
  try {
    const result = await originalSaveArticleContent(articleId, content);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticleContent_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`saveArticleContent_${articleId}`, duration);
    throw error;
  }
};

// Monitored version of getArticlesByLanguage
export const getArticlesByLanguage = async (languageId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalGetArticlesByLanguage(languageId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticlesByLanguage_${languageId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticlesByLanguage_${languageId}`, duration);
    throw error;
  }
};

// Monitored version of copyArticle
export const copyArticle = async (originalArticleId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalCopyArticle(originalArticleId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`copyArticle_${originalArticleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`copyArticle_${originalArticleId}`, duration);
    throw error;
  }
};

// Re-export EditLockError for compatibility
export { EditLockError };
