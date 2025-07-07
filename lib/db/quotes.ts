import { eq, desc, sql, and, inArray, or, count, asc } from 'drizzle-orm';
import { db } from './index';
import {
  quotes,
  quoteVariants,
  quoteVersions,
  quotePositions,
  salesOpportunities,
  articles,
  blocks,
  languages,
  users,
  changeHistory,
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

// Common error type for edit lock conflicts
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly quoteId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null,
  ) {
    super(message);
    this.name = 'EditLockError';
  }
}

export type QuoteWithDetails = Quote & {
  salesOpportunity: SalesOpportunity;
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

// Fetch all quotes
export async function getQuotes(): Promise<Quote[]> {
  try {
    return await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw new Error('Failed to fetch quotes');
  }
}

// Get quotes for a specific sales opportunity
export async function getQuotesBySalesOpportunity(salesOpportunityId: string): Promise<Quote[]> {
  try {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.salesOpportunityId, salesOpportunityId))
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
      .where(eq(quotes.id, quoteId));

    if (!quote) return null;

    // Get full sales opportunity
    const [salesOpportunity] = await db
      .select()
      .from(salesOpportunities)
      .where(eq(salesOpportunities.id, quote.salesOpportunityId));

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
        variantDescriptor: quoteVariants.variantDescriptor,
        languageId: quoteVariants.languageId,
        isDefault: quoteVariants.isDefault,
        blocked: quoteVariants.blocked,
        blockedBy: quoteVariants.blockedBy,
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
      .where(eq(quoteVariants.quoteId, quoteId))
      .orderBy(quoteVariants.isDefault ? desc(quoteVariants.isDefault) : asc(quoteVariants.variantDescriptor));

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
          variantDescriptor: variant.variantDescriptor,
          languageId: variant.languageId,
          isDefault: variant.isDefault,
          blocked: variant.blocked,
          blockedBy: variant.blockedBy,
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
      .where(eq(quoteVersions.variantId, variantId))
      .orderBy(desc(quoteVersions.isLatest), desc(quoteVersions.createdAt));

    // Get positions for each version
    const versionsWithPositions = await Promise.all(
      versions.map(async (version) => {
        const positions = await getQuotePositionsByVersion(version.id);
        
        const [positionsCountResult] = await db
          .select({ count: count(quotePositions.id) })
          .from(quotePositions)
          .where(eq(quotePositions.versionId, version.id));

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
      .where(eq(quotePositions.versionId, versionId))
      .orderBy(asc(quotePositions.positionNumber));

    // Get article and block details for each position
    const positionsWithDetails = await Promise.all(
      positions.map(async (position) => {
        let article = null;
        let block = null;

        if (position.articleId) {
          const [articleResult] = await db
            .select()
            .from(articles)
            .where(eq(articles.id, position.articleId));
          article = articleResult || null;
        }

        if (position.blockId) {
          const [blockResult] = await db
            .select()
            .from(blocks)
            .where(eq(blocks.id, position.blockId));
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

// Delete a quote and all related data
export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    // Check if quote is editable by current user
    await checkQuoteEditable(quoteId);

    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // The cascade delete will handle variants, versions, and positions
    await db
      .delete(quotes)
      .where(eq(quotes.id, quoteId));

    // TODO: Add audit trail when audit operations are implemented for quotes
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
      .values(positionData)
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
      .orderBy(desc(quotes.createdAt));

    // Get variants counts for each quote
    const quotesWithDetails = await Promise.all(
      quotesData.map(async (quote) => {
        const [variantsCountResult] = await db
          .select({ count: count(quoteVariants.id) })
          .from(quoteVariants)
          .where(eq(quoteVariants.quoteId, quote.id));

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

    // Copy the article or block and create position data
    let positionData;
    
    if (articleId) {
      const copiedArticle = await copyArticle(articleId);
      positionData = {
        versionId,
        articleId: copiedArticle.id,
        blockId: null,
        originalArticleId: articleId,
        originalBlockId: null,
        positionNumber: nextPositionNumber,
        quantity: '1',
        unitPrice: copiedArticle.price,
        totalPrice: copiedArticle.price,
        articleCost: null,
        description: null,
      };
    } else if (blockId) {
      const copiedBlock = await copyBlock(blockId);
      positionData = {
        versionId,
        articleId: null,
        blockId: copiedBlock.id,
        originalArticleId: null,
        originalBlockId: blockId,
        positionNumber: nextPositionNumber,
        quantity: '1',
        unitPrice: null,
        totalPrice: null,
        articleCost: null,
        description: null,
      };
    } else {
      throw new Error('Either articleId or blockId must be provided');
    }

    const [newPosition] = await db
      .insert(quotePositions)
      .values(positionData)
      .returning();

    // TODO: Add audit trail when audit operations are implemented for quote positions

    return newPosition;
  } catch (error) {
    console.error('Error adding position:', error);
    throw new Error('Failed to add position');
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
    });

    // TODO: Copy variants, versions, and positions in a transaction
    // This would be complex and should be implemented when needed

    return newQuote;
  } catch (error) {
    console.error('Error copying quote:', error);
    throw new Error('Failed to copy quote');
  }
} 