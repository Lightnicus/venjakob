import type { Quote } from '@/lib/db/schema';

// Fetch minimal quotes list data
export async function fetchQuotesList(): Promise<{
  id: string;
  quoteNumber: string;
  title: string | null;
  salesOpportunityKeyword: string | null;
  variantsCount: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}[]> {
  const response = await fetch('/api/quotes/list');
  if (!response.ok) {
    throw new Error('Failed to fetch quotes list');
  }
  return response.json();
}

// Fetch a single quote
export async function fetchQuote(quoteId: string): Promise<Quote | null> {
  const response = await fetch(`/api/quotes/${quoteId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quote');
  }
  return response.json();
}

// Create a new quote
export async function createNewQuoteAPI(quoteData: {
  title: string;
  salesOpportunityId: string;
  validUntil?: string;
}): Promise<Quote> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  });
  if (!response.ok) {
    throw new Error('Failed to create quote');
  }
  return response.json();
}

// Save quote properties
export async function saveQuotePropertiesAPI(
  quoteId: string,
  quoteData: Partial<Quote>
): Promise<void> {
  const response = await fetch(`/api/quotes/${quoteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  });
  if (!response.ok) {
    throw new Error('Failed to save quote properties');
  }
}

// Delete a quote
export async function deleteQuoteAPI(quoteId: string): Promise<void> {
  const response = await fetch(`/api/quotes/${quoteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete quote');
  }
}

// Copy a quote
export async function copyQuoteAPI(originalQuote: { id: string }): Promise<Quote> {
  const response = await fetch('/api/quotes/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalQuoteId: originalQuote.id }),
  });
  if (!response.ok) {
    throw new Error('Failed to copy quote');
  }
  return response.json();
} 