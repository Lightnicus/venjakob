import { db } from "@/db/db"
import { offers, offerVersions, positions, blocks, offerBlocks } from "@/db/schema"
import { eq } from "drizzle-orm"

// Offer service functions
export async function getOffers() {
  return db.query.offers.findMany({
    with: {
      customer: true,
      currentVersion: true,
    },
    orderBy: (offers, { desc }) => [desc(offers.updatedAt)],
  })
}

export async function getOfferById(id: number) {
  return db.query.offers.findFirst({
    where: eq(offers.id, id),
    with: {
      customer: true,
      currentVersion: true,
      versions: {
        orderBy: (versions, { desc }) => [desc(versions.createdAt)],
      },
    },
  })
}

export async function getOfferVersions(offerId: number) {
  return db.query.offerVersions.findMany({
    where: eq(offerVersions.offerId, offerId),
    orderBy: (versions, { desc }) => [desc(versions.createdAt)],
    with: {
      publishedBy: true,
    },
  })
}

export async function getOfferVersionById(id: number) {
  return db.query.offerVersions.findFirst({
    where: eq(offerVersions.id, id),
    with: {
      publishedBy: true,
      offerBlocks: {
        with: {
          block: true,
        },
        orderBy: (offerBlocks, { asc }) => [asc(offerBlocks.position)],
      },
      positions: {
        orderBy: (positions, { asc }) => [asc(positions.position)],
      },
    },
  })
}

export async function createOfferVersion(data: any) {
  // Start a transaction
  return db.transaction(async (tx) => {
    // 1. Create the new version
    const [newVersion] = await tx
      .insert(offerVersions)
      .values({
        offerId: data.offerId,
        versionNumber: data.versionNumber,
        title: data.title,
        description: data.description,
        status: data.status,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        recipientPhone: data.recipientPhone,
        changeTitle: data.changeTitle,
        changeDescription: data.changeDescription,
        publishedById: data.publishedById,
        publishedAt: new Date(),
      })
      .returning()

    // 2. Copy blocks from previous version or create new ones
    if (data.copyFromVersionId) {
      const previousBlocks = await tx.query.offerBlocks.findMany({
        where: eq(offerBlocks.offerVersionId, data.copyFromVersionId),
      })

      for (const block of previousBlocks) {
        await tx.insert(offerBlocks).values({
          offerVersionId: newVersion.id,
          blockId: block.blockId,
          position: block.position,
        })
      }
    } else {
      // Add default blocks
      const defaultBlocks = await tx.query.blocks.findMany({
        where: eq(blocks.isStandard, true),
        orderBy: (blocks, { asc }) => [asc(blocks.position)],
      })

      for (const block of defaultBlocks) {
        await tx.insert(offerBlocks).values({
          offerVersionId: newVersion.id,
          blockId: block.id,
          position: block.position || 999,
        })
      }
    }

    // 3. Copy positions from previous version or create empty
    if (data.copyFromVersionId && data.copyPositions) {
      const previousPositions = await tx.query.positions.findMany({
        where: eq(positions.offerVersionId, data.copyFromVersionId),
      })

      for (const position of previousPositions) {
        await tx.insert(positions).values({
          offerVersionId: newVersion.id,
          blockId: position.blockId,
          articleId: position.articleId,
          name: position.name,
          quantity: position.quantity,
          unit: position.unit,
          unitPrice: position.unitPrice,
          discount: position.discount,
          totalPrice: position.totalPrice,
          isOption: position.isOption,
          position: position.position,
        })
      }
    }

    // 4. Update the offer's current version if this is a published version
    if (data.status === "Veröffentlicht") {
      await tx
        .update(offers)
        .set({
          currentVersionId: newVersion.id,
          updatedAt: new Date(),
        })
        .where(eq(offers.id, data.offerId))
    }

    return newVersion
  })
}

export async function compareVersions(version1Id: number, version2Id: number) {
  const version1 = await getOfferVersionById(version1Id)
  const version2 = await getOfferVersionById(version2Id)

  if (!version1 || !version2) {
    throw new Error("One or both versions not found")
  }

  // Compare basic information
  const basicComparison = {
    title: {
      version1: version1.title,
      version2: version2.title,
      changed: version1.title !== version2.title,
    },
    description: {
      version1: version1.description,
      version2: version2.description,
      changed: version1.description !== version2.description,
    },
    status: {
      version1: version1.status,
      version2: version2.status,
      changed: version1.status !== version2.status,
    },
  }

  // Compare positions
  const allPositionNames = new Set([...version1.positions.map((p) => p.name), ...version2.positions.map((p) => p.name)])

  const positionsComparison = Array.from(allPositionNames).map((name) => {
    const pos1 = version1.positions.find((p) => p.name === name)
    const pos2 = version2.positions.find((p) => p.name === name)

    return {
      name,
      version1: pos1 || null,
      version2: pos2 || null,
      status: !pos1 ? "added" : !pos2 ? "removed" : "changed",
      changes:
        pos1 && pos2
          ? {
              quantity: pos1.quantity !== pos2.quantity,
              unitPrice: pos1.unitPrice !== pos2.unitPrice,
              discount: pos1.discount !== pos2.discount,
              totalPrice: pos1.totalPrice !== pos2.totalPrice,
            }
          : null,
    }
  })

  return {
    basicComparison,
    positionsComparison,
    version1,
    version2,
  }
}
