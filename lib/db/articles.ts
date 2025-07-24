import { eq, desc, asc, and, count, isNull, sql, inArray, or } from 'drizzle-orm';
import { db } from './index';
import { 
  articles, 
  articleCalculationItem, 
  blockContent,
  languages,
  type Article, 
  type ArticleCalculationItem,
  type InsertArticleCalculationItem,
  type BlockContent
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';
import { auditedArticleOperations, auditedBlockContentOperations, auditQueries, ENTITY_TYPES } from './audit';
import { changeHistory, users } from './schema';
import articleCalculationConfig from '@/data/article-calculation-config.json';

// Common error type for edit lock conflicts
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly articleId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}

// Check if an article is editable by the current user
async function checkArticleEditable(articleId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', articleId);
  }

  // Get article with lock info
  const [article] = await db
    .select({
      id: articles.id,
      blocked: articles.blocked,
      blockedBy: articles.blockedBy,
    })
    .from(articles)
    .where(eq(articles.id, articleId));

  if (!article) {
    throw new Error('Artikel nicht gefunden');
  }

  // Check if article is locked by another user
  if (article.blocked && article.blockedBy && article.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      'Artikel wird bereits von einem anderen Benutzer bearbeitet',
      articleId,
      article.blockedBy,
      article.blocked
    );
  }
}

export type ArticleWithCalculations = Article & {
  calculations: ArticleCalculationItem[];
  content?: BlockContent[];
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
    changeType: 'article' | 'content';
  } | null;
};

// Fetch all articles
export async function getArticles(): Promise<Article[]> {
  try {
    return await db.select().from(articles).orderBy(articles.number);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw new Error('Failed to fetch articles');
  }
}

