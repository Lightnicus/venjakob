import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuoteWithDetails, 
  getLatestVariantForQuote, 
  getLatestVersionForVariant,
  getQuoteVariantById,
  getQuoteVersionById,
  getQuotePositionsByVersion
} from '@/lib/db/quotes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const { searchParams } = new URL(request.url);
    const requestedVariantId = searchParams.get('variantId');
    const requestedVersionId = searchParams.get('versionId');

    // Step 1: Resolve missing variantId and versionId
    let resolvedVariantId = requestedVariantId;
    let resolvedVersionId = requestedVersionId;

    // If no variantId and no versionId, fetch latest variant and its latest version
    if (!requestedVariantId && !requestedVersionId) {
      const latestVariant = await getLatestVariantForQuote(quoteId);
      if (latestVariant) {
        resolvedVariantId = latestVariant.id;
        const latestVersion = await getLatestVersionForVariant(latestVariant.id);
        if (latestVersion) {
          resolvedVersionId = latestVersion.id;
        }
      }
    }
    // If variantId is provided but no versionId, fetch latest version for that variant
    else if (requestedVariantId && !requestedVersionId) {
      const latestVersion = await getLatestVersionForVariant(requestedVariantId);
      if (latestVersion) {
        resolvedVersionId = latestVersion.id;
      }
    }

    // Step 2: Fetch all data in parallel
    const [quoteData, variantData, versionData, positionsData] = await Promise.all([
      getQuoteWithDetails(quoteId),
      resolvedVariantId ? getQuoteVariantById(resolvedVariantId) : null,
      resolvedVersionId ? getQuoteVersionById(resolvedVersionId) : null,
      resolvedVersionId ? getQuotePositionsByVersion(resolvedVersionId) : []
    ]);

    // Step 3: Build mapped offer properties data
    let offerPropsData = null;
    if (quoteData && variantData) {
      // Compute autoTotal from non-deleted article positions
      const autoTotal = (positionsData || [])
        .filter((p: any) => !p.deleted && p.articleId)
        .reduce((sum: number, p: any) => {
          const q = Number(p.quantity || 0);
          const u = Number(p.unitPrice || 0);
          return sum + q * u;
        }, 0);

      // Pricing fields from version (may be undefined for legacy versions)
      const v: any = versionData || {};
      const pricingShowUnitPrices = Boolean(v.pricingShowUnitPrices);
      const pricingCalcTotal = v.pricingCalcTotal !== undefined ? Boolean(v.pricingCalcTotal) : false;
      const pricingDiscountPercent = Boolean(v.pricingDiscountPercent);
      const pricingDiscountValue = Number(v.pricingDiscountValue || 0);
      const pricingDiscountAmount = Number(v.pricingDiscountAmount || 0);
      const total = Number(v.totalPrice || 0);
      // Staleness is based on base total delta; discount is user-level but impacts final shown price.
      // Server staleness remains tied to base total only; client augments for discount diffs.
      const calculationStale = pricingCalcTotal === true && total !== autoTotal;

      offerPropsData = {
        kunde: {
          id: quoteData.salesOpportunity?.client?.foreignId || '',
          name: quoteData.salesOpportunity?.client?.name || '',
          adresse: quoteData.salesOpportunity?.client?.address || '',
          telefon: quoteData.salesOpportunity?.client?.phone || '',
          casLink: quoteData.salesOpportunity?.client?.casLink || ''
        },
        empfaenger: {
          anrede: quoteData.salesOpportunity?.contactPerson?.salutation || '',
          name: quoteData.salesOpportunity?.contactPerson?.firstName || '',
          nachname: quoteData.salesOpportunity?.contactPerson?.name || '',
          telefon: quoteData.salesOpportunity?.contactPerson?.phone || '',
          email: quoteData.salesOpportunity?.contactPerson?.email || ''
        },
        preis: {
          showUnitPrices: pricingShowUnitPrices,
          calcTotal: pricingCalcTotal,
          total,
          discount: pricingDiscountAmount, // legacy prop retained for compatibility
          discountPercent: pricingDiscountPercent,
          discountValue: pricingDiscountValue,
          autoTotal,
          calculationStale
        },
        bemerkung: variantData.variantDescriptor || ''
      };
    }

    // Step 4: Return consolidated response
    return NextResponse.json({
      quote: quoteData,
      variant: variantData,
      version: versionData,
      positions: positionsData,
      offerPropsData,
      resolvedVariantId,
      resolvedVersionId
    });

  } catch (error) {
    console.error('Error in complete quote endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complete quote data' },
      { status: 500 }
    );
  }
} 