import { NextResponse } from "next/server"
import { getOfferVersions, createOfferVersion } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const offerId = Number.parseInt(params.id)
    const versions = await getOfferVersions(offerId)
    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching offer versions:", error)
    return NextResponse.json({ error: "Failed to fetch offer versions" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const offerId = Number.parseInt(params.id)
    const data = await request.json()

    // Add the offer ID to the data
    const versionData = {
      ...data,
      offerId,
    }

    const newVersion = await createOfferVersion(versionData)
    return NextResponse.json(newVersion)
  } catch (error) {
    console.error("Error creating offer version:", error)
    return NextResponse.json({ error: "Failed to create offer version" }, { status: 500 })
  }
}
