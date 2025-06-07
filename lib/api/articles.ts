import type { ArticleWithCalculations } from '@/lib/db/articles';
import type { Article, ArticleCalculationItem } from '@/lib/db/schema';

// Fetch all articles with calculations
export async function fetchArticlesWithCalculations(): Promise<(ArticleWithCalculations & { calculationCount: number })[]> {
  const response = await fetch('/api/articles');
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  const articles = await response.json();
  // The API returns articles with calculationCount from getArticlesWithCalculationCounts
  return articles;
}

// Fetch a single article with calculations
export async function fetchArticleWithCalculations(articleId: string): Promise<ArticleWithCalculations | null> {
  const response = await fetch(`/api/articles/${articleId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

// Create a new article
export async function createNewArticleAPI(articleData: {
  name: string;
  number: string;
  description?: string;
  price?: string;
  hideTitle?: boolean;
}): Promise<ArticleWithCalculations> {
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articleData),
  });
  if (!response.ok) {
    throw new Error('Failed to create article');
  }
  return response.json();
}

// Save article properties
export async function saveArticlePropertiesAPI(
  articleId: string,
  articleData: Partial<Article>
): Promise<void> {
  const response = await fetch(`/api/articles/${articleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articleData),
  });
  if (!response.ok) {
    throw new Error('Failed to save article properties');
  }
}

// Delete an article
export async function deleteArticleAPI(articleId: string): Promise<void> {
  const response = await fetch(`/api/articles/${articleId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete article');
  }
}

// Fetch all calculation items
export async function fetchCalculationItems(): Promise<ArticleCalculationItem[]> {
  const response = await fetch('/api/calculation-items');
  if (!response.ok) {
    throw new Error('Failed to fetch calculation items');
  }
  return response.json();
}

// Save article content
export async function saveArticleContentAPI(
  articleId: string,
  contentData: any[]
): Promise<void> {
  const response = await fetch(`/api/articles/${articleId}/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: contentData }),
  });
  if (!response.ok) {
    throw new Error('Failed to save article content');
  }
} 