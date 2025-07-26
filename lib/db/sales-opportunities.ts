import { eq, desc, sql, and, inArray, or, count } from 'drizzle-orm';
import { db } from './index';
import {
  salesOpportunities,
  contactPersons,
  clients,
  users,
  quotes,
  languages,
  changeHistory,
  type SalesOpportunity,
  type ContactPerson,
  type Client,
  type Quote,
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';
import { auditQueries, ENTITY_TYPES } from './audit';

// Common error type for edit lock conflicts
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly salesOpportunityId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null,
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}

export type SalesOpportunityWithDetails = SalesOpportunity & {
  client: Client;
  contactPerson: ContactPerson | null;
  salesRep: { id: string; name: string | null; email: string } | null;
  quotesCount: number;
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
  } | null;
};

// Check if a sales opportunity is editable by the current user
async function checkSalesOpportunityEditable(salesOpportunityId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', salesOpportunityId);
  }

  // Get sales opportunity with lock info
  const [opportunity] = await db
    .select({
      id: salesOpportunities.id,
      blocked: salesOpportunities.blocked,
      blockedBy: salesOpportunities.blockedBy,
    })
    .from(salesOpportunities)
    .where(eq(salesOpportunities.id, salesOpportunityId));

  if (!opportunity) {
    throw new Error('Verkaufschance nicht gefunden');
  }

  // Check if sales opportunity is locked by another user
  if (opportunity.blocked && opportunity.blockedBy && opportunity.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      'Verkaufschance wird bereits von einem anderen Benutzer bearbeitet',
      salesOpportunityId,
      opportunity.blockedBy,
      opportunity.blocked,
    );
  }
}

// Fetch all sales opportunities with basic details
export async function getSalesOpportunities(): Promise<SalesOpportunity[]> {
  try {
    return await db
      .select()
      .from(salesOpportunities)
      .where(eq(salesOpportunities.deleted, false))
      .orderBy(desc(salesOpportunities.createdAt));
  } catch (error) {
    console.error('Error fetching sales opportunities:', error);
    throw new Error('Failed to fetch sales opportunities');
  }
}

// Get a single sales opportunity with all details
export async function getSalesOpportunityWithDetails(
  salesOpportunityId: string,
): Promise<SalesOpportunityWithDetails | null> {
  try {
    const [opportunity] = await db
      .select({
        // Sales opportunity fields
        id: salesOpportunities.id,
        crmId: salesOpportunities.crmId,
        clientId: salesOpportunities.clientId,
        contactPersonId: salesOpportunities.contactPersonId,
        orderInventorySpecification: salesOpportunities.orderInventorySpecification,
        status: salesOpportunities.status,
        businessArea: salesOpportunities.businessArea,
        salesRepresentative: salesOpportunities.salesRepresentative,
        keyword: salesOpportunities.keyword,
        quoteVolume: salesOpportunities.quoteVolume,
        blocked: salesOpportunities.blocked,
        blockedBy: salesOpportunities.blockedBy,
        deleted: salesOpportunities.deleted,
        createdAt: salesOpportunities.createdAt,
        updatedAt: salesOpportunities.updatedAt,
        createdBy: salesOpportunities.createdBy,
        modifiedBy: salesOpportunities.modifiedBy,
        // Client fields
        clientName: clients.name,
        clientForeignId: clients.foreignId,
        clientAddress: clients.address,
        clientPhone: clients.phone,
        clientCasLink: clients.casLink,
        clientLanguageId: clients.languageId,
        clientCreatedAt: clients.createdAt,
        clientUpdatedAt: clients.updatedAt,
      })
      .from(salesOpportunities)
      .leftJoin(clients, eq(salesOpportunities.clientId, clients.id))
      .where(and(eq(salesOpportunities.id, salesOpportunityId), eq(salesOpportunities.deleted, false)));

    if (!opportunity) return null;

    // Get contact person if exists
    let contactPerson = null;
    if (opportunity.contactPersonId) {
      const [cp] = await db
        .select()
        .from(contactPersons)
        .where(eq(contactPersons.id, opportunity.contactPersonId));
      contactPerson = cp || null;
    }

    // Get sales representative if exists
    let salesRep = null;
    if (opportunity.salesRepresentative) {
      const [sr] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, opportunity.salesRepresentative));
      salesRep = sr || null;
    }

    // Get quotes count
    const [quotesCountResult] = await db
      .select({ count: count(quotes.id) })
      .from(quotes)
      .where(and(eq(quotes.salesOpportunityId, salesOpportunityId), eq(quotes.deleted, false)));

    // Find the most recent change
    let lastChangedBy = null;
    const recentChanges = await db
      .select({
        timestamp: changeHistory.timestamp,
        userId: changeHistory.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(changeHistory)
      .leftJoin(users, eq(changeHistory.userId, users.id))
      .where(
        and(
          eq(changeHistory.entityType, 'sales_opportunities'),
          eq(changeHistory.entityId, salesOpportunityId)
        )
      )
      .orderBy(desc(changeHistory.timestamp))
      .limit(1);

    if (recentChanges.length > 0) {
      const recentChange = recentChanges[0];
      lastChangedBy = {
        id: recentChange.userId,
        name: recentChange.userName,
        email: recentChange.userEmail || '',
        timestamp: recentChange.timestamp,
      };
    }

    return {
      id: opportunity.id,
      crmId: opportunity.crmId,
      clientId: opportunity.clientId,
      contactPersonId: opportunity.contactPersonId,
      orderInventorySpecification: opportunity.orderInventorySpecification,
      status: opportunity.status,
      businessArea: opportunity.businessArea,
      salesRepresentative: opportunity.salesRepresentative,
      keyword: opportunity.keyword,
      quoteVolume: opportunity.quoteVolume,
      blocked: opportunity.blocked,
      blockedBy: opportunity.blockedBy,
      deleted: opportunity.deleted,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt,
      createdBy: opportunity.createdBy,
      modifiedBy: opportunity.modifiedBy,
      client: {
        id: opportunity.clientId,
        foreignId: opportunity.clientForeignId || '',
        name: opportunity.clientName || '',
        address: opportunity.clientAddress || null,
        phone: opportunity.clientPhone || null,
        casLink: opportunity.clientCasLink || null,
        languageId: opportunity.clientLanguageId || '',
        deleted: false,
        createdAt: opportunity.clientCreatedAt || '',
        updatedAt: opportunity.clientUpdatedAt || '',
      },
      contactPerson,
      salesRep,
      quotesCount: Number(quotesCountResult?.count || 0),
      lastChangedBy,
    };
  } catch (error) {
    console.error('Error fetching sales opportunity:', error);
    throw new Error('Failed to fetch sales opportunity');
  }
}

