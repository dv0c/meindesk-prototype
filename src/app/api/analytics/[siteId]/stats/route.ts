// app/api/analytics/[siteId]/stats/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    if (!siteId) return NextResponse.json({ error: "Missing siteId" }, { status: 400 })

    const url = new URL(req.url)
    const recentCount = parseInt(url.searchParams.get("recentCount") || "5") // default 5

    const now = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(now.getMonth() - 1)

    const [
      totalArticles,
      newArticles,
      totalCategories,
      newCategories,
      totalAnalyticsEvents,
      newAnalyticsEvents,
      recentArticles,
      recentCategories
    ] = await Promise.all([
      db.article.count({ where: { siteId } }),
      db.article.count({ where: { siteId, createdAt: { gte: lastMonth } } }),
      db.category.count({ where: { siteId } }),
      db.category.count({ where: { siteId, createdAt: { gte: lastMonth } } }),
      db.analyticsEvent.count({ where: { siteId } }),
      db.analyticsEvent.count({ where: { siteId, createdAt: { gte: lastMonth } } }),
      db.article.findMany({
        where: { siteId },
        orderBy: { createdAt: "desc" },
        take: recentCount,
        select: { id: true, title: true, slug: true, createdAt: true }
      }),
      db.category.findMany({
        where: { siteId },
        orderBy: { createdAt: "desc" },
        take: recentCount,
        select: { id: true, name: true, slug: true, createdAt: true }
      }),
    ])

    return NextResponse.json({
      siteId,
      totals: { articles: totalArticles, categories: totalCategories, analyticsEvents: totalAnalyticsEvents },
      newFromLastMonth: { articles: newArticles, categories: newCategories, analyticsEvents: newAnalyticsEvents },
      recent: { articles: recentArticles, categories: recentCategories },
      period: { from: lastMonth.toISOString(), to: now.toISOString() }
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
