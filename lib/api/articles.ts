import type { ArticleWithCalculations } from '@/lib/db/articles';
import type { Article } from '@/lib/db/schema';

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

// Save article calculations
export async function saveArticleCalculationsAPI(
  articleId: string,
  calculations: any[]
): Promise<void> {
  const response = await fetch(`/api/articles/${articleId}/calculations`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ calculations }),
  });

  if (!response.ok) {
    throw new Error('Failed to save article calculations');
  }
}

// Copy an article
export async function copyArticleAPI(originalArticle: { id: string }): Promise<ArticleWithCalculations> {
  const response = await fetch('/api/articles/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalArticleId: originalArticle.id }),
  });
  if (!response.ok) {
    throw new Error('Failed to copy article');
  }
  return response.json();
}

// Fetch minimal article list data
export async function fetchArticleList(): Promise<{
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
  const response = await fetch('/api/articles/list');
  if (!response.ok) {
    throw new Error('Failed to fetch article list');
  }
  return response.json();
} 