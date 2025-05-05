import { NextResponse } from "next/server"
import { compareVersions } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const version1Id = Number.parseInt(searchParams.get("v1") || "0")
    const version2Id = Number.parseInt(searchParams.get("v2") || "0")

    if (!version1Id || !version2Id) {
      return NextResponse.json({ error: "Both version IDs are required" }, { status: 400 })
    }

    const comparison = await compareVersions(version1Id, version2Id)
    return NextResponse.json(comparison)
  } catch (error) {
    console.error("Error comparing versions:", error)
    return NextResponse.json({ error: "Failed to compare versions" }, { status: 500 })
  }
}
