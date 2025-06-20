import { eq, desc, asc, and, count, isNull } from 'drizzle-orm';
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
import articleCalculationConfig from '@/data/article-calculation-config.json';

export type ArticleWithCalculations = Article & {
  calculations: ArticleCalculationItem[];
  content?: BlockContent[];
};

// Fetch all articles
export async function getArticles(): Promise<Article[]> {
  try {
    return await db.select().from(articles).orderBy(articles.name);
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
    
    return {
      ...article,
      calculations: calculationItems,
      content: articleContent
    };
  } catch (error) {
    console.error('Error fetching article with calculations:', error);
    throw new Error('Failed to fetch article');
  }
}

// Fetch all articles with their calculation counts
export async function getArticlesWithCalculationCounts(): Promise<(Article & { calculationCount: number })[]> {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.name);
    
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

// Create a new article
export async function createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
  try {
    const [newArticle] = await db.insert(articles).values(articleData).returning();
    return newArticle;
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  }
}

// Update article properties
export async function saveArticle(
  articleId: string, 
  articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await db.update(articles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(articles.id, articleId));
  } catch (error) {
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
    // Delete existing calculation items for this article
    await db.delete(articleCalculationItem).where(eq(articleCalculationItem.articleId, articleId));
    
    // Insert new calculation items
    if (calculations.length > 0) {
      await db.insert(articleCalculationItem).values(calculations);
    }
  } catch (error) {
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

// Delete an article (related content and calculations will be deleted automatically via CASCADE)
export async function deleteArticle(articleId: string): Promise<void> {
  try {
    // Delete the article - CASCADE will automatically delete related records
    await db.delete(articles).where(eq(articles.id, articleId));
  } catch (error) {
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
      name: articleData.name,
      number: articleData.number,
      description: articleData.description || '',
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
      .set({ ...itemData, updatedAt: new Date() })
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

// Create a new article with calculation items from config
export async function createNewArticle(
  articleData: {
    name: string;
    number: string;
    description?: string;
    price?: string;
    hideTitle?: boolean;
  }
): Promise<ArticleWithCalculations> {
  try {
    const [newArticle] = await db.insert(articles).values({
      name: articleData.name,
      number: articleData.number,
      description: articleData.description || '',
      price: articleData.price || '0.00',
      hideTitle: articleData.hideTitle || false
    }).returning();

    // Create calculation items for this article based on the config
    const calculationItems: ArticleCalculationItem[] = [];
    
    for (const configItem of articleCalculationConfig) {
      const [calculationItem] = await db.insert(articleCalculationItem).values({
        name: configItem.name,
        type: configItem.type as 'time' | 'cost',
        value: configItem.value,
        articleId: newArticle.id,
        order: configItem.order
      }).returning();
      
      calculationItems.push(calculationItem);
    }

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

// Save article content
export async function saveArticleContent(
  articleId: string,
  contentData: Omit<BlockContent, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  try {
    // Delete existing content for this article
    await db.delete(blockContent).where(eq(blockContent.articleId, articleId));
    
    // Insert new content
    if (contentData.length > 0) {
      await db.insert(blockContent).values(contentData);
    }
  } catch (error) {
    console.error('Error saving article content:', error);
    throw new Error('Failed to save article content');
  }
}

// Copy an article
export async function copyArticle(originalArticleId: string): Promise<ArticleWithCalculations> {
  try {
    // Get the original article with content and calculations
    const originalArticle = await getArticleWithCalculations(originalArticleId);
    if (!originalArticle) {
      throw new Error('Original article not found');
    }
    
    // Create new article with "(Kopie)" appended to the name and number
    const [newArticle] = await db.insert(articles).values({
      name: `${originalArticle.name} (Kopie)`,
      number: `${originalArticle.number} (Kopie)`,
      description: originalArticle.description,
      price: originalArticle.price,
      hideTitle: originalArticle.hideTitle,
    }).returning();
    
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
      
      const insertedCalculations = await db.insert(articleCalculationItem).values(calculationsToInsert).returning();
      copiedCalculations.push(...insertedCalculations);
    }
    
    // Copy all article content (block_content where articleId is set)
    const copiedContent = [];
    if (originalArticle.content && originalArticle.content.length > 0) {
      const contentToInsert = originalArticle.content.map(content => ({
        blockId: content.blockId,
        articleId: newArticle.id,
        title: content.title,
        content: content.content,
        languageId: content.languageId,
      }));
      
      const insertedContent = await db.insert(blockContent).values(contentToInsert).returning();
      copiedContent.push(...insertedContent);
    }
    
    return {
      ...newArticle,
      calculations: copiedCalculations,
      content: copiedContent
    };
  } catch (error) {
    console.error('Error copying article:', error);
    throw new Error('Failed to copy article');
  }
}

// Fetch minimal article list data
export async function getArticleList(): Promise<{
  id: string;
  number: string;
  name: string;
  title: string;
  description: string | null;
  price: string | null;
  hideTitle: boolean;
  updatedAt: string;
  calculationCount: number;
  languages: string;
}[]> {
  try {
    const allArticles = await db.select().from(articles).orderBy(articles.name);
    
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
          return lang?.label || 'Unknown';
        });
        const languagesString = articleLanguages.length > 0 ? articleLanguages.join(', ') : 'Keine Sprachen';
        
        return {
          id: article.id,
          number: article.number,
          name: article.name,
          title: title,
          description: article.description,
          price: article.price,
          hideTitle: article.hideTitle,
          updatedAt: article.updatedAt.toISOString(),
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