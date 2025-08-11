import { NextRequest, NextResponse } from 'next/server';
import { getQuoteVariantById, softDeleteQuoteVariant, copyQuoteVariant } from '@/lib/db/quotes';
import { db } from '@/lib/db';
import { quoteVariants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    
    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    const variant = await getQuoteVariantById(variantId);
    
    if (!variant) {
      return NextResponse.json({ error: 'Variante nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Variante' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    
    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    await softDeleteQuoteVariant(variantId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Variante' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    
    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }

    const copiedVariant = await copyQuoteVariant(variantId);
    
    return NextResponse.json(copiedVariant);
  } catch (error) {
    console.error('Error copying variant:', error);
    return NextResponse.json(
      { error: 'Fehler beim Kopieren der Variante' },
      { status: 500 }
    );
  }
} 

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const { variantId } = await params;
    const body = await request.json();
    const { variantDescriptor } = body || {};

    if (!variantId) {
      return NextResponse.json({ error: 'Varianten-ID ist erforderlich' }, { status: 400 });
    }
    if (typeof variantDescriptor !== 'string') {
      return NextResponse.json({ error: 'variantDescriptor ist erforderlich' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht authentifiziert' }, { status: 401 });
    }

    await db
      .update(quoteVariants)
      .set({ variantDescriptor, updatedAt: sql`NOW()`, modifiedBy: user.dbUser.id })
      .where(eq(quoteVariants.id, variantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating variant descriptor:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Variante' },
      { status: 500 }
    );
  }
}