import { NextResponse } from "next/server"
import type { PageData } from "@/lib/types"

// In-memory storage (placeholder for database)
const pages: Map<string, PageData> = new Map()

// Initialize with a sample page
if (!pages.has("sample-page")) {
  pages.set("sample-page", {
    id: "sample-page",
    name: "Sample Page",
    tenantId: "tenant_123",
    layout: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = pages.get(id)

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  }

  return NextResponse.json(page)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const existingPage = pages.get(id)

  if (!existingPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  }

  const updatedPage: PageData = {
    ...existingPage,
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }

  pages.set(id, updatedPage)
  return NextResponse.json(updatedPage)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!pages.has(id)) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  }

  pages.delete(id)
  return NextResponse.json({ success: true })
}
