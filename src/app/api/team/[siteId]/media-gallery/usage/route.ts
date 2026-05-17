import { type NextRequest, NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { buildMediaUsageIndex } from "@/lib/media-gallery-usage"
import { createErrorResponse, requireSiteAccess } from "@/lib/security/route-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!siteId || !/^[0-9a-fA-F]{24}$/.test(siteId)) {
    return NextResponse.json({ error: "Invalid Site ID provided." }, { status: 400 })
  }

  try {
    await requireSiteAccess(siteId, session.user.id)

    const [articles, categories] = await Promise.all([
      db.article.findMany({
        where: { siteId },
        select: { id: true, title: true, cover: true },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({
        where: { siteId },
        select: { id: true, name: true, thumbnail: true },
        orderBy: { name: "asc" },
      }),
    ])

    const index = buildMediaUsageIndex(
      articles.map((a) => ({ id: a.id, title: a.title, cover: a.cover })),
      categories.map((c) => ({ id: c.id, name: c.name, thumbnail: c.thumbnail })),
    )

    return NextResponse.json(index)
  } catch (error) {
    return createErrorResponse(error)
  }
}
