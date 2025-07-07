import type { SalesOpportunity } from '@/lib/db/schema';

export type SalesOpportunityListItem = {
  id: string;
  crmId: string | null;
  clientName: string;
  contactPersonName: string | null;
  status: string;
  businessArea: string | null;
  keyword: string | null;
  quoteVolume: string | null;
  quotesCount: number;
  createdAt: string;
  updatedAt: string;
};

// Fetch minimal sales opportunities list data
export async function fetchSalesOpportunitiesList(): Promise<SalesOpportunityListItem[]> {
  const response = await fetch('/api/sales-opportunities/list');
  if (!response.ok) {
    throw new Error('Failed to fetch sales opportunities');
  }
  return response.json();
}

// Fetch a single sales opportunity with details
export async function fetchSalesOpportunity(id: string) {
  const response = await fetch(`/api/sales-opportunities/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales opportunity');
  }
  return response.json();
}

// Create a new sales opportunity
export async function createNewSalesOpportunityAPI(salesOpportunityData: {
  crmId?: string;
  clientId: string;
  contactPersonId?: string;
  orderInventorySpecification?: string;
  status?: string;
  businessArea?: string;
  salesRepresentative?: string;
  keyword: string;
  quoteVolume?: string;
}): Promise<SalesOpportunity> {
  const response = await fetch('/api/sales-opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(salesOpportunityData),
  });
  if (!response.ok) {
    throw new Error('Failed to create sales opportunity');
  }
  return response.json();
}

// Save sales opportunity properties
export async function saveSalesOpportunityPropertiesAPI(
  id: string,
  salesOpportunityData: Partial<SalesOpportunity>
): Promise<void> {
  const response = await fetch(`/api/sales-opportunities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(salesOpportunityData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.type === 'EDIT_LOCK_ERROR') {
      const error = new Error(errorData.error) as any;
      error.type = 'EDIT_LOCK_ERROR';
      error.salesOpportunityId = errorData.salesOpportunityId;
      error.lockedBy = errorData.lockedBy;
      error.lockedAt = errorData.lockedAt;
      throw error;
    }
    throw new Error(errorData.error || 'Failed to save sales opportunity');
  }
}

// Delete a sales opportunity
export async function deleteSalesOpportunityAPI(id: string): Promise<void> {
  const response = await fetch(`/api/sales-opportunities/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.type === 'EDIT_LOCK_ERROR') {
      const error = new Error(errorData.error) as any;
      error.type = 'EDIT_LOCK_ERROR';
      error.salesOpportunityId = errorData.salesOpportunityId;
      error.lockedBy = errorData.lockedBy;
      error.lockedAt = errorData.lockedAt;
      throw error;
    }
    throw new Error(errorData.error || 'Failed to delete sales opportunity');
  }
}

// Copy a sales opportunity
export async function copySalesOpportunityAPI(originalSalesOpportunityId: string): Promise<SalesOpportunity> {
  const response = await fetch('/api/sales-opportunities/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalSalesOpportunityId }),
  });
  if (!response.ok) {
    throw new Error('Failed to copy sales opportunity');
  }
  return response.json();
} 