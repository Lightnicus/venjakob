import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quoteVersions, quotePositions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/server';
import { checkResourceEditable, LOCK_CONFIGS } from '@/lib/db/lock-validation';

async function computeAutoTotal(versionId: string): Promise<number> {
  // sum of non-deleted article positions (articleId not null): quantity * unitPrice
  const rows = await db
    .select({
      quantity: quotePositions.quantity,
      unitPrice: quotePositions.unitPrice,
      articleId: quotePositions.articleId,
      deleted: quotePositions.deleted,
    })
    .from(quotePositions)
    .where(and(eq(quotePositions.versionId, versionId), eq(quotePositions.deleted, false)));

  const total = rows
    .filter((r: any) => r.articleId)
    .reduce((sum: number, r: any) => {
      const q = Number(r.quantity || 0);
      const u = Number(r.unitPrice || 0);
      return sum + q * u;
    }, 0);
  return total;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await params;
    if (!versionId) {
      return NextResponse.json({ error: 'Versions-ID ist erforderlich' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Validate lock on this version
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

    const body = await request.json();

    const showUnitPrices: boolean = Boolean(body.showUnitPrices);
    const calcTotal: boolean = Boolean(body.calcTotal);
    const discountPercent: boolean = Boolean(body.discountPercent);
    const discountValue: number = Number(body.discountValue || 0);
    const discountAmount: number = Number(body.discountAmount || 0);

    let totalPrice: number;
    let autoTotal: number = 0;
    if (calcTotal) {
      autoTotal = await computeAutoTotal(versionId);
      totalPrice = autoTotal;
    } else {
      totalPrice = Number(body.totalPrice || 0);
    }

    await db
      .update(quoteVersions)
      .set({
        pricingShowUnitPrices: showUnitPrices,
        pricingCalcTotal: calcTotal,
        pricingDiscountPercent: discountPercent,
        pricingDiscountValue: String(discountValue),
        pricingDiscountAmount: String(discountAmount),
        totalPrice: String(totalPrice),
        updatedAt: (await import('drizzle-orm')).sql`NOW()`,
        modifiedBy: user.dbUser.id,
      })
      .where(eq(quoteVersions.id, versionId));

    // When calc total, we just wrote auto value so it's not stale; otherwise, no auto recompute
    const calculationStale = calcTotal ? false : false;

    return NextResponse.json({
      showUnitPrices,
      calcTotal,
      discountPercent,
      discountValue,
      discountAmount,
      totalPrice,
      autoTotal,
      calculationStale,
    });
  } catch (error) {
    console.error('Error saving quote version pricing:', error);
    // Pass through lock errors consistently
    if (error instanceof Response) return error;
    return NextResponse.json({ error: 'Fehler beim Speichern der Preiskonfiguration' }, { status: 500 });
  }
}


