import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename
    const uniqueId = uuidv4()
    const fileExtension = file.name.split(".").pop()
    const fileName = `avatar-${uniqueId}.${fileExtension}`

    // Save to public directory so it's accessible via URL
    const dir = join(process.cwd(), "public/uploads")

    // Ensure directory exists using fs/promises and existsSync
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    const path = join(dir, fileName)
    await writeFile(path, buffer)

    // Return the path that can be used to access the file
    return NextResponse.json({
      success: true,
      filePath: `/uploads/${fileName}`,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
