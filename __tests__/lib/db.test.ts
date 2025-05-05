import { getOffers, getOfferById, getOfferVersions, createOfferVersion } from "@/lib/db"
import { db } from "@/db/db"
import { vi } from "vitest"

// Mock the database
vi.mock("@/db/db", () => ({
  db: {
    query: {
      offers: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      offerVersions: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn((callback) =>
      callback({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 1 }]),
          }),
        }),
        query: {
          offerBlocks: {
            findMany: vi.fn().mockResolvedValue([]),
          },
          blocks: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({}),
          }),
        }),
      }),
    ),
  },
}))

describe("Database utility functions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("getOffers should fetch all offers with related data", async () => {
    const mockOffers = [{ id: 1, title: "Test Offer" }]
    db.query.offers.findMany.mockResolvedValue(mockOffers)

    const result = await getOffers()

    expect(db.query.offers.findMany).toHaveBeenCalledWith({
      with: {
        customer: true,
        currentVersion: true,
      },
      orderBy: expect.any(Function),
    })
    expect(result).toEqual(mockOffers)
  })

  test("getOfferById should fetch a single offer with related data", async () => {
    const mockOffer = { id: 1, title: "Test Offer" }
    db.query.offers.findFirst.mockResolvedValue(mockOffer)

    const result = await getOfferById(1)

    expect(db.query.offers.findFirst).toHaveBeenCalledWith({
      where: expect.any(Object),
      with: {
        customer: true,
        currentVersion: true,
        versions: {
          orderBy: expect.any(Function),
        },
      },
    })
    expect(result).toEqual(mockOffer)
  })

  test("getOfferVersions should fetch versions for a specific offer", async () => {
    const mockVersions = [{ id: 1, versionNumber: "V1" }]
    db.query.offerVersions.findMany.mockResolvedValue(mockVersions)

    const result = await getOfferVersions(1)

    expect(db.query.offerVersions.findMany).toHaveBeenCalledWith({
      where: expect.any(Object),
      orderBy: expect.any(Function),
      with: {
        publishedBy: true,
      },
    })
    expect(result).toEqual(mockVersions)
  })

  test("createOfferVersion should create a new version and related data", async () => {
    const versionData = {
      offerId: 1,
      versionNumber: "V2",
      title: "Updated Offer",
      description: "Updated description",
      status: "Veröffentlicht",
    }

    const result = await createOfferVersion(versionData)

    expect(db.transaction).toHaveBeenCalled()
    expect(result).toEqual({ id: 1 })
  })
})
