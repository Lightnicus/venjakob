import type { Quote } from '@/lib/db/schema';
import type { QuotePositionWithDetails } from '@/lib/db/quotes';

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

// Fetch a single quote (basic data only)
export async function fetchQuote(quoteId: string): Promise<Quote | null> {
  const response = await fetch(`/api/quotes/${quoteId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quote');
  }
  return response.json();
}

// Fetch a single quote with all details (includes sales opportunity, client, contact person)
export async function fetchQuoteWithDetails(quoteId: string): Promise<any | null> {
  const response = await fetch(`/api/quotes/${quoteId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quote with details');
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

// Create a new quote with variant and version
export async function createQuoteWithVariantAndVersionAPI(quoteData: {
  title: string;
  salesOpportunityId: string;
  validUntil?: string;
  languageId: string;
}): Promise<{
  quote: Quote;
  variant: any;
  version: any;
}> {
  const response = await fetch('/api/quotes/with-variant-version', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteData),
  });
  if (!response.ok) {
    throw new Error('Failed to create quote with variant and version');
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

// Fetch quote positions for a specific version
export async function fetchQuotePositionsByVersion(versionId: string): Promise<QuotePositionWithDetails[]> {
  const response = await fetch(`/api/quotes/versions/${versionId}/positions`);
  if (!response.ok) {
    throw new Error('Failed to fetch quote positions');
  }
  return response.json();
}

// Fetch latest variant for a quote
export async function fetchLatestVariantForQuote(quoteId: string): Promise<any | null> {
  const response = await fetch(`/api/quotes/${quoteId}/latest-variant`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest variant');
  }
  return response.json();
}

// Fetch latest version for a variant
export async function fetchLatestVersionForVariant(variantId: string): Promise<any | null> {
  const response = await fetch(`/api/quotes/variants/${variantId}/latest-version`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest version');
  }
  return response.json();
}

// Fetch variant by ID
export async function fetchVariantById(variantId: string): Promise<any | null> {
  const response = await fetch(`/api/quotes/variants/${variantId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch variant');
  }
  return response.json();
}

// Fetch version by ID
export async function fetchVersionById(versionId: string): Promise<any | null> {
  const response = await fetch(`/api/quotes/versions/${versionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch version');
  }
  return response.json();
}

// Fetch complete quote data (consolidated endpoint)
export async function fetchCompleteQuoteData(
  quoteId: string,
  variantId?: string,
  versionId?: string
): Promise<{
  quote: any;
  variant: any;
  version: any;
  positions: QuotePositionWithDetails[];
  offerPropsData: any;
  resolvedVariantId: string | null;
  resolvedVersionId: string | null;
}> {
  const searchParams = new URLSearchParams();
  if (variantId) searchParams.append('variantId', variantId);
  if (versionId) searchParams.append('versionId', versionId);
  
  const response = await fetch(`/api/quotes/${quoteId}/complete?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch complete quote data');
  }
  return response.json();
} 

// Save a single quote position
export async function saveQuotePosition(
  versionId: string,
  positionId: string,
  positionData: {
    title?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    totalPrice?: string;
    articleCost?: string;
  }
): Promise<void> {
  const response = await fetch(`/api/quotes/versions/${versionId}/positions/${positionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(positionData),
  });
  if (!response.ok) {
    throw new Error('Failed to save quote position');
  }
}

// Save multiple quote positions in batch
export async function saveQuotePositions(
  versionId: string,
  positions: Array<{
    id: string;
    title?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    totalPrice?: string;
    articleCost?: string;
  }>
): Promise<void> {
  const response = await fetch(`/api/quotes/versions/${versionId}/positions/batch`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ positions }),
  });
  if (!response.ok) {
    throw new Error('Failed to save quote positions');
  }
} 

// Create a new quote position
export async function createQuotePosition(
  versionId: string,
  blockId: string,
  selectedNodeId?: string | null
): Promise<any> {
  const response = await fetch(`/api/quotes/versions/${versionId}/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blockId,
      selectedNodeId,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to create quote position');
  }
  return response.json();
} 