// app/api/analytics/[siteId]/stats/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = await params
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
    console.error("Error fetching site analytics stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