// Get a single article with all its calculation items and content in correct order
export async function getArticleWithCalculations(articleId: string): Promise<ArticleWithCalculations | null> {
  try {
    // Fetch the article
    const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
    if (!article) return null;
    
    // Fetch calculation items for this article, ordered by the order column
    const calculationItems = await db
      .select()
      .from(articleCalculationItem)
      .where(eq(articleCalculationItem.articleId, articleId))
      .orderBy(asc(articleCalculationItem.order));
    
    // Fetch article content (block_content where articleId is set)
    const articleContent = await db
      .select()
      .from(blockContent)
      .where(eq(blockContent.articleId, articleId));

    // Find the most recent change (article itself or its content)
    let lastChangedBy = null;
    
    // Get all content IDs for this article
    const contentIds = articleContent.map(content => content.id);
    
    // Build the where clause - if no content, only check article changes
    let whereClause;
    if (contentIds.length > 0) {
      whereClause = or(
        and(
          eq(changeHistory.entityType, 'articles'),
          eq(changeHistory.entityId, articleId)
        ),
        and(
          eq(changeHistory.entityType, 'block_content'),
          inArray(changeHistory.entityId, contentIds)
        )
      );
    } else {
      whereClause = and(
        eq(changeHistory.entityType, 'articles'),
        eq(changeHistory.entityId, articleId)
      );
    }
    
    // Query for the most recent change to either the article or its content
    const recentChanges = await db
      .select({
        timestamp: changeHistory.timestamp,
        entityType: changeHistory.entityType,
        userId: changeHistory.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(changeHistory)
      .leftJoin(users, eq(changeHistory.userId, users.id))
      .where(whereClause)
      .orderBy(desc(changeHistory.timestamp))
      .limit(1);

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
    
    return {
      ...article,
      calculations: calculationItems,
      content: articleContent,
      lastChangedBy
    };
  } catch (error) {
    console.error('Error fetching article with calculations:', error);
    throw new Error('Failed to fetch article');
  }
}

// Fetch all articles with their calculation counts
export async function getArticlesWithCalculationCounts(): Promise<(Article & { calculationCount: number })[]> {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.number);
    
    // Get calculation counts for each article
    const articlesWithCounts = await Promise.all(
      allArticles.map(async (article) => {
        const [countResult] = await db
          .select({ count: count(articleCalculationItem.id) })
          .from(articleCalculationItem)
          .where(eq(articleCalculationItem.articleId, article.id));
        
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
}

// Create a new article with audit
export async function createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const newArticle = await auditedArticleOperations.create(
      articleData,
      user.dbUser.id,
      {
        source: 'article-management',
        reason: 'Neuer Artikel erstellt'
      }
    );
    return newArticle;
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  }
}

// Update article properties with audit
export async function saveArticle(
  articleId: string, 
  articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    // Check if article is editable by current user
    await checkArticleEditable(articleId);
    
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await auditedArticleOperations.update(
      articleId,
      articleData,
      user.dbUser.id,
      {
        source: 'article-management',
        reason: 'Artikel-Eigenschaften aktualisiert'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving article:', error);
    throw new Error('Failed to save article');
  }
}

// Save article calculations (replace all)
export async function saveArticleCalculations(
  articleId: string,
  calculations: Omit<ArticleCalculationItem, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  try {
    // Check if article is editable by current user
    await checkArticleEditable(articleId);
    
    // Delete existing calculation items for this article
    await db.delete(articleCalculationItem).where(eq(articleCalculationItem.articleId, articleId));
    
    // Insert new calculation items
    if (calculations.length > 0) {
      await db.insert(articleCalculationItem).values(calculations);
    }
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving article calculations:', error);
    throw new Error('Failed to save article calculations');
  }
}

// Add a single calculation item to an article
export async function addCalculationToArticle(
  articleId: string,
  name: string,
  type: 'time' | 'cost',
  value: string,
  order: number
): Promise<void> {
  try {
    await db.insert(articleCalculationItem).values({
      name,
      type,
      value,
      articleId,
      order
    });
  } catch (error) {
    console.error('Error adding calculation to article:', error);
    throw new Error('Failed to add calculation to article');
  }
}

// Remove a calculation from an article
export async function removeCalculationFromArticle(
  calculationItemId: string
): Promise<void> {
  try {
    await db.delete(articleCalculationItem)
      .where(eq(articleCalculationItem.id, calculationItemId));
  } catch (error) {
    console.error('Error removing calculation from article:', error);
    throw new Error('Failed to remove calculation from article');
  }
}

// Delete an article with audit (related content and calculations will be deleted automatically via CASCADE)
export async function deleteArticle(articleId: string): Promise<void> {
  try {
    // Check if article is editable by current user
    await checkArticleEditable(articleId);
    
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Delete the article with audit - CASCADE will automatically delete related records
    await auditedArticleOperations.delete(
      articleId,
      user.dbUser.id,
      {
        source: 'article-management',
        reason: 'Artikel gelöscht'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  }
}

// Get calculation items that are not tied to any article (global items)
export async function getCalculationItems(): Promise<ArticleCalculationItem[]> {
  try {
    return await db.select().from(articleCalculationItem)
      .where(isNull(articleCalculationItem.articleId))
      .orderBy(articleCalculationItem.name);
  } catch (error) {
    console.error('Error fetching calculation items:', error);
    throw new Error('Failed to fetch calculation items');
  }
}

// Create a global calculation item (not tied to any article)
export async function createCalculationItem(itemData: Omit<InsertArticleCalculationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleCalculationItem> {
  try {
    const [newItem] = await db.insert(articleCalculationItem).values(itemData).returning();
    return newItem;
  } catch (error) {
    console.error('Error creating calculation item:', error);
    throw new Error('Failed to create calculation item');
  }
}

// Create an article with default calculation items from config
export async function createArticleWithDefaults(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleWithCalculations> {
  try {
    return await createNewArticle({
      number: articleData.number,
      price: articleData.price || '0.00',
      hideTitle: articleData.hideTitle || false
    });
  } catch (error) {
    console.error('Error creating article with defaults:', error);
    throw new Error('Failed to create article with defaults');
  }
}

// Update a calculation item
export async function saveCalculationItem(
  itemId: string,
  itemData: Partial<Omit<ArticleCalculationItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
          await db.update(articleCalculationItem)
        .set({ ...itemData, updatedAt: sql`NOW()` })
        .where(eq(articleCalculationItem.id, itemId));
  } catch (error) {
    console.error('Error saving calculation item:', error);
    throw new Error('Failed to save calculation item');
  }
}

// Delete a calculation item
export async function deleteCalculationItem(itemId: string): Promise<void> {
  try {
    await db.delete(articleCalculationItem).where(eq(articleCalculationItem.id, itemId));
  } catch (error) {
    console.error('Error deleting calculation item:', error);
    throw new Error('Failed to delete calculation item');
  }
}

// Create a new article with calculation items from config and audit
export async function createNewArticle(
  articleData: {
    number: string;
    price?: string;
    hideTitle?: boolean;
  }
): Promise<ArticleWithCalculations> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Create the article with audit (this already uses its own transaction)
    const newArticle = await auditedArticleOperations.create(
      {
        number: articleData.number,
        price: articleData.price || '0.00',
        hideTitle: articleData.hideTitle || false
      },
      user.dbUser.id,
      {
        source: 'article-management',
        reason: 'Neuer Artikel mit Standard-Kalkulationen erstellt'
      }
    );

    // Use separate transaction for calculations
    const calculationItems = await db.transaction(async (tx) => {
      const items: ArticleCalculationItem[] = [];
      
      for (const configItem of articleCalculationConfig) {
        const [calculationItem] = await tx.insert(articleCalculationItem).values({
          name: configItem.name,
          type: configItem.type as 'time' | 'cost',
          value: configItem.value,
          articleId: newArticle.id,
          order: configItem.order
        }).returning();
        
        items.push(calculationItem);
      }

      return items;
    });

    return {
      ...newArticle,
      calculations: calculationItems,
      content: []
    };
  } catch (error) {
    console.error('Error creating new article:', error);
    throw new Error('Failed to create new article');
  }
}

// Save article content with audit
export async function saveArticleContent(
  articleId: string,
  contentData: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  try {
    // Check if article is editable by current user
    await checkArticleEditable(articleId);
    
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Use audited bulk replacement operation
    await auditedBlockContentOperations.replaceAll(
      'articles',
      articleId,
      contentData,
      user.dbUser.id,
      {
        source: 'article-content-management',
        reason: 'Artikel-Inhalt aktualisiert'
      }
    );
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving article content:', error);
    throw new Error('Failed to save article content');
  }
}

// Copy an article with audit
export async function copyArticle(originalArticleId: string): Promise<ArticleWithCalculations> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the original article with content and calculations
    const originalArticle = await getArticleWithCalculations(originalArticleId);
    if (!originalArticle) {
      throw new Error('Original article not found');
    }
    
    // Use transaction to copy article and related data atomically
    const result = await db.transaction(async (tx) => {
      // Create new article with "(Kopie)" appended to the number and audit
      const newArticle = await auditedArticleOperations.create(
        {
          number: `${originalArticle.number} (Kopie)`,
          price: originalArticle.price,
          hideTitle: originalArticle.hideTitle,
        },
        user.dbUser.id,
        {
          source: 'article-management',
          reason: `Artikel kopiert von ${originalArticle.number}`,
          originalArticleId: originalArticleId
        }
      );
    
      // Copy all calculations
      const copiedCalculations = [];
      if (originalArticle.calculations.length > 0) {
        const calculationsToInsert = originalArticle.calculations.map(calc => ({
          name: calc.name,
          type: calc.type,
          value: calc.value,
          articleId: newArticle.id,
          order: calc.order,
        }));
        
        const insertedCalculations = await tx.insert(articleCalculationItem).values(calculationsToInsert).returning();
        copiedCalculations.push(...insertedCalculations);
      }
      
      // Copy all article content (block_content where articleId is set) with audit
      const copiedContent = [];
      if (originalArticle.content && originalArticle.content.length > 0) {
        for (const content of originalArticle.content) {
          const newContent = await auditedBlockContentOperations.create(
            {
              blockId: content.blockId,
              articleId: newArticle.id,
              title: content.title,
              content: content.content,
              languageId: content.languageId,
            },
            user.dbUser.id,
            {
              source: 'article-copy-operation',
              reason: `Inhalt kopiert von Artikel ${originalArticle.number}`,
              originalContentId: content.id,
              parentEntityType: 'articles',
              parentEntityId: newArticle.id,
            }
          );
          copiedContent.push(newContent);
        }
      }
      
      return {
        ...newArticle,
        calculations: copiedCalculations,
        content: copiedContent
      };
    });

    return result;
  } catch (error) {
    console.error('Error copying article:', error);
    throw new Error('Failed to copy article');
  }
}

// Fetch minimal article list data
export async function getArticleList(): Promise<{
  id: string;
  number: string;
  title: string;
  price: string | null;
  hideTitle: boolean;
  updatedAt: string;
  calculationCount: number;
  languages: string;
}[]> {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.number);
    
    // Find the default language
    const [defaultLanguage] = await db
      .select()
      .from(languages)
      .where(eq(languages.default, true))
      .limit(1);
    
    // Fetch all languages for label mapping
    const allLanguages = await db.select().from(languages);
    
    // Fetch all article content with language info
    const allArticleContent = await db
      .select({
        articleId: blockContent.articleId,
        title: blockContent.title,
        languageId: blockContent.languageId,
      })
      .from(blockContent)
      .where(isNull(blockContent.blockId)); // Only article content, not block content
    
    // Get calculation counts and titles for each article
    const articlesWithCounts = await Promise.all(
      allArticles.map(async (article) => {
        const [countResult] = await db
          .select({ count: count(articleCalculationItem.id) })
          .from(articleCalculationItem)
          .where(eq(articleCalculationItem.articleId, article.id));
        
        // Get title from blockContent for default language
        let title = '';
        if (defaultLanguage) {
          const [contentResult] = await db
            .select({ title: blockContent.title })
            .from(blockContent)
            .where(
              and(
                eq(blockContent.articleId, article.id),
                eq(blockContent.languageId, defaultLanguage.id)
              )
            )
            .limit(1);
          
          if (contentResult?.title) {
            title = contentResult.title;
          }
        }
        
        // Get languages for this article
        const articleContents = allArticleContent.filter(content => content.articleId === article.id);
        const articleLanguages = articleContents.map(ac => {
          const lang = allLanguages.find(l => l.id === ac.languageId);
          return lang;
        }).filter(lang => lang !== undefined);
        
        // Sort languages: default first, then alphabetically by label
        const sortedLanguages = articleLanguages.sort((a, b) => {
          // If one is default and the other is not, default comes first
          if (a.default && !b.default) return -1;
          if (!a.default && b.default) return 1;
          // If both are default or both are not default, sort alphabetically
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
}

// Get change history for a specific article
export async function getArticleChangeHistory(articleId: string, limit = 50) {
  try {
    return await auditQueries.getEntityHistory(ENTITY_TYPES.ARTICLES, articleId, limit);
  } catch (error) {
    console.error('Error fetching article change history:', error);
    throw new Error('Failed to fetch article change history');
  }
}

// Get change history for article content (blockContent where articleId is set)
export async function getArticleContentChangeHistory(articleId: string, limit = 50) {
  try {
    // Get all content IDs for this article first
    const articleContent = await db
      .select({ id: blockContent.id })
      .from(blockContent)
      .where(eq(blockContent.articleId, articleId));

    // Get change history for all content pieces
    const allHistory = [];
    for (const content of articleContent) {
      const contentHistory = await auditQueries.getEntityHistory(ENTITY_TYPES.BLOCK_CONTENT, content.id, limit);
      allHistory.push(...contentHistory);
    }

    // Sort by timestamp (most recent first)
    return allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching article content change history:', error);
    throw new Error('Failed to fetch article content change history');
  }
} 

// Get articles filtered by language for AddArticleDialog
export async function getArticlesByLanguage(languageId: string): Promise<{
  id: string;
  number: string;
  title: string;
  price: string | null;
  hideTitle: boolean;
  updatedAt: string;
  content: string | null;
}[]> {
  try {
    // Get all articles
    const allArticles = await db.select().from(articles).orderBy(articles.number);
    
    // Get articles with content for the specified language
    const articlesWithContent = await Promise.all(
      allArticles.map(async (article) => {
        // Get content for this article in the specified language
        const [contentResult] = await db
          .select({ content: blockContent.content })
          .from(blockContent)
          .where(
            and(
              eq(blockContent.articleId, article.id),
              eq(blockContent.languageId, languageId),
              isNull(blockContent.blockId) // Only article content, not block content
            )
          )
          .limit(1);
        
        // Get title for this article in the specified language
        const [titleResult] = await db
          .select({ title: blockContent.title })
          .from(blockContent)
          .where(
            and(
              eq(blockContent.articleId, article.id),
              eq(blockContent.languageId, languageId),
              isNull(blockContent.blockId) // Only article content, not block content
            )
          )
          .limit(1);
        
        return {
          id: article.id,
          number: article.number,
          title: titleResult?.title || '',
          price: article.price,
          hideTitle: article.hideTitle,
          updatedAt: article.updatedAt,
          content: contentResult?.content || null,
        };
      })
    );
    
    return articlesWithContent;
  } catch (error) {
    console.error('Error fetching articles by language:', error);
    throw new Error('Failed to fetch articles by language');
  }
} 