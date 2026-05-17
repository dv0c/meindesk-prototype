import { NextRequest, NextResponse } from "next/server"
import { fetchCollectionItemsBySlug } from "@/lib/api/fetch-collection-items"

export const runtime = "nodejs"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; slug: string }> },
) {
  const { tenantId, slug } = await params
  const { searchParams } = new URL(req.url)

  const limitParam = searchParams.get("limit")
  const limit = limitParam ? parseInt(limitParam, 10) : 50
  const status = searchParams.get("status") || "PUBLISHED"
  const orderBy = searchParams.get("orderBy") || "createdAt"
  const orderDir = (searchParams.get("orderDir") || "desc") as "asc" | "desc"

  try {
    const result = await fetchCollectionItemsBySlug(tenantId, slug, {
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50,
      status,
      orderBy,
      orderDir,
    })

    if (!result) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({
      collection: {
        id: result.collection.id,
        name: result.collection.name,
        slug: result.collection.slug,
        fields: result.collection.fields,
      },
      items: result.items,
      total: result.total,
    })
  } catch (error) {
    console.error("Error fetching collection items by slug:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
