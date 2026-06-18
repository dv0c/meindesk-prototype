import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import { parseFiltersFromSearchParams, fetchEventsForRange } from "@/lib/analytics/query-service"
import { resolveDateRange } from "@/lib/analytics"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const filters = parseFiltersFromSearchParams(req.nextUrl.searchParams)
    const range = resolveDateRange(filters.preset, filters.from, filters.to)
    const contentType = req.nextUrl.searchParams.get("type") ?? undefined

    const events = await fetchEventsForRange(siteId, range.from, range.to)
    const pageViews = events.filter(
      (e) => !e.isBot && (e.eventType === "page_view" || !e.eventType)
    )

    const byContent: Record<
      string,
      {
        contentId: string
        contentType: string
        views: number
        uniqueViews: Set<string>
        paths: Set<string>
      }
    > = {}

    for (const e of pageViews) {
      const id = e.contentId || e.articleSlug || e.path
      const type = e.contentType || (e.articleSlug ? "article" : "page")
      if (contentType && type !== contentType) continue

      const key = `${type}:${id}`
      if (!byContent[key]) {
        byContent[key] = {
          contentId: id,
          contentType: type,
          views: 0,
          uniqueViews: new Set(),
          paths: new Set(),
        }
      }
      byContent[key].views++
      byContent[key].uniqueViews.add(e.visitorId || e.ipAddress || "unknown")
      byContent[key].paths.add(e.path)
    }

    const articles = await db.article.findMany({
      where: { siteId },
      select: { id: true, title: true, slug: true, views: true, uniqueViews: true },
    })
    const articleMap = Object.fromEntries(articles.map((a) => [a.slug, a]))

    const items = Object.values(byContent)
      .map((row) => ({
        contentId: row.contentId,
        contentType: row.contentType,
        title: articleMap[row.contentId]?.title ?? row.contentId,
        views: row.views,
        uniqueViews: row.uniqueViews.size,
        storedViews: articleMap[row.contentId]?.views,
        paths: [...row.paths].slice(0, 3),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 50)

    return NextResponse.json({ items, range: { from: range.from, to: range.to } })
  } catch (err) {
    return createErrorResponse(err)
  }
}
