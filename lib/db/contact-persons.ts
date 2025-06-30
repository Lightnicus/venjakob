import { eq, desc, sql, and, count } from 'drizzle-orm';
import { db } from './index';
import {
  contactPersons,
  clients,
  salesOpportunities,
  users,
  changeHistory,
  type ContactPerson,
  type Client,
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';
import { auditQueries } from './audit';

export type ContactPersonWithDetails = ContactPerson & {
  client: Client;
  salesOpportunitiesCount: number;
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
  } | null;
};

// Fetch all contact persons
export async function getContactPersons(): Promise<ContactPerson[]> {
  try {
    return await db
      .select()
      .from(contactPersons)
      .orderBy(contactPersons.name);
  } catch (error) {
    console.error('Error fetching contact persons:', error);
    throw new Error('Failed to fetch contact persons');
  }
}

// Get contact persons for a specific client
export async function getContactPersonsByClient(clientId: string): Promise<ContactPerson[]> {
  try {
    return await db
      .select()
      .from(contactPersons)
      .where(eq(contactPersons.clientId, clientId))
      .orderBy(contactPersons.name);
  } catch (error) {
    console.error('Error fetching contact persons by client:', error);
    throw new Error('Failed to fetch contact persons by client');
  }
}

// Get a single contact person with details
export async function getContactPersonWithDetails(
  contactPersonId: string,
): Promise<ContactPersonWithDetails | null> {
  try {
    const [contactPerson] = await db
      .select({
        // Contact person fields
        id: contactPersons.id,
        clientId: contactPersons.clientId,
        name: contactPersons.name,
        firstName: contactPersons.firstName,
        email: contactPersons.email,
        phone: contactPersons.phone,
        position: contactPersons.position,
        createdAt: contactPersons.createdAt,
        updatedAt: contactPersons.updatedAt,
        // Client fields
        clientName: clients.name,
        clientForeignId: clients.foreignId,
        clientLanguageId: clients.languageId,
        clientCreatedAt: clients.createdAt,
        clientUpdatedAt: clients.updatedAt,
      })
      .from(contactPersons)
      .leftJoin(clients, eq(contactPersons.clientId, clients.id))
      .where(eq(contactPersons.id, contactPersonId));

    if (!contactPerson) return null;

    // Get sales opportunities count
    const [salesOpportunitiesCountResult] = await db
      .select({ count: count(salesOpportunities.id) })
      .from(salesOpportunities)
      .where(eq(salesOpportunities.contactPersonId, contactPersonId));

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
          eq(changeHistory.entityType, 'contact_persons'),
          eq(changeHistory.entityId, contactPersonId)
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
      id: contactPerson.id,
      clientId: contactPerson.clientId,
      name: contactPerson.name,
      firstName: contactPerson.firstName,
      email: contactPerson.email,
      phone: contactPerson.phone,
      position: contactPerson.position,
      createdAt: contactPerson.createdAt,
      updatedAt: contactPerson.updatedAt,
      client: {
        id: contactPerson.clientId,
        foreignId: contactPerson.clientForeignId || '',
        name: contactPerson.clientName || '',
        languageId: contactPerson.clientLanguageId || '',
        createdAt: contactPerson.clientCreatedAt || '',
        updatedAt: contactPerson.clientUpdatedAt || '',
      },
      salesOpportunitiesCount: Number(salesOpportunitiesCountResult?.count || 0),
      lastChangedBy,
    };
  } catch (error) {
    console.error('Error fetching contact person:', error);
    throw new Error('Failed to fetch contact person');
  }
}

// Create a new contact person
export async function createContactPerson(
  contactPersonData: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ContactPerson> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const [newContactPerson] = await db
      .insert(contactPersons)
      .values(contactPersonData)
      .returning();

    // TODO: Add audit trail when audit operations are implemented for contact persons

    return newContactPerson;
  } catch (error) {
    console.error('Error creating contact person:', error);
    throw new Error('Failed to create contact person');
  }
}

// Update contact person properties
export async function saveContactPerson(
  contactPersonId: string,
  contactPersonData: Partial<Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(contactPersons)
      .set({
        ...contactPersonData,
        updatedAt: sql`NOW()`,
      })
      .where(eq(contactPersons.id, contactPersonId));

    // TODO: Add audit trail when audit operations are implemented for contact persons
  } catch (error) {
    console.error('Error saving contact person:', error);
    throw new Error('Failed to save contact person');
  }
}

// Delete a contact person
export async function deleteContactPerson(contactPersonId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check if there are related sales opportunities
    const [salesOpportunitiesCount] = await db
      .select({ count: count(salesOpportunities.id) })
      .from(salesOpportunities)
      .where(eq(salesOpportunities.contactPersonId, contactPersonId));

    if (Number(salesOpportunitiesCount?.count || 0) > 0) {
      throw new Error('Ansprechpartner kann nicht gelöscht werden, da Verkaufschancen existieren');
    }

    await db
      .delete(contactPersons)
      .where(eq(contactPersons.id, contactPersonId));

    // TODO: Add audit trail when audit operations are implemented for contact persons
  } catch (error) {
    console.error('Error deleting contact person:', error);
    throw new Error('Failed to delete contact person');
  }
}

// Fetch minimal contact person list data
export async function getContactPersonsList(): Promise<{
  id: string;
  name: string;
  firstName: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  clientName: string;
  salesOpportunitiesCount: number;
  createdAt: string;
  updatedAt: string;
}[]> {
  try {
    const contactPersonsData = await db
      .select({
        id: contactPersons.id,
        name: contactPersons.name,
        firstName: contactPersons.firstName,
        email: contactPersons.email,
        phone: contactPersons.phone,
        position: contactPersons.position,
        createdAt: contactPersons.createdAt,
        updatedAt: contactPersons.updatedAt,
        clientId: contactPersons.clientId,
        clientName: clients.name,
      })
      .from(contactPersons)
      .leftJoin(clients, eq(contactPersons.clientId, clients.id))
      .orderBy(contactPersons.name);

    // Get sales opportunities counts for each contact person
    const contactPersonsWithDetails = await Promise.all(
      contactPersonsData.map(async (contactPerson) => {
        // Get sales opportunities count
        const [salesOpportunitiesCountResult] = await db
          .select({ count: count(salesOpportunities.id) })
          .from(salesOpportunities)
          .where(eq(salesOpportunities.contactPersonId, contactPerson.id));

        return {
          id: contactPerson.id,
          name: contactPerson.name,
          firstName: contactPerson.firstName,
          email: contactPerson.email,
          phone: contactPerson.phone,
          position: contactPerson.position,
          clientName: contactPerson.clientName || 'Unbekannter Kunde',
          salesOpportunitiesCount: Number(salesOpportunitiesCountResult?.count || 0),
          createdAt: contactPerson.createdAt,
          updatedAt: contactPerson.updatedAt,
        };
      })
    );

    return contactPersonsWithDetails;
  } catch (error) {
    console.error('Error fetching contact persons list:', error);
    throw new Error('Failed to fetch contact persons list');
  }
}

// Get change history for a specific contact person
export async function getContactPersonChangeHistory(contactPersonId: string, limit = 50) {
  try {
    return await auditQueries.getEntityHistory('contact_persons' as any, contactPersonId, limit);
  } catch (error) {
    console.error('Error fetching contact person change history:', error);
    throw new Error('Failed to fetch contact person change history');
  }
} 