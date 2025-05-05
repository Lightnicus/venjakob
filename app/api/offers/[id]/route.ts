import { NextResponse } from "next/server"
import { getOfferById } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const offerId = Number.parseInt(params.id)
    const offer = await getOfferById(offerId)

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error("Error fetching offer:", error)
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 })
  }
}
