import { eq, desc, sql, and, inArray, or, count, asc } from 'drizzle-orm';
import { db } from './index';
import {
  quotes,
  quoteVariants,
  quoteVersions,
  quotePositions,
  quotePositionCalculationItems,
  articleCalculationItem,
  salesOpportunities,
  articles,
  blocks,
  blockContent,
  languages,
  users,
  changeHistory,
  clients,
  type Quote,
  type QuoteVariant,
  type QuoteVersion,
  type QuotePosition,
  type SalesOpportunity,
  type Article,
  type Block,
  type Language,
} from './schema';
import { getCurrentUser } from '@/lib/auth/server';
import { auditQueries } from './audit';
import { copyArticle } from './articles';
import { copyBlock } from './blocks';
import { getSalesOpportunityWithDetails, type SalesOpportunityWithDetails } from './sales-opportunities';

// Import shared edit lock utilities
import { EditLockError } from './edit-lock-error';
import { checkResourceEditable, LOCK_CONFIGS } from './lock-validation';

// Re-export for backward compatibility
export { EditLockError };

export type QuoteWithDetails = Quote & {
  salesOpportunity: SalesOpportunityWithDetails;
  variants: QuoteVariantWithVersions[];
  variantsCount: number;
  lastChangedBy?: {
    id: string;
    name: string | null;
    email: string;
    timestamp: string;
  } | null;
};

export type QuoteVariantWithVersions = QuoteVariant & {
  language: Language;
  versions: QuoteVersionWithPositions[];
  versionsCount: number;
};

export type QuoteVersionWithPositions = QuoteVersion & {
  positions: QuotePositionWithDetails[];
  positionsCount: number;
};

export type QuotePositionWithDetails = QuotePosition & {
  article: Article | null;
  block: Block | null;
};

// Check if a quote is editable by the current user
async function checkQuoteEditable(quoteId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new EditLockError('Benutzer nicht authentifiziert', quoteId);
  }

  // Get quote with lock info
  const [quote] = await db
    .select({
      id: quotes.id,
      blocked: quotes.blocked,
      blockedBy: quotes.blockedBy,
    })
    .from(quotes)
    .where(eq(quotes.id, quoteId));

  if (!quote) {
    throw new Error('Angebot nicht gefunden');
  }

  // Check if quote is locked by another user
  if (quote.blocked && quote.blockedBy && quote.blockedBy !== user.dbUser.id) {
    throw new EditLockError(
      'Angebot wird bereits von einem anderen Benutzer bearbeitet',
      quoteId,
      quote.blockedBy,
      quote.blocked,
    );
  }
}

// Check if a quote version is editable by the current user
async function checkQuoteVersionEditable(versionId: string): Promise<void> {
  await checkResourceEditable({
    table: quoteVersions,
    columns: {
      id: quoteVersions.id,
      blocked: quoteVersions.blocked,
      blockedBy: quoteVersions.blockedBy,
    },
    entityId: versionId,
    ...LOCK_CONFIGS.quoteVersions,
  });
}

// Fetch all quotes
export async function getQuotes(): Promise<Quote[]> {
  try {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.deleted, false))
      .orderBy(desc(quotes.createdAt));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw new Error('Failed to fetch quotes');
  }
}