// Create a new sales opportunity with audit
export async function createSalesOpportunity(
  salesOpportunityData: Omit<SalesOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'modifiedBy'>
): Promise<SalesOpportunity> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const [newSalesOpportunity] = await db
      .insert(salesOpportunities)
      .values({
        ...salesOpportunityData,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      })
      .returning();

    // TODO: Add audit trail when audit operations are implemented for sales opportunities

    return newSalesOpportunity;
  } catch (error) {
    console.error('Error creating sales opportunity:', error);
    throw new Error('Failed to create sales opportunity');
  }
}

// Update sales opportunity properties
export async function saveSalesOpportunity(
  salesOpportunityId: string,
  salesOpportunityData: Partial<Omit<SalesOpportunity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<void> {
  try {
    // Check if sales opportunity is editable by current user
    await checkSalesOpportunityEditable(salesOpportunityId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(salesOpportunities)
      .set({
        ...salesOpportunityData,
        modifiedBy: user.dbUser.id,
        updatedAt: sql`NOW()`,
      })
      .where(eq(salesOpportunities.id, salesOpportunityId));

    // TODO: Add audit trail when audit operations are implemented for sales opportunities
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving sales opportunity:', error);
    throw new Error('Failed to save sales opportunity');
  }
}

// Delete a sales opportunity
export async function deleteSalesOpportunity(salesOpportunityId: string): Promise<void> {
  try {
    // Check if sales opportunity is editable by current user
    await checkSalesOpportunityEditable(salesOpportunityId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check if there are related quotes
    const [quotesCount] = await db
      .select({ count: count(quotes.id) })
      .from(quotes)
      .where(and(eq(quotes.salesOpportunityId, salesOpportunityId), eq(quotes.deleted, false)));

    if (Number(quotesCount?.count || 0) > 0) {
      throw new Error('Verkaufschance kann nicht gelöscht werden, da Angebote existieren');
    }

    await db
      .delete(salesOpportunities)
      .where(eq(salesOpportunities.id, salesOpportunityId));

    // TODO: Add audit trail when audit operations are implemented for sales opportunities
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error deleting sales opportunity:', error);
    throw new Error('Failed to delete sales opportunity');
  }
}

// Fetch minimal sales opportunity list data
export async function getSalesOpportunitiesList(): Promise<{
  id: string;
  crmId: string | null;
  clientName: string;
  contactPersonName: string | null;
  salesRepresentativeName: string | null;
  status: string;
  businessArea: string | null;
  keyword: string | null;
  quoteVolume: string | null;
  quotesCount: number;
  createdAt: string;
  updatedAt: string;
}[]> {
  try {
    const opportunities = await db
      .select({
        id: salesOpportunities.id,
        crmId: salesOpportunities.crmId,
        clientId: salesOpportunities.clientId,
        contactPersonId: salesOpportunities.contactPersonId,
        salesRepresentative: salesOpportunities.salesRepresentative,
        status: salesOpportunities.status,
        businessArea: salesOpportunities.businessArea,
        keyword: salesOpportunities.keyword,
        quoteVolume: salesOpportunities.quoteVolume,
        createdAt: salesOpportunities.createdAt,
        updatedAt: salesOpportunities.updatedAt,
        clientName: clients.name,
      })
      .from(salesOpportunities)
      .leftJoin(clients, eq(salesOpportunities.clientId, clients.id))
      .where(eq(salesOpportunities.deleted, false))
      .orderBy(desc(salesOpportunities.createdAt));

    // Get contact person names, sales representative names, and quotes counts for each opportunity
    const opportunitiesWithDetails = await Promise.all(
      opportunities.map(async (opportunity) => {
        // Get contact person name if exists
        let contactPersonName = null;
        if (opportunity.contactPersonId) {
          const [cp] = await db
            .select({ name: contactPersons.name })
            .from(contactPersons)
            .where(eq(contactPersons.id, opportunity.contactPersonId));
          contactPersonName = cp?.name || null;
        }

        // Get sales representative name if exists
        let salesRepresentativeName = null;
        if (opportunity.salesRepresentative) {
          const [sr] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, opportunity.salesRepresentative));
          salesRepresentativeName = sr?.name || null;
        }

        // Get quotes count
        const [quotesCountResult] = await db
          .select({ count: count(quotes.id) })
          .from(quotes)
          .where(and(eq(quotes.salesOpportunityId, opportunity.id), eq(quotes.deleted, false)));

                 return {
           id: opportunity.id,
           crmId: opportunity.crmId,
           clientName: opportunity.clientName || 'Unbekannter Kunde',
           contactPersonName,
           salesRepresentativeName,
           status: opportunity.status,
           businessArea: opportunity.businessArea,
           keyword: opportunity.keyword,
           quoteVolume: opportunity.quoteVolume,
           quotesCount: Number(quotesCountResult?.count || 0),
           createdAt: opportunity.createdAt,
           updatedAt: opportunity.updatedAt,
         };
      })
    );

    return opportunitiesWithDetails;
  } catch (error) {
    console.error('Error fetching sales opportunities list:', error);
    throw new Error('Failed to fetch sales opportunities list');
  }
}

// Get change history for a specific sales opportunity
export async function getSalesOpportunityChangeHistory(salesOpportunityId: string, limit = 50) {
  try {
    return await auditQueries.getEntityHistory('sales_opportunities' as any, salesOpportunityId, limit);
  } catch (error) {
    console.error('Error fetching sales opportunity change history:', error);
    throw new Error('Failed to fetch sales opportunity change history');
  }
}

// Copy a sales opportunity
export async function copySalesOpportunity(
  originalSalesOpportunityId: string,
): Promise<SalesOpportunity> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the original sales opportunity
    const originalOpportunity = await getSalesOpportunityWithDetails(originalSalesOpportunityId);
    if (!originalOpportunity) {
      throw new Error('Original sales opportunity not found');
    }

    // Create new sales opportunity with "(Kopie)" appended to keyword
    const newOpportunity = await createSalesOpportunity({
      crmId: null, // Don't copy CRM ID
      clientId: originalOpportunity.clientId,
      contactPersonId: originalOpportunity.contactPersonId,
      orderInventorySpecification: originalOpportunity.orderInventorySpecification,
      status: 'open', // Reset status to open
      businessArea: originalOpportunity.businessArea,
      salesRepresentative: originalOpportunity.salesRepresentative,
      keyword: originalOpportunity.keyword ? `${originalOpportunity.keyword} (Kopie)` : 'Kopie',
      quoteVolume: originalOpportunity.quoteVolume,
      blocked: null,
      blockedBy: null,
      deleted: false,
    });

    return newOpportunity;
  } catch (error) {
    console.error('Error copying sales opportunity:', error);
    throw new Error('Failed to copy sales opportunity');
  }
}

// Soft delete a sales opportunity
export async function softDeleteSalesOpportunity(salesOpportunityId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(salesOpportunities)
      .set({ deleted: true, updatedAt: sql`NOW()` })
      .where(eq(salesOpportunities.id, salesOpportunityId));

    // TODO: Add audit trail when audit operations are implemented for sales opportunities
  } catch (error) {
    console.error('Error soft deleting sales opportunity:', error);
    throw new Error('Failed to soft delete sales opportunity');
  }
}

// Restore a soft deleted sales opportunity
export async function restoreSalesOpportunity(salesOpportunityId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(salesOpportunities)
      .set({ deleted: false, updatedAt: sql`NOW()` })
      .where(eq(salesOpportunities.id, salesOpportunityId));

    // TODO: Add audit trail when audit operations are implemented for sales opportunities
  } catch (error) {
    console.error('Error restoring sales opportunity:', error);
    throw new Error('Failed to restore sales opportunity');
  }
} 