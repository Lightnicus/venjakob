import { eq, desc, asc, and, count } from 'drizzle-orm';
import { db } from './index';
import { 
  articles, 
  articleCalculations, 
  articleCalculationItem, 
  type Article, 
  type ArticleCalculation, 
  type ArticleCalculationItem,
  type InsertArticleCalculationItem
} from './schema';
import articleCalculationConfig from '@/data/article-calculation-config.json';

export type ArticleCalculationWithItem = ArticleCalculation & {
  calculationItem: ArticleCalculationItem;
};

export type ArticleWithCalculations = Article & {
  calculations: ArticleCalculationWithItem[];
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

// Get a single article with all its calculation items in correct order
export async function getArticleWithCalculations(articleId: string): Promise<ArticleWithCalculations | null> {
  try {
    // Fetch the article
    const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
    if (!article) return null;
    
    // Fetch calculations with calculation items, ordered by the order column
    const calculationsWithItems = await db
      .select({
        // ArticleCalculation fields
        id: articleCalculations.id,
        articleId: articleCalculations.articleId,
        articleCalculationItemId: articleCalculations.articleCalculationItemId,
        order: articleCalculations.order,
        createdAt: articleCalculations.createdAt,
        updatedAt: articleCalculations.updatedAt,
        // ArticleCalculationItem fields
        calculationItem: {
          id: articleCalculationItem.id,
          name: articleCalculationItem.name,
          type: articleCalculationItem.type,
          value: articleCalculationItem.value,
          createdAt: articleCalculationItem.createdAt,
          updatedAt: articleCalculationItem.updatedAt,
        }
      })
      .from(articleCalculations)
      .innerJoin(articleCalculationItem, eq(articleCalculations.articleCalculationItemId, articleCalculationItem.id))
      .where(eq(articleCalculations.articleId, articleId))
      .orderBy(asc(articleCalculations.order));
    
    return {
      ...article,
      calculations: calculationsWithItems
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
          .select({ count: count(articleCalculations.id) })
          .from(articleCalculations)
          .where(eq(articleCalculations.articleId, article.id));
        
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
  calculations: Omit<ArticleCalculation, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  try {
    // Delete existing calculations for this article
    await db.delete(articleCalculations).where(eq(articleCalculations.articleId, articleId));
    
    // Insert new calculations
    if (calculations.length > 0) {
      await db.insert(articleCalculations).values(calculations);
    }
  } catch (error) {
    console.error('Error saving article calculations:', error);
    throw new Error('Failed to save article calculations');
  }
}

// Add a single calculation item to an article
export async function addCalculationToArticle(
  articleId: string,
  calculationItemId: string,
  order: number
): Promise<void> {
  try {
    await db.insert(articleCalculations).values({
      articleId,
      articleCalculationItemId: calculationItemId,
      order
    });
  } catch (error) {
    console.error('Error adding calculation to article:', error);
    throw new Error('Failed to add calculation to article');
  }
}

// Remove a calculation from an article
export async function removeCalculationFromArticle(
  articleId: string,
  calculationItemId: string
): Promise<void> {
  try {
    await db.delete(articleCalculations)
      .where(
        and(
          eq(articleCalculations.articleId, articleId),
          eq(articleCalculations.articleCalculationItemId, calculationItemId)
        )
      );
  } catch (error) {
    console.error('Error removing calculation from article:', error);
    throw new Error('Failed to remove calculation from article');
  }
}

// Delete an article and all its calculations
export async function deleteArticle(articleId: string): Promise<void> {
  try {
    // Delete article calculations first (foreign key constraint)
    await db.delete(articleCalculations).where(eq(articleCalculations.articleId, articleId));
    
    // Delete the article
    await db.delete(articles).where(eq(articles.id, articleId));
  } catch (error) {
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  }
}

// Fetch all calculation items (for dropdown/selection purposes)
export async function getCalculationItems(): Promise<ArticleCalculationItem[]> {
  try {
    return await db.select().from(articleCalculationItem).orderBy(articleCalculationItem.name);
  } catch (error) {
    console.error('Error fetching calculation items:', error);
    throw new Error('Failed to fetch calculation items');
  }
}

// Create a calculation item
export async function createCalculationItem(itemData: Omit<InsertArticleCalculationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleCalculationItem> {
  try {
    const [newItem] = await db.insert(articleCalculationItem).values(itemData).returning();
    return newItem;
  } catch (error) {
    console.error('Error creating calculation item:', error);
    throw new Error('Failed to create calculation item');
  }
}

// Create a new article with default calculation items (improved version)
export async function createArticleWithDefaults(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleWithCalculations> {
  let newArticle: Article | null = null;
  
  try {
    // Create the article first
    [newArticle] = await db.insert(articles).values(articleData).returning();
    
    // Get existing calculation items to avoid duplicates
    const existingItems = await getCalculationItems();
    
    // Create default calculation items and link them to the article
    const calculationsWithItems: ArticleCalculationWithItem[] = [];
    
    for (const configItem of articleCalculationConfig) {
      // Check if calculation item already exists with same name and type
      let calculationItem = existingItems.find(
        item => item.name === configItem.name && item.type === configItem.type
      );
      
      // If not found, create new calculation item
      if (!calculationItem) {
        calculationItem = await createCalculationItem({
          name: configItem.name,
          type: configItem.type as 'time' | 'cost',
          value: configItem.value
        });
      }
      
      // Link it to the article
      const [articleCalculation] = await db.insert(articleCalculations).values({
        articleId: newArticle.id,
        articleCalculationItemId: calculationItem.id,
        order: configItem.order
      }).returning();
      
      calculationsWithItems.push({
        ...articleCalculation,
        calculationItem
      });
    }
    
    // Sort by order and return the complete article
    calculationsWithItems.sort((a, b) => a.order - b.order);
    
    return {
      ...newArticle,
      calculations: calculationsWithItems
    };
  } catch (error) {
    console.error('Error creating article with defaults:', error);
    
    // Clean up: if article was created but calculation items failed, delete the article
    try {
      if (newArticle?.id) {
        await deleteArticle(newArticle.id);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    throw new Error('Failed to create article with defaults');
  }
}

// Update/Save a calculation item
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

// Delete a calculation item (with cascade check)
export async function deleteCalculationItem(itemId: string): Promise<void> {
  try {
    // Check if item is used in any article calculations
    const usageCount = await db
      .select({ count: count(articleCalculations.id) })
      .from(articleCalculations)
      .where(eq(articleCalculations.articleCalculationItemId, itemId));
    
    if (Number(usageCount[0]?.count || 0) > 0) {
      throw new Error('Cannot delete calculation item: it is currently in use by one or more articles');
    }
    
    // Delete the calculation item
    await db.delete(articleCalculationItem).where(eq(articleCalculationItem.id, itemId));
  } catch (error) {
    console.error('Error deleting calculation item:', error);
    throw error; // Re-throw to preserve custom error messages
  }
}

// Create a new article with sensible defaults for required fields
export async function createNewArticle(
  articleData: {
    name: string;
    number: string;
    description?: string;
    price?: string;
    hideTitle?: boolean;
  }
): Promise<ArticleWithCalculations> {
  const defaultArticleData = {
    name: articleData.name,
    number: articleData.number,
    description: articleData.description || null,
    price: articleData.price || '0.00',
    hideTitle: articleData.hideTitle ?? false,
  };
  
  return await createArticleWithDefaults(defaultArticleData);
} 