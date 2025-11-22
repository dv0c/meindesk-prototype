import { NextResponse } from "next/server"
import type { PageData } from "@/lib/types"

// In-memory storage (placeholder for database)
const pages: Map<string, PageData> = new Map()

// Initialize with a sample page
pages.set("sample-page", {
  id: "sample-page",
  name: "Sample Page",
  tenantId: "tenant_123",
  layout: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenant = searchParams.get("tenant") || "tenant_123"

  // Filter pages by tenant
  const tenantPages = Array.from(pages.values()).filter((page) => page.tenantId === tenant)

  return NextResponse.json(tenantPages)
}

export async function POST(request: Request) {
  const body = await request.json()
  const page: PageData = {
    id: body.id || `page-${Date.now()}`,
    name: body.name || "Untitled Page",
    tenantId: body.tenantId || "tenant_123",
    layout: body.layout || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  pages.set(page.id, page)
  return NextResponse.json(page)
}