// Create a new quote with default values
export async function createNewQuote(quoteData: {
  title: string;
  salesOpportunityId: string;
  validUntil?: string;
}): Promise<Quote> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Generate a unique quote number using env variable as starting point
    const quoteCount = await db.select({ count: count(quotes.id) }).from(quotes).where(eq(quotes.deleted, false));
    const startNumber = Number(process.env.QUOTE_NUMBER_START || 1);
    const nextNumber = startNumber + (Number(quoteCount[0]?.count || 0));
    const quoteNumber = `ANG-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

    const newQuoteData = {
      ...quoteData,
      quoteNumber,
      deleted: false,
      createdBy: user.dbUser.id,
      modifiedBy: user.dbUser.id,
    };

    const [newQuote] = await db.insert(quotes).values(newQuoteData).returning();
    
    // TODO: Add audit log when audit operations are available for quotes
    
    return newQuote;
  } catch (error) {
    console.error('Error creating new quote:', error);
    throw new Error('Failed to create new quote');
  }
}

// Get quotes for a specific sales opportunity
export async function getQuotesBySalesOpportunity(salesOpportunityId: string): Promise<Quote[]> {
  try {
    return await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.salesOpportunityId, salesOpportunityId), eq(quotes.deleted, false)))
      .orderBy(desc(quotes.createdAt));
  } catch (error) {
    console.error('Error fetching quotes by sales opportunity:', error);
    throw new Error('Failed to fetch quotes by sales opportunity');
  }
}

// Get a single quote with all details
export async function getQuoteWithDetails(quoteId: string): Promise<QuoteWithDetails | null> {
  try {
    const [quote] = await db
      .select({
        // Quote fields
        id: quotes.id,
        salesOpportunityId: quotes.salesOpportunityId,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        validUntil: quotes.validUntil,
        blocked: quotes.blocked,
        blockedBy: quotes.blockedBy,
        deleted: quotes.deleted,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
        createdBy: quotes.createdBy,
        modifiedBy: quotes.modifiedBy,
        // Sales opportunity fields
        salesOpportunityStatus: salesOpportunities.status,
        salesOpportunityKeyword: salesOpportunities.keyword,
      })
      .from(quotes)
      .leftJoin(salesOpportunities, eq(quotes.salesOpportunityId, salesOpportunities.id))
      .where(and(eq(quotes.id, quoteId), eq(quotes.deleted, false)));

    if (!quote) return null;

    // Get full sales opportunity with details
    const salesOpportunity = await getSalesOpportunityWithDetails(quote.salesOpportunityId);

    // Get variants count
    const [variantsCountResult] = await db
      .select({ count: count(quoteVariants.id) })
      .from(quoteVariants)
      .where(eq(quoteVariants.quoteId, quoteId));

    // Get variants with versions
    const variants = await getQuoteVariantsByQuote(quoteId);

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
          eq(changeHistory.entityType, 'quotes'),
          eq(changeHistory.entityId, quoteId)
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
      ...quote,
      deleted: quote.deleted,
      salesOpportunity: salesOpportunity!,
      variants,
      variantsCount: Number(variantsCountResult?.count || 0),
      lastChangedBy,
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw new Error('Failed to fetch quote');
  }
}

// Get variants for a specific quote
export async function getQuoteVariantsByQuote(quoteId: string): Promise<QuoteVariantWithVersions[]> {
  try {
    const variants = await db
      .select({
        // Variant fields
        id: quoteVariants.id,
        quoteId: quoteVariants.quoteId,
        variantNumber: quoteVariants.variantNumber,
        languageId: quoteVariants.languageId,
        isDefault: quoteVariants.isDefault,
        blocked: quoteVariants.blocked,
        blockedBy: quoteVariants.blockedBy,
        deleted: quoteVariants.deleted,
        createdAt: quoteVariants.createdAt,
        updatedAt: quoteVariants.updatedAt,
        createdBy: quoteVariants.createdBy,
        modifiedBy: quoteVariants.modifiedBy,
        // Language fields
        languageValue: languages.value,
        languageLabel: languages.label,
        languageDefault: languages.default,
      })
      .from(quoteVariants)
      .leftJoin(languages, eq(quoteVariants.languageId, languages.id))
      .where(and(eq(quoteVariants.quoteId, quoteId), eq(quoteVariants.deleted, false)))
      .orderBy(
        desc(quoteVariants.isDefault),
        asc(quoteVariants.variantNumber)
      );

    // Get versions for each variant
    const variantsWithVersions = await Promise.all(
      variants.map(async (variant) => {
        const versions = await getQuoteVersionsByVariant(variant.id);
        
        const [versionsCountResult] = await db
          .select({ count: count(quoteVersions.id) })
          .from(quoteVersions)
          .where(eq(quoteVersions.variantId, variant.id));

        return {
          id: variant.id,
          quoteId: variant.quoteId,
          variantDescriptor: variant.variantNumber?.toString() || '',
          variantNumber: variant.variantNumber,
          languageId: variant.languageId,
          isDefault: variant.isDefault,
          blocked: variant.blocked,
          blockedBy: variant.blockedBy,
          deleted: variant.deleted,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
          createdBy: variant.createdBy,
          modifiedBy: variant.modifiedBy,
          language: {
            id: variant.languageId,
            value: variant.languageValue || '',
            label: variant.languageLabel || '',
            default: variant.languageDefault || false,
            createdAt: '',
            updatedAt: '',
          },
          versions,
          versionsCount: Number(versionsCountResult?.count || 0),
        };
      })
    );

    return variantsWithVersions;
  } catch (error) {
    console.error('Error fetching quote variants:', error);
    throw new Error('Failed to fetch quote variants');
  }
}

// Get versions for a specific variant
export async function getQuoteVersionsByVariant(variantId: string): Promise<QuoteVersionWithPositions[]> {
  try {
    const versions = await db
      .select()
      .from(quoteVersions)
      .where(and(eq(quoteVersions.variantId, variantId), eq(quoteVersions.deleted, false)))
      .orderBy(desc(quoteVersions.isLatest), desc(quoteVersions.createdAt));

    // Get positions for each version
    const versionsWithPositions = await Promise.all(
      versions.map(async (version) => {
        const positions = await getQuotePositionsByVersion(version.id);
        
        const [positionsCountResult] = await db
          .select({ count: count(quotePositions.id) })
          .from(quotePositions)
          .where(and(eq(quotePositions.versionId, version.id), eq(quotePositions.deleted, false)));

        return {
          ...version,
          positions,
          positionsCount: Number(positionsCountResult?.count || 0),
        };
      })
    );

    return versionsWithPositions;
  } catch (error) {
    console.error('Error fetching quote versions:', error);
    throw new Error('Failed to fetch quote versions');
  }
}

// Get positions for a specific version
export async function getQuotePositionsByVersion(versionId: string): Promise<QuotePositionWithDetails[]> {
  try {
    const positions = await db
      .select()
      .from(quotePositions)
      .where(and(eq(quotePositions.versionId, versionId), eq(quotePositions.deleted, false)))
      .orderBy(
        asc(quotePositions.quotePositionParentId), // nulls first for root level
        asc(quotePositions.positionNumber)
      );

    // Get article and block details for each position
    const positionsWithDetails = await Promise.all(
      positions.map(async (position) => {
        let article = null;
        let block = null;

        if (position.articleId) {
          const [articleResult] = await db
            .select()
            .from(articles)
            .where(and(eq(articles.id, position.articleId), eq(articles.deleted, false)));
          article = articleResult || null;
        }

        if (position.blockId) {
          const [blockResult] = await db
            .select()
            .from(blocks)
            .where(and(eq(blocks.id, position.blockId), eq(blocks.deleted, false)));
          block = blockResult || null;
        }

        return {
          ...position,
          article,
          block,
        };
      })
    );

    return positionsWithDetails;
  } catch (error) {
    console.error('Error fetching quote positions:', error);
    throw new Error('Failed to fetch quote positions');
  }
}

// Fetch calculation items for a quote position
export async function getPositionCalculationItems(positionId: string): Promise<{
  id: string;
  name: string;
  type: string;
  value: string;
  order: number | null;
  originalValue: string | null;
}[]> {
  try {
    const items = await db
      .select({
        id: quotePositionCalculationItems.id,
        name: quotePositionCalculationItems.name,
        type: quotePositionCalculationItems.type,
        value: quotePositionCalculationItems.value,
        order: quotePositionCalculationItems.order,
        originalValue: articleCalculationItem.value,
      })
      .from(quotePositionCalculationItems)
      .leftJoin(
        articleCalculationItem,
        eq(articleCalculationItem.id, quotePositionCalculationItems.sourceArticleCalculationItemId)
      )
      .where(and(eq(quotePositionCalculationItems.quotePositionId, positionId), eq(quotePositionCalculationItems.deleted, false)))
      .orderBy(asc(quotePositionCalculationItems.order), asc(quotePositionCalculationItems.name));

    return items as any;
  } catch (error) {
    console.error('Error fetching position calculation items:', error);
    throw new Error('Failed to fetch position calculation items');
  }
}

// Update calculation items for a quote position (editable values only)
export async function updatePositionCalculationItems(positionId: string, updates: Array<{ id: string; value: string }>): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check lock via version: get version from position
    const [position] = await db
      .select({ versionId: quotePositions.versionId })
      .from(quotePositions)
      .where(eq(quotePositions.id, positionId));

    if (position?.versionId) {
      await checkQuoteVersionEditable(position.versionId);
    }

    await db.transaction(async (tx) => {
      for (const { id, value } of updates) {
        await tx
          .update(quotePositionCalculationItems)
          .set({ value, updatedAt: sql`NOW()` })
          .where(and(eq(quotePositionCalculationItems.id, id), eq(quotePositionCalculationItems.quotePositionId, positionId)));
      }
    });
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error;
    }
    console.error('Error updating position calculation items:', error);
    throw new Error('Failed to update position calculation items');
  }
}

// Batch update calculation items across multiple positions, enforcing edit locks per version
export async function updatePositionCalculationItemsBatch(payload: Array<{ positionId: string; items: Array<{ id: string; value: string }> }>): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    if (!payload || payload.length === 0) {
      return;
    }

    // Resolve all involved versionIds to check locks once per version
    const positionIds = payload.map(p => p.positionId);
    const positionsVersions = await db
      .select({ id: quotePositions.id, versionId: quotePositions.versionId })
      .from(quotePositions)
      .where(inArray(quotePositions.id, positionIds));

    const uniqueVersionIds = Array.from(new Set(positionsVersions.map(p => p.versionId))).filter(Boolean) as string[];
    for (const versionId of uniqueVersionIds) {
      await checkQuoteVersionEditable(versionId);
    }

    await db.transaction(async (tx) => {
      for (const group of payload) {
        for (const { id, value } of group.items) {
          await tx
            .update(quotePositionCalculationItems)
            .set({ value, updatedAt: sql`NOW()` })
            .where(and(eq(quotePositionCalculationItems.id, id), eq(quotePositionCalculationItems.quotePositionId, group.positionId)));
        }
      }
    });
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error;
    }
    console.error('Error updating calculation items batch:', error);
    throw new Error('Failed to update calculation items batch');
  }
}

// Create a new quote
export async function createQuote(
  quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'modifiedBy'>
): Promise<Quote> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const [newQuote] = await db
      .insert(quotes)
      .values({
        ...quoteData,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      })
      .returning();

    // TODO: Add audit trail when audit operations are implemented for quotes

    return newQuote;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw new Error('Failed to create quote');
  }
}

// Update quote properties
export async function saveQuote(
  quoteId: string,
  quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<void> {
  try {
    // Check if quote is editable by current user
    await checkQuoteEditable(quoteId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db
      .update(quotes)
      .set({
        ...quoteData,
        modifiedBy: user.dbUser.id,
        updatedAt: sql`NOW()`,
      })
      .where(eq(quotes.id, quoteId));

    // TODO: Add audit trail when audit operations are implemented for quotes
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error saving quote:', error);
    throw new Error('Failed to save quote');
  }
}

// Soft delete a quote and all related data
export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    // Check if quote is editable by current user
    await checkQuoteEditable(quoteId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db.transaction(async (tx) => {
      // 1. Soft delete the quote (set deleted = true)
      await tx
        .update(quotes)
        .set({ deleted: true, updatedAt: sql`NOW()` })
        .where(eq(quotes.id, quoteId));

      // 2. Soft delete all related quote variants
      const variants = await tx
        .select({ id: quoteVariants.id })
        .from(quoteVariants)
        .where(eq(quoteVariants.quoteId, quoteId));

      for (const variant of variants) {
        await tx
          .update(quoteVariants)
          .set({ deleted: true, updatedAt: sql`NOW()` })
          .where(eq(quoteVariants.id, variant.id));

        // 3. Soft delete all related quote versions for this variant
        const versions = await tx
          .select({ id: quoteVersions.id })
          .from(quoteVersions)
          .where(eq(quoteVersions.variantId, variant.id));

        for (const version of versions) {
          await tx
            .update(quoteVersions)
            .set({ deleted: true, updatedAt: sql`NOW()` })
            .where(eq(quoteVersions.id, version.id));

          // 4. Soft delete all related quote positions for this version
          const affectedPositions = await tx
            .select({ id: quotePositions.id })
            .from(quotePositions)
            .where(eq(quotePositions.versionId, version.id));

          if (affectedPositions.length > 0) {
            const positionIds = affectedPositions.map(p => p.id);
            await tx
              .update(quotePositions)
              .set({ deleted: true, updatedAt: sql`NOW()` })
              .where(inArray(quotePositions.id, positionIds));

            // 5. Soft delete calculation items for those positions
            await tx
              .update(quotePositionCalculationItems)
              .set({ deleted: true, updatedAt: sql`NOW()` })
              .where(inArray(quotePositionCalculationItems.quotePositionId, positionIds));
          }
        }
      }

      // TODO: Add audit trail when audit operations are implemented for quotes
    });
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error deleting quote:', error);
    throw new Error('Failed to delete quote');
  }
}

// Create a new quote variant
export async function createQuoteVariant(
  variantData: Omit<QuoteVariant, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'modifiedBy'>
): Promise<QuoteVariant> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const [newVariant] = await db
      .insert(quoteVariants)
      .values({
        ...variantData,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      })
      .returning();

    // TODO: Add audit trail when audit operations are implemented for quote variants

    return newVariant;
  } catch (error) {
    console.error('Error creating quote variant:', error);
    throw new Error('Failed to create quote variant');
  }
}

// Create a new quote version
export async function createQuoteVersion(
  versionData: Omit<QuoteVersion, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'modifiedBy'>
): Promise<QuoteVersion> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Use transaction to handle latest version flag
    const newVersion = await db.transaction(async (tx) => {
      // If this is marked as latest, unmark all other versions in the same variant
      if (versionData.isLatest) {
        await tx
          .update(quoteVersions)
          .set({ isLatest: false })
          .where(eq(quoteVersions.variantId, versionData.variantId));
      }

      const [version] = await tx
        .insert(quoteVersions)
        .values({
          ...versionData,
          deleted: false,
          createdBy: user.dbUser.id,
          modifiedBy: user.dbUser.id,
        })
        .returning();

      return version;
    });

    // TODO: Add audit trail when audit operations are implemented for quote versions

    return newVersion;
  } catch (error) {
    console.error('Error creating quote version:', error);
    throw new Error('Failed to create quote version');
  }
}

// Add position to quote version
export async function addQuotePosition(
  positionData: Omit<QuotePosition, 'id' | 'createdAt' | 'updatedAt'>
): Promise<QuotePosition> {
  try {
    const [newPosition] = await db
      .insert(quotePositions)
      .values({
        ...positionData,
        deleted: false,
      })
      .returning();

    // TODO: Add audit trail when audit operations are implemented for quote positions

    return newPosition;
  } catch (error) {
    console.error('Error adding quote position:', error);
    throw new Error('Failed to add quote position');
  }
}

// Fetch minimal quotes list data
export async function getQuotesList(): Promise<{
  id: string;
  quoteNumber: string;
  title: string | null;
  salesOpportunityKeyword: string | null;
  variantsCount: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}[]> {
  try {
    const quotesData = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        validUntil: quotes.validUntil,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
        salesOpportunityId: quotes.salesOpportunityId,
        salesOpportunityKeyword: salesOpportunities.keyword,
      })
      .from(quotes)
      .leftJoin(salesOpportunities, eq(quotes.salesOpportunityId, salesOpportunities.id))
      .where(eq(quotes.deleted, false))
      .orderBy(desc(quotes.createdAt));

    // Get variants counts for each quote
    const quotesWithDetails = await Promise.all(
      quotesData.map(async (quote) => {
        const [variantsCountResult] = await db
          .select({ count: count(quoteVariants.id) })
          .from(quoteVariants)
          .where(and(eq(quoteVariants.quoteId, quote.id), eq(quoteVariants.deleted, false)));

        return {
          id: quote.id,
          quoteNumber: quote.quoteNumber,
          title: quote.title,
          salesOpportunityKeyword: quote.salesOpportunityKeyword,
          variantsCount: Number(variantsCountResult?.count || 0),
          validUntil: quote.validUntil,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
        };
      })
    );

    return quotesWithDetails;
  } catch (error) {
    console.error('Error fetching quotes list:', error);
    throw new Error('Failed to fetch quotes list');
  }
}

// Fetch variants list data with all required relationships
export async function getVariantsList(): Promise<{
  id: string;
  quoteId: string;
  quoteNumber: string | null;
  quoteTitle: string | null;
  variantNumber: number;
  variantDescriptor: string;
  languageId: string;
  languageLabel: string | null;
  salesOpportunityStatus: string | null;
  clientForeignId: string | null;
  clientName: string | null;
  latestVersionNumber: number;
  lastModifiedBy: string | null;
  lastModifiedByUserName: string | null;
  lastModifiedAt: string;
  // Lock status for the latest version
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
}[]> {
  try {
    const variantsData = await db
      .select({
        // Variant fields
        id: quoteVariants.id,
        quoteId: quoteVariants.quoteId,
        variantNumber: quoteVariants.variantNumber,
        variantDescriptor: quoteVariants.variantDescriptor,
        languageId: quoteVariants.languageId,
        lastModifiedBy: quoteVariants.modifiedBy,
        lastModifiedByUserName: users.name,
        lastModifiedAt: quoteVariants.updatedAt,
        // Quote fields
        quoteNumber: quotes.quoteNumber,
        quoteTitle: quotes.title,
        // Language fields
        languageLabel: languages.label,
        // Sales opportunity and client fields
        salesOpportunityStatus: salesOpportunities.status,
        clientForeignId: clients.foreignId,
        clientName: clients.name,
      })
      .from(quoteVariants)
      .leftJoin(quotes, eq(quoteVariants.quoteId, quotes.id))
      .leftJoin(languages, eq(quoteVariants.languageId, languages.id))
      .leftJoin(salesOpportunities, eq(quotes.salesOpportunityId, salesOpportunities.id))
      .leftJoin(clients, eq(salesOpportunities.clientId, clients.id))
      .leftJoin(users, eq(quoteVariants.modifiedBy, users.id))
      .where(eq(quoteVariants.deleted, false))
      .orderBy(desc(quotes.createdAt), asc(quoteVariants.variantNumber));

    // Get latest version number and lock status for each variant
    const variantsWithLatestVersion = await Promise.all(
      variantsData.map(async (variant) => {
        const [latestVersionResult] = await db
          .select({ 
            versionNumber: quoteVersions.versionNumber,
            blocked: quoteVersions.blocked,
            blockedBy: quoteVersions.blockedBy,
          })
          .from(quoteVersions)
          .where(and(eq(quoteVersions.variantId, variant.id), eq(quoteVersions.deleted, false)))
          .orderBy(desc(quoteVersions.versionNumber))
          .limit(1);

        // Get lock holder name if version is locked
        let lockedByName = null;
        if (latestVersionResult?.blocked && latestVersionResult?.blockedBy) {
          const [lockHolder] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, latestVersionResult.blockedBy));
          lockedByName = lockHolder?.name;
        }

        return {
          ...variant,
          latestVersionNumber: latestVersionResult?.versionNumber || 0,
          isLocked: !!latestVersionResult?.blocked,
          lockedBy: latestVersionResult?.blockedBy || null,
          lockedByName,
          lockedAt: latestVersionResult?.blocked || null,
        };
      })
    );

    return variantsWithLatestVersion;
  } catch (error) {
    console.error('Error fetching variants list:', error);
    throw new Error('Failed to fetch variants list');
  }
}

// Get change history for a specific quote
export async function getQuoteChangeHistory(quoteId: string, limit = 50) {
  try {
    return await auditQueries.getEntityHistory('quotes' as any, quoteId, limit);
  } catch (error) {
    console.error('Error fetching quote change history:', error);
    throw new Error('Failed to fetch quote change history');
  }
}

// Add position helper function
export async function addAsPosition(
  versionId: string,
  articleId?: string,
  blockId?: string
): Promise<QuotePosition> {
  try {
    // Validate parameters
    if (!articleId && !blockId) {
      throw new Error('Either articleId or blockId must be provided');
    }
    if (articleId && blockId) {
      throw new Error('Cannot provide both articleId and blockId');
    }

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the next position number for this version
    const [maxPositionResult] = await db
      .select({ maxPosition: quotePositions.positionNumber })
      .from(quotePositions)
      .where(eq(quotePositions.versionId, versionId))
      .orderBy(desc(quotePositions.positionNumber))
      .limit(1);

    const nextPositionNumber = (maxPositionResult?.maxPosition || 0) + 1;

    // Create position data referencing original articles/blocks directly
    if (articleId) {
      // Get article details for pricing
      const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, articleId));

      if (!article) {
        throw new Error('Article not found');
      }

      // Create the position and copy calculation items transactionally
      const newPosition = await db.transaction(async (tx) => {
        const [insertedPosition] = await tx
          .insert(quotePositions)
          .values({
            versionId,
            articleId: article.id,
            blockId: null,
            positionNumber: nextPositionNumber,
            quantity: '1',
            unitPrice: article.price,
            totalPrice: article.price,
            articleCost: null,
            description: null,
            title: null,
            // Defaults for flags on article positions
            isOption: false,
            pageBreakAbove: false,
          })
          .returning();

        const sourceCalcItems = await tx
          .select()
          .from(articleCalculationItem)
          .where(eq(articleCalculationItem.articleId, article.id));

        if (sourceCalcItems.length > 0) {
          await tx.insert(quotePositionCalculationItems).values(
            sourceCalcItems.map((item) => ({
              quotePositionId: insertedPosition.id,
              name: item.name,
              type: item.type,
              value: item.value,
              order: item.order,
              sourceArticleCalculationItemId: item.id,
              deleted: false,
            })),
          );
        }

        return insertedPosition;
      });

      return newPosition;
    } else if (blockId) {
      const [newPosition] = await db
        .insert(quotePositions)
        .values({
          versionId,
          articleId: null,
          blockId: blockId,
          positionNumber: nextPositionNumber,
          quantity: '1',
          unitPrice: null,
          totalPrice: null,
          articleCost: null,
          description: null,
          title: null,
          // For block positions: default isOption=false, page break copied from source block
          isOption: false,
          pageBreakAbove: (await (async () => {
            const [blk] = await db.select().from(blocks).where(eq(blocks.id, blockId));
            return blk?.pageBreakAbove ?? false;
          })()),
        })
        .returning();
      return newPosition;
    } else {
      throw new Error('Either articleId or blockId must be provided');
    }
    // Unreachable, but keeps TypeScript satisfied for all code paths
    // eslint-disable-next-line no-unreachable
    throw new Error('Unreachable');
  } catch (error) {
    console.error('Error adding position:', error);
    throw new Error('Failed to add position');
  }
}

// Add position with hierarchical logic
export async function addQuotePositionWithHierarchy(
  versionId: string,
  blockId: string,
  selectedNodeId?: string | null
): Promise<QuotePosition> {
  try {
    // Validate parameters
    if (!blockId) {
      throw new Error('Block ID must be provided');
    }

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check if quote version is editable by current user
    await checkQuoteVersionEditable(versionId);

    // Get all positions for this version to understand the current structure
    const allPositions = await db
      .select()
      .from(quotePositions)
      .where(eq(quotePositions.versionId, versionId))
      .orderBy(asc(quotePositions.positionNumber));

    console.log('Available positions:', allPositions.map(p => ({ id: p.id, title: p.title, parentId: p.quotePositionParentId })));
    console.log('Selected node ID:', selectedNodeId);

    // Get the selected node to determine positioning logic
    let targetParentId: string | null = null;
    let insertAfterId: string | null = null;
    let positionNumber: number;

    if (selectedNodeId && selectedNodeId !== 'undefined') {
      const selectedPosition = allPositions.find(p => p.id === selectedNodeId);
      
      if (!selectedPosition) {
        // Selected node not found, treat as no selection
        targetParentId = null;
        insertAfterId = null;
      } else {
        // Check if selected position has children
        const hasChildren = allPositions.some(p => p.quotePositionParentId === selectedNodeId);
        
        if (hasChildren) {
          // Add as last child of selected node
          targetParentId = selectedNodeId;
          insertAfterId = null;
        } else {
          // Add after selected node at same level
          targetParentId = selectedPosition.quotePositionParentId;
          insertAfterId = selectedNodeId;
        }
      }
    } else {
      // No selection, add at top level
      targetParentId = null;
      insertAfterId = null;
    }

    // Calculate position number based on target parent and insert position
    const positionsAtLevel = allPositions.filter(p => p.quotePositionParentId === targetParentId);
    
    if (insertAfterId) {
      // Insert after specific position
      const insertAfterPosition = positionsAtLevel.find(p => p.id === insertAfterId);
      if (!insertAfterPosition) {
        throw new Error('Insert after position not found');
      }
      
      // Shift position numbers for positions after the insert point
      const positionsToShift = positionsAtLevel.filter(p => p.positionNumber > insertAfterPosition.positionNumber);
      for (const position of positionsToShift) {
        await db
          .update(quotePositions)
          .set({ positionNumber: position.positionNumber + 1 })
          .where(eq(quotePositions.id, position.id));
      }
      
      positionNumber = insertAfterPosition.positionNumber + 1;
    } else {
      // Insert at end of level
      const maxPositionAtLevel = positionsAtLevel.length > 0 
        ? Math.max(...positionsAtLevel.map(p => p.positionNumber))
        : 0;
      positionNumber = maxPositionAtLevel + 1;
    }

    console.log('Positioning logic:', {
      selectedNodeId,
      targetParentId,
      insertAfterId,
      positionNumber,
      positionsAtLevel: positionsAtLevel.length,
      selectedPositionFound: selectedNodeId ? allPositions.find(p => p.id === selectedNodeId) : null
    });

    // Get block content to copy title and description
    const [blockContentData] = await db
      .select()
      .from(blockContent)
      .where(eq(blockContent.blockId, blockId))
      .limit(1);

    // Create position data
    const positionData = {
      versionId,
      articleId: null,
      blockId: blockId,
      quotePositionParentId: targetParentId,
      positionNumber,
      quantity: '1',
      unitPrice: null,
      totalPrice: null,
      articleCost: null,
      description: blockContentData?.content || null,
      title: blockContentData?.title || null,
    };

    const [newPosition] = await db
      .insert(quotePositions)
      .values(positionData)
      .returning();

    return newPosition;
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error adding quote position with hierarchy:', error);
    throw new Error('Failed to add quote position');
  }
}

// Add position with hierarchical logic for articles
export async function addQuotePositionWithHierarchyForArticle(
  versionId: string,
  articleId: string,
  selectedNodeId?: string | null
): Promise<QuotePosition> {
  try {
    // Validate parameters
    if (!articleId) {
      throw new Error('Article ID must be provided');
    }

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check if quote version is editable by current user
    await checkQuoteVersionEditable(versionId);

    // Get all positions for this version to understand the current structure
    const allPositions = await db
      .select()
      .from(quotePositions)
      .where(eq(quotePositions.versionId, versionId))
      .orderBy(asc(quotePositions.positionNumber));

    console.log('Available positions:', allPositions.map(p => ({ id: p.id, title: p.title, parentId: p.quotePositionParentId })));
    console.log('Selected node ID:', selectedNodeId);

    // Get the selected node to determine positioning logic
    let targetParentId: string | null = null;
    let insertAfterId: string | null = null;
    let positionNumber: number;

    if (selectedNodeId && selectedNodeId !== 'undefined') {
      const selectedPosition = allPositions.find(p => p.id === selectedNodeId);
      
      if (!selectedPosition) {
        // Selected node not found, treat as no selection
        targetParentId = null;
        insertAfterId = null;
      } else {
        // Check if selected position has children
        const hasChildren = allPositions.some(p => p.quotePositionParentId === selectedNodeId);
        
        if (hasChildren) {
          // Add as last child of selected node
          targetParentId = selectedNodeId;
          insertAfterId = null;
        } else {
          // Add after selected node at same level
          targetParentId = selectedPosition.quotePositionParentId;
          insertAfterId = selectedNodeId;
        }
      }
    } else {
      // No selection, add at top level
      targetParentId = null;
      insertAfterId = null;
    }

    // Calculate position number based on target parent and insert position
    const positionsAtLevel = allPositions.filter(p => p.quotePositionParentId === targetParentId);
    
    if (insertAfterId) {
      // Insert after specific position
      const insertAfterPosition = positionsAtLevel.find(p => p.id === insertAfterId);
      if (!insertAfterPosition) {
        throw new Error('Insert after position not found');
      }
      
      // Shift position numbers for positions after the insert point
      const positionsToShift = positionsAtLevel.filter(p => p.positionNumber > insertAfterPosition.positionNumber);
      for (const position of positionsToShift) {
        await db
          .update(quotePositions)
          .set({ positionNumber: position.positionNumber + 1 })
          .where(eq(quotePositions.id, position.id));
      }
      
      positionNumber = insertAfterPosition.positionNumber + 1;
    } else {
      // Insert at end of level
      const maxPositionAtLevel = positionsAtLevel.length > 0 
        ? Math.max(...positionsAtLevel.map(p => p.positionNumber))
        : 0;
      positionNumber = maxPositionAtLevel + 1;
    }

    console.log('Positioning logic:', {
      selectedNodeId,
      targetParentId,
      insertAfterId,
      positionNumber,
      positionsAtLevel: positionsAtLevel.length,
      selectedPositionFound: selectedNodeId ? allPositions.find(p => p.id === selectedNodeId) : null
    });

    // Get article content to copy title and description
    const [articleContentData] = await db
      .select()
      .from(blockContent)
      .where(eq(blockContent.articleId, articleId))
      .limit(1);

    // Get article details for pricing
    const [articleData] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId));

    if (!articleData) {
      throw new Error('Article not found');
    }

    // Create position and copy calculation items within a transaction
    const newPosition = await db.transaction(async (tx) => {
      // Create position
      const [insertedPosition] = await tx
        .insert(quotePositions)
        .values({
          versionId,
          articleId: articleId,
          blockId: null,
          quotePositionParentId: targetParentId,
          positionNumber,
          quantity: '1',
          unitPrice: articleData.price,
          totalPrice: articleData.price,
          articleCost: null,
          description: articleContentData?.content || null,
          title: articleContentData?.title || null,
            isOption: false,
            pageBreakAbove: false,
        })
        .returning();

      // Fetch all calculation items from the source article
      const sourceCalcItems = await tx
        .select()
        .from(articleCalculationItem)
        .where(eq(articleCalculationItem.articleId, articleId));

      // Copy them to quote_position_calculation_items
      if (sourceCalcItems.length > 0) {
        await tx.insert(quotePositionCalculationItems).values(
          sourceCalcItems.map((item) => ({
            quotePositionId: insertedPosition.id,
            name: item.name,
            type: item.type,
            value: item.value,
            order: item.order,
            sourceArticleCalculationItemId: item.id,
            deleted: false,
          })),
        );
      }

      return insertedPosition;
    });

    return newPosition;
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error adding quote position with hierarchy for article:', error);
    throw new Error('Failed to add quote position');
  }
}

// Get next variant number for a quote (returns 1, 2, 3, etc.)
export async function getNextVariantNumber(quoteId: string): Promise<number> {
  try {
    const [maxVariantResult] = await db
      .select({ maxNumber: quoteVariants.variantNumber })
      .from(quoteVariants)
      .where(and(eq(quoteVariants.quoteId, quoteId), eq(quoteVariants.deleted, false)))
      .orderBy(desc(quoteVariants.variantNumber))
      .limit(1);

    const maxNumber = Number(maxVariantResult?.maxNumber || 0);
    return maxNumber + 1;
  } catch (error) {
    console.error('Error getting next variant number:', error);
    throw new Error('Failed to get next variant number');
  }
}

// Get next version number for a variant (returns 1, 2, 3, etc.)
export async function getNextVersionNumber(variantId: string): Promise<number> {
  try {
    const [maxVersionResult] = await db
      .select({ maxVersion: quoteVersions.versionNumber })
      .from(quoteVersions)
      .where(and(eq(quoteVersions.variantId, variantId), eq(quoteVersions.deleted, false)))
      .orderBy(desc(quoteVersions.versionNumber))
      .limit(1);

    const maxVersion = Number(maxVersionResult?.maxVersion || 0);
    return maxVersion + 1;
  } catch (error) {
    console.error('Error getting next version number:', error);
    throw new Error('Failed to get next version number');
  }
}

// Get latest variant for a quote (highest variant number)
export async function getLatestVariantForQuote(quoteId: string): Promise<QuoteVariant | null> {
  try {
    const [latestVariant] = await db
      .select()
      .from(quoteVariants)
      .where(and(eq(quoteVariants.quoteId, quoteId), eq(quoteVariants.deleted, false)))
      .orderBy(desc(quoteVariants.variantNumber))
      .limit(1);

    return latestVariant || null;
  } catch (error) {
    console.error('Error getting latest variant:', error);
    throw new Error('Failed to get latest variant');
  }
}

// Get latest version for a variant (either marked as latest or highest version number)
export async function getLatestVersionForVariant(variantId: string): Promise<QuoteVersion | null> {
  try {
    // First try to get the version marked as latest
    const [latestVersion] = await db
      .select()
      .from(quoteVersions)
      .where(and(
        eq(quoteVersions.variantId, variantId),
        eq(quoteVersions.isLatest, true),
        eq(quoteVersions.deleted, false)
      ))
      .limit(1);

    if (latestVersion) {
      return latestVersion;
    }

    // If no version is marked as latest, get the one with highest version number
    const [highestVersion] = await db
      .select()
      .from(quoteVersions)
      .where(and(eq(quoteVersions.variantId, variantId), eq(quoteVersions.deleted, false)))
      .orderBy(desc(quoteVersions.versionNumber))
      .limit(1);

    return highestVersion || null;
  } catch (error) {
    console.error('Error getting latest version:', error);
    throw new Error('Failed to get latest version');
  }
}

// Get variant by ID
export async function getQuoteVariantById(variantId: string): Promise<QuoteVariant | null> {
  try {
    const [variant] = await db
      .select()
      .from(quoteVariants)
      .where(and(eq(quoteVariants.id, variantId), eq(quoteVariants.deleted, false)))
      .limit(1);

    return variant || null;
  } catch (error) {
    console.error('Error getting variant by ID:', error);
    throw new Error('Failed to get variant');
  }
}

// Get version by ID
export async function getQuoteVersionById(versionId: string): Promise<QuoteVersion & { modifiedByUserName?: string | null } | null> {
  try {
    const [version] = await db
      .select({
        id: quoteVersions.id,
        variantId: quoteVersions.variantId,
        versionNumber: quoteVersions.versionNumber,
        accepted: quoteVersions.accepted,
        calculationDataLive: quoteVersions.calculationDataLive,
        totalPrice: quoteVersions.totalPrice,
        pricingShowUnitPrices: quoteVersions.pricingShowUnitPrices,
        pricingCalcTotal: quoteVersions.pricingCalcTotal,
        pricingDiscountPercent: quoteVersions.pricingDiscountPercent,
        pricingDiscountValue: quoteVersions.pricingDiscountValue,
        pricingDiscountAmount: quoteVersions.pricingDiscountAmount,
        isLatest: quoteVersions.isLatest,
        blocked: quoteVersions.blocked,
        blockedBy: quoteVersions.blockedBy,
        deleted: quoteVersions.deleted,
        createdAt: quoteVersions.createdAt,
        updatedAt: quoteVersions.updatedAt,
        createdBy: quoteVersions.createdBy,
        modifiedBy: quoteVersions.modifiedBy,
        modifiedByUserName: users.name,
      })
      .from(quoteVersions)
      .leftJoin(users, eq(quoteVersions.modifiedBy, users.id))
      .where(and(eq(quoteVersions.id, versionId), eq(quoteVersions.deleted, false)))
      .limit(1);

    return version || null;
  } catch (error) {
    console.error('Error getting version by ID:', error);
    throw new Error('Failed to get version');
  }
}

// Helper function to create quote positions for mandatory and standard blocks
async function createStandardBlockPositions(
  tx: any,
  versionId: string,
  languageId: string
): Promise<void> {
  // Get all mandatory and standard blocks, ordered by position then name
  const standardBlocks = await tx
    .select({
      id: blocks.id,
      name: blocks.name,
      position: blocks.position,
      standard: blocks.standard,
      mandatory: blocks.mandatory,
    })
    .from(blocks)
    .where(and(
      or(eq(blocks.standard, true), eq(blocks.mandatory, true)),
      eq(blocks.deleted, false)
    ))
    .orderBy(asc(blocks.position), asc(blocks.name));

  // For each block, create a quote position
  let positionNumber = 1;
  
  for (const block of standardBlocks) {
    // Get block content for the specified language
    const [content] = await tx
      .select({
        title: blockContent.title,
        content: blockContent.content,
      })
      .from(blockContent)
      .where(
        and(
          eq(blockContent.blockId, block.id),
          eq(blockContent.languageId, languageId),
          eq(blockContent.deleted, false)
        )
      )
      .limit(1);

    // Create quote position with block reference
    await tx.insert(quotePositions).values({
      versionId: versionId,
      blockId: block.id,
      articleId: null,
      positionNumber: positionNumber,
      quantity: '1',
      unitPrice: null,
      totalPrice: null,
      articleCost: null,
      title: content?.title || '',
      description: content?.content || '',
    });

    positionNumber++;
  }
}

// Create a complete quote with first variant and version
export async function createQuoteWithVariantAndVersion(quoteData: {
  title: string;
  salesOpportunityId: string;
  validUntil?: string;
  languageId: string;
}): Promise<{
  quote: Quote;
  variant: QuoteVariant;
  version: QuoteVersion;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    return await db.transaction(async (tx) => {
      // Create quote
      const quoteCount = await tx.select({ count: count(quotes.id) }).from(quotes).where(eq(quotes.deleted, false));
      const startNumber = Number(process.env.QUOTE_NUMBER_START || 1);
      const nextNumber = startNumber + (Number(quoteCount[0]?.count || 0));
      const quoteNumber = `${String(nextNumber).padStart(4, '0')}`;

      const [newQuote] = await tx.insert(quotes).values({
        ...quoteData,
        quoteNumber,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      // Create first variant with number 1
      const [newVariant] = await tx.insert(quoteVariants).values({
        quoteId: newQuote.id,
        variantDescriptor: "",
        variantNumber: 1,
        languageId: quoteData.languageId,
        isDefault: true,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      // Create first version with number 1
      const [newVersion] = await tx.insert(quoteVersions).values({
        variantId: newVariant.id,
        versionNumber: 1,
        isLatest: true,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      // Add mandatory and standard blocks as quote positions
      await createStandardBlockPositions(tx, newVersion.id, quoteData.languageId);

      return {
        quote: newQuote,
        variant: newVariant,
        version: newVersion,
      };
    });
  } catch (error) {
    console.error('Error creating quote with variant and version:', error);
    throw new Error('Failed to create quote with variant and version');
  }
}

// Create a new variant for an existing quote
export async function createVariantForQuote(
  quoteId: string,
  languageId: string
): Promise<{
  variant: QuoteVariant;
  version: QuoteVersion;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    return await db.transaction(async (tx) => {
      // Get next variant number
      const nextNumber = await getNextVariantNumber(quoteId);

      // Create new variant
      const [newVariant] = await tx.insert(quoteVariants).values({
        quoteId,
        variantDescriptor: nextNumber.toString(),
        variantNumber: nextNumber,
        languageId,
        isDefault: false,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      // Create first version for this variant
      const [newVersion] = await tx.insert(quoteVersions).values({
        variantId: newVariant.id,
        versionNumber: 1,
        isLatest: true,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      return {
        variant: newVariant,
        version: newVersion,
      };
    });
  } catch (error) {
    console.error('Error creating variant for quote:', error);
    throw new Error('Failed to create variant for quote');
  }
}

// Create a new version for an existing variant
export async function createVersionForVariant(
  variantId: string
): Promise<QuoteVersion> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    return await db.transaction(async (tx) => {
      // Get next version number
      const nextVersionNumber = await getNextVersionNumber(variantId);

      // Unmark all other versions as latest
      await tx
        .update(quoteVersions)
        .set({ isLatest: false })
        .where(eq(quoteVersions.variantId, variantId));

      // Create new version
      const [newVersion] = await tx.insert(quoteVersions).values({
        variantId,
        versionNumber: nextVersionNumber,
        isLatest: true,
        deleted: false,
        createdBy: user.dbUser.id,
        modifiedBy: user.dbUser.id,
      }).returning();

      return newVersion;
    });
  } catch (error) {
    console.error('Error creating version for variant:', error);
    throw new Error('Failed to create version for variant');
  }
}

// Copy a quote
export async function copyQuote(originalQuoteId: string): Promise<Quote> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the original quote with all details
    const originalQuote = await getQuoteWithDetails(originalQuoteId);
    if (!originalQuote) {
      throw new Error('Original quote not found');
    }

    // Create new quote with "(Kopie)" appended to the quote number
    const newQuote = await createQuote({
      salesOpportunityId: originalQuote.salesOpportunityId,
      quoteNumber: `${originalQuote.quoteNumber} (Kopie)`,
      title: originalQuote.title,
      validUntil: originalQuote.validUntil,
      blocked: null,
      blockedBy: null,
      deleted: false,
    });

    // TODO: Copy variants, versions, and positions in a transaction
    // This would be complex and should be implemented when needed

    return newQuote;
  } catch (error) {
    console.error('Error copying quote:', error);
    throw new Error('Failed to copy quote');
  }
}

// Update position order and parent relationships
export async function updateQuotePositionsOrder(
  versionId: string,
  positionUpdates: Array<{
    id: string;
    positionNumber: number;
    quotePositionParentId: string | null;
  }>
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Benutzer nicht authentifiziert');
  }

  // Check if quote version is editable by current user
  await checkQuoteVersionEditable(versionId);

  await db.transaction(async (tx) => {
    // Step 1: Set ALL non-deleted positions in this version to temporary negative values
    // This completely clears the unique constraint space for this version
    
    // Get all non-deleted positions for this version
    const allVersionPositions = await tx
      .select({ id: quotePositions.id })
      .from(quotePositions)
      .where(
        and(
          eq(quotePositions.versionId, versionId),
          eq(quotePositions.deleted, false)
        )
      );
    
    // Set ALL non-deleted positions to temporary negative values to clear constraint space
    for (let i = 0; i < allVersionPositions.length; i++) {
      const position = allVersionPositions[i];
      const tempValue = -(i + 1000); // Use large negative values to avoid conflicts
      await tx
        .update(quotePositions)
        .set({
          positionNumber: tempValue,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(quotePositions.id, position.id),
            eq(quotePositions.versionId, versionId),
            eq(quotePositions.deleted, false)
          )
        );
    }

    // Step 2: Update to final position numbers and parent relationships (only non-deleted positions)
    for (const update of positionUpdates) {
      await tx
        .update(quotePositions)
        .set({
          positionNumber: update.positionNumber,
          quotePositionParentId: update.quotePositionParentId,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(quotePositions.id, update.id),
            eq(quotePositions.versionId, versionId),
            eq(quotePositions.deleted, false)
          )
        );
    }
  });
} 

// Update a single quote position
export async function updateQuotePosition(
  positionId: string,
  positionData: Partial<Omit<QuotePosition, 'id' | 'versionId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the version ID from the position to check locks
    const [position] = await db
      .select({ versionId: quotePositions.versionId })
      .from(quotePositions)
      .where(eq(quotePositions.id, positionId));

    if (position) {
      // Check if quote version is editable by current user
      await checkQuoteVersionEditable(position.versionId);
    }

    await db
      .update(quotePositions)
      .set({
        ...positionData,
        updatedAt: sql`NOW()`,
      })
      .where(eq(quotePositions.id, positionId));

    // TODO: Add audit trail when audit operations are implemented for quote positions
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error updating quote position:', error);
    throw new Error('Failed to update quote position');
  }
}

// Update multiple quote positions in a batch
export async function updateQuotePositions(
  positionUpdates: Array<{
    id: string;
    title?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
    totalPrice?: string;
    articleCost?: string;
    calculationNote?: string;
    isOption?: boolean;
    pageBreakAbove?: boolean;
  }>
): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the version ID from the first position to check locks
    if (positionUpdates.length > 0) {
      const [firstPosition] = await db
        .select({ versionId: quotePositions.versionId })
        .from(quotePositions)
        .where(eq(quotePositions.id, positionUpdates[0].id));

      if (firstPosition) {
        // Check if quote version is editable by current user
        await checkQuoteVersionEditable(firstPosition.versionId);
      }
    }

    await db.transaction(async (tx) => {
      for (const update of positionUpdates) {
        const { id, ...updateData } = update;
        await tx
          .update(quotePositions)
          .set({
            ...updateData,
            updatedAt: sql`NOW()`,
          })
          .where(eq(quotePositions.id, id));
      }
    });

    // TODO: Add audit trail when audit operations are implemented for quote positions
  } catch (error) {
    if (error instanceof EditLockError) {
      throw error; // Re-throw edit lock errors as-is
    }
    console.error('Error updating quote positions:', error);
    throw new Error('Failed to update quote positions');
  }
} 

// Soft delete a quote
export async function softDeleteQuote(quoteId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db.transaction(async (tx) => {
      // 1. Soft delete the quote
      await tx
        .update(quotes)
        .set({ deleted: true, updatedAt: sql`NOW()` })
        .where(eq(quotes.id, quoteId));

      // 2. Soft delete all related quote variants
      const variants = await tx
        .select({ id: quoteVariants.id })
        .from(quoteVariants)
        .where(eq(quoteVariants.quoteId, quoteId));

      for (const variant of variants) {
        await tx
          .update(quoteVariants)
          .set({ deleted: true, updatedAt: sql`NOW()` })
          .where(eq(quoteVariants.id, variant.id));

        // 3. Soft delete all related quote versions for this variant
        const versions = await tx
          .select({ id: quoteVersions.id })
          .from(quoteVersions)
          .where(eq(quoteVersions.variantId, variant.id));

        for (const version of versions) {
          await tx
            .update(quoteVersions)
            .set({ deleted: true, updatedAt: sql`NOW()` })
            .where(eq(quoteVersions.id, version.id));

          // 4. Soft delete all related quote positions for this version
          const affectedPositions = await tx
            .select({ id: quotePositions.id })
            .from(quotePositions)
            .where(eq(quotePositions.versionId, version.id));

          if (affectedPositions.length > 0) {
            const positionIds = affectedPositions.map((p) => p.id);
            await tx
              .update(quotePositions)
              .set({ deleted: true, updatedAt: sql`NOW()` })
              .where(inArray(quotePositions.id, positionIds));

            // 5. Soft delete calculation items for those positions
            await tx
              .update(quotePositionCalculationItems)
              .set({ deleted: true, updatedAt: sql`NOW()` })
              .where(inArray(quotePositionCalculationItems.quotePositionId, positionIds));
          }
        }
      }

      // TODO: Add audit trail when audit operations are implemented for quotes
    });
  } catch (error) {
    console.error('Error soft deleting quote:', error);
    throw new Error('Failed to soft delete quote');
  }
}

// Restore a soft deleted quote
export async function restoreQuote(quoteId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    await db.transaction(async (tx) => {
      // 1. Restore the quote
      await tx
        .update(quotes)
        .set({ deleted: false, updatedAt: sql`NOW()` })
        .where(eq(quotes.id, quoteId));

      // 2. Restore all related soft-deleted quote variants
      const variants = await tx
        .select({ id: quoteVariants.id })
        .from(quoteVariants)
        .where(and(eq(quoteVariants.quoteId, quoteId), eq(quoteVariants.deleted, true)));

      for (const variant of variants) {
        await tx
          .update(quoteVariants)
          .set({ deleted: false, updatedAt: sql`NOW()` })
          .where(eq(quoteVariants.id, variant.id));

        // 3. Restore all related soft-deleted quote versions for this variant
        const versions = await tx
          .select({ id: quoteVersions.id })
          .from(quoteVersions)
          .where(and(eq(quoteVersions.variantId, variant.id), eq(quoteVersions.deleted, true)));

        for (const version of versions) {
          await tx
            .update(quoteVersions)
            .set({ deleted: false, updatedAt: sql`NOW()` })
            .where(eq(quoteVersions.id, version.id));

          // 4. Restore all related soft-deleted quote positions for this version
          const affectedPositions = await tx
            .select({ id: quotePositions.id })
            .from(quotePositions)
            .where(and(eq(quotePositions.versionId, version.id), eq(quotePositions.deleted, true)));

          if (affectedPositions.length > 0) {
            const positionIds = affectedPositions.map(p => p.id);
            await tx
              .update(quotePositions)
              .set({ deleted: false, updatedAt: sql`NOW()` })
              .where(inArray(quotePositions.id, positionIds));

            // 5. Restore calculation items for those positions as well
            await tx
              .update(quotePositionCalculationItems)
              .set({ deleted: false, updatedAt: sql`NOW()` })
              .where(inArray(quotePositionCalculationItems.quotePositionId, positionIds));
          }
        }
      }

      // TODO: Add audit trail when audit operations are implemented for quotes
    });
  } catch (error) {
    console.error('Error restoring quote:', error);
    throw new Error('Failed to restore quote');
  }
} 

// Soft delete a quote position
export async function softDeleteQuotePosition(positionId: string): Promise<void> {
  try {
    // Check if position has children
    const children = await db
      .select()
      .from(quotePositions)
      .where(eq(quotePositions.quotePositionParentId, positionId));

    if (children.length > 0) {
      throw new Error('Position cannot be deleted because it has children');
    }

    // Soft delete the position and its calculation items in a transaction
    await db.transaction(async (tx) => {
      const timestamp = Math.floor(Date.now() / 1000); // Use timestamp as position number
      await tx
        .update(quotePositions)
        .set({ 
          deleted: true,
          positionNumber: timestamp, // Use timestamp as position number
          updatedAt: sql`NOW()`
        })
        .where(eq(quotePositions.id, positionId));

      // Soft delete related quote_position_calculation_items
      await tx
        .update(quotePositionCalculationItems)
        .set({ deleted: true, updatedAt: sql`NOW()` })
        .where(eq(quotePositionCalculationItems.quotePositionId, positionId));
    });

  } catch (error) {
    console.error('Error soft deleting quote position:', error);
    throw error;
  }
}

// Soft delete a quote variant and all its versions and positions
export async function softDeleteQuoteVariant(variantId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Check if variant exists and is not already deleted
    const [variant] = await db
      .select()
      .from(quoteVariants)
      .where(and(eq(quoteVariants.id, variantId), eq(quoteVariants.deleted, false)));

    if (!variant) {
      throw new Error('Variante nicht gefunden');
    }

    await db.transaction(async (tx) => {
      // 1. Soft delete the variant
      await tx
        .update(quoteVariants)
        .set({ 
          deleted: true, 
          updatedAt: sql`NOW()`,
          modifiedBy: user.dbUser.id
        })
        .where(eq(quoteVariants.id, variantId));

      // 2. Soft delete all related quote versions for this variant
      const versions = await tx
        .select({ id: quoteVersions.id })
        .from(quoteVersions)
        .where(eq(quoteVersions.variantId, variantId));

      for (const version of versions) {
        await tx
          .update(quoteVersions)
          .set({ 
            deleted: true, 
            updatedAt: sql`NOW()`,
            modifiedBy: user.dbUser.id
          })
          .where(eq(quoteVersions.id, version.id));

        // 3. Soft delete all related quote positions for this version
        const affectedPositions = await tx
          .select({ id: quotePositions.id })
          .from(quotePositions)
          .where(eq(quotePositions.versionId, version.id));

        if (affectedPositions.length > 0) {
          const positionIds = affectedPositions.map((p) => p.id);
          await tx
            .update(quotePositions)
            .set({ 
              deleted: true, 
              updatedAt: sql`NOW()`
            })
            .where(inArray(quotePositions.id, positionIds));

          // 4. Soft delete calculation items for those positions
          await tx
            .update(quotePositionCalculationItems)
            .set({ deleted: true, updatedAt: sql`NOW()` })
            .where(inArray(quotePositionCalculationItems.quotePositionId, positionIds));
        }
      }

      // TODO: Add audit trail when audit operations are implemented for quote variants
    });
  } catch (error) {
    console.error('Error soft deleting quote variant:', error);
    throw error;
  }
}

// Helper function to sort positions by dependency (parents first, then children)
const sortPositionsByDependency = (positions: QuotePosition[]): QuotePosition[] => {
  // Create adjacency list for dependency graph
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  // Initialize
  positions.forEach(pos => {
    adjacencyList.set(pos.id, []);
    inDegree.set(pos.id, 0);
  });
  
  // Build dependency graph
  positions.forEach(pos => {
    if (pos.quotePositionParentId) {
      const parentId = pos.quotePositionParentId;
      const children = adjacencyList.get(parentId) || [];
      children.push(pos.id);
      adjacencyList.set(parentId, children);
      
      // Increment in-degree for child
      const currentInDegree = inDegree.get(pos.id) || 0;
      inDegree.set(pos.id, currentInDegree + 1);
    }
  });
  
  // Topological sort (parents before children)
  const sorted: QuotePosition[] = [];
  const queue: string[] = [];
  
  // Add root nodes (positions with no parent)
  positions.forEach(pos => {
    if (!pos.quotePositionParentId) {
      queue.push(pos.id);
    }
  });
  
  // Process queue
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentPos = positions.find(p => p.id === currentId)!;
    sorted.push(currentPos);
    
    // Add children to queue
    const children = adjacencyList.get(currentId) || [];
    children.forEach(childId => {
      const childInDegree = inDegree.get(childId)! - 1;
      inDegree.set(childId, childInDegree);
      
      if (childInDegree === 0) {
        queue.push(childId);
      }
    });
  }
  
  return sorted;
};

// Helper function to update position numbers to final values
const updatePositionNumbers = async (
  tx: any, 
  versionId: string,
  originalPositions: QuotePosition[],
  positionIdMapping: Map<string, string>
): Promise<void> => {
  // Group original positions by parent ID to maintain order
  const positionsByParent = new Map<string | null, QuotePosition[]>();
  
  originalPositions.forEach(pos => {
    const parentId = pos.quotePositionParentId;
    const group = positionsByParent.get(parentId) || [];
    group.push(pos);
    positionsByParent.set(parentId, group);
  });
  
  // Update position numbers for each group, preserving original order
  for (const [parentId, originalGroupPositions] of positionsByParent) {
    // Sort by original position number to maintain order
    const sortedOriginalPositions = originalGroupPositions.sort((a, b) => a.positionNumber - b.positionNumber);
    
    // Update position numbers in the correct order
    for (let i = 0; i < sortedOriginalPositions.length; i++) {
      const originalPosition = sortedOriginalPositions[i];
      const newPositionId = positionIdMapping.get(originalPosition.id);
      
      if (newPositionId) {
        await tx
          .update(quotePositions)
          .set({ positionNumber: i + 1 })
          .where(eq(quotePositions.id, newPositionId));
      }
    }
  }
};

// Helper function to copy positions with tree structure preservation
const copyPositionsWithTreeStructure = async (
  tx: any, 
  originalVersionId: string, 
  newVersionId: string
): Promise<void> => {
  // Get original positions
  const originalPositions = await getQuotePositionsByVersion(originalVersionId);
  
  if (originalPositions.length === 0) {
    return; // No positions to copy
  }
  
  // Create ID mapping
  const positionIdMapping = new Map<string, string>();
  
  // Sort by dependency (parents first)
  const sortedPositions = sortPositionsByDependency(originalPositions);
  
  // Phase 1: Insert all positions with temporary parent IDs
  for (let i = 0; i < sortedPositions.length; i++) {
    const originalPosition = sortedPositions[i];
    
    // Use temporary negative position number to avoid unique constraint
    const tempPositionNumber = -(i + 1000);
    
    const newPosition = await tx
      .insert(quotePositions)
      .values({
        versionId: newVersionId,
        title: originalPosition.title,
        description: originalPosition.description,
        quantity: originalPosition.quantity,
        unitPrice: originalPosition.unitPrice,
        totalPrice: originalPosition.totalPrice,
        articleCost: originalPosition.articleCost,
        articleId: originalPosition.articleId,
        blockId: originalPosition.blockId,
        positionNumber: tempPositionNumber, // Temporary negative number
        quotePositionParentId: null, // Temporary null
        deleted: false,
      })
      .returning();
    
    // Store mapping: originalId -> newId
    positionIdMapping.set(originalPosition.id, newPosition[0].id);
  }
  
  // Phase 2: Update parent references
  for (const originalPosition of sortedPositions) {
    if (originalPosition.quotePositionParentId) {
      const newParentId = positionIdMapping.get(originalPosition.quotePositionParentId);
      const newPositionId = positionIdMapping.get(originalPosition.id);
      
      if (newParentId && newPositionId) {
        await tx
          .update(quotePositions)
          .set({ quotePositionParentId: newParentId })
          .where(eq(quotePositions.id, newPositionId));
      }
    }
  }
  
  // Phase 3: Update position numbers to final values
  await updatePositionNumbers(tx, newVersionId, originalPositions, positionIdMapping);
};

// Copy a quote variant with all its versions and positions
export async function copyQuoteVariant(variantId: string): Promise<QuoteVariant> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // Get the original variant with all its versions and positions
    const originalVariant = await getQuoteVariantById(variantId);
    if (!originalVariant) {
      throw new Error('Original variant not found');
    }

    // Get all versions for this variant
    const originalVersions = await getQuoteVersionsByVariant(variantId);

    const result = await db.transaction(async (tx) => {
      // 1. Create a new variant with "(Kopie)" appended to the descriptor
      const nextVariantNumber = await getNextVariantNumber(originalVariant.quoteId);
      const newVariant = await tx
        .insert(quoteVariants)
        .values({
          quoteId: originalVariant.quoteId,
          variantDescriptor: `${originalVariant.variantDescriptor} (Kopie)`,
          variantNumber: nextVariantNumber,
          languageId: originalVariant.languageId,
          isDefault: false, // New variant is never default
          blocked: null,
          blockedBy: null,
          deleted: false,
          createdBy: user.dbUser.id,
          modifiedBy: user.dbUser.id,
        })
        .returning();

      // 2. Copy all versions for this variant
      for (const originalVersion of originalVersions) {
        // Create new version
        const nextVersionNumber = await getNextVersionNumber(newVariant[0].id);
        const newVersion = await tx
          .insert(quoteVersions)
          .values({
            variantId: newVariant[0].id,
            versionNumber: nextVersionNumber,
            isLatest: false, // Will be set to true for the last one
            blocked: null,
            blockedBy: null,
            deleted: false,
            createdBy: user.dbUser.id,
            modifiedBy: user.dbUser.id,
          })
          .returning();

        // 3. Copy positions with tree structure preservation
        await copyPositionsWithTreeStructure(tx, originalVersion.id, newVersion[0].id);

        // Set the last version as latest
        if (originalVersion === originalVersions[originalVersions.length - 1]) {
          await tx
            .update(quoteVersions)
            .set({ isLatest: true })
            .where(eq(quoteVersions.id, newVersion[0].id));
        }
      }

      // TODO: Add audit trail when audit operations are implemented for quote variants
      
      return newVariant[0];
    });

    // Return the newly created variant
    const newVariantWithDetails = await getQuoteVariantById(result.id);
    return newVariantWithDetails!;
  } catch (error) {
    console.error('Error copying quote variant:', error);
    throw new Error('Failed to copy quote variant');
  }
} 