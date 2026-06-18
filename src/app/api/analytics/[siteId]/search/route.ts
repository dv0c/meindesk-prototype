import { NextRequest, NextResponse } from "next/server"
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
    const events = await fetchEventsForRange(siteId, range.from, range.to)

    const searchEvents = events.filter((e) => !e.isBot && e.eventType === "search")
    const queryCounts: Record<string, { count: number; noResults: number }> = {}

    for (const e of searchEvents) {
      const meta = (e.metadata as Record<string, unknown>) ?? {}
      const query = String(meta.query ?? meta.q ?? "").trim().toLowerCase()
      if (!query) continue
      if (!queryCounts[query]) queryCounts[query] = { count: 0, noResults: 0 }
      queryCounts[query].count++
      const results = Number(meta.resultsCount ?? meta.results ?? 1)
      if (results === 0) queryCounts[query].noResults++
    }

    const totalSearches = searchEvents.length
    const uniqueQueries = Object.keys(queryCounts).length
    const noResultSearches = Object.values(queryCounts).reduce((a, q) => a + q.noResults, 0)

    const topQueries = Object.entries(queryCounts)
      .map(([query, data]) => ({
        query,
        count: data.count,
        noResults: data.noResults,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)

    return NextResponse.json({
      totalSearches,
      uniqueQueries,
      noResultSearches,
      searchSuccessRate: totalSearches
        ? Math.round(((totalSearches - noResultSearches) / totalSearches) * 100)
        : 0,
      topQueries,
    })
  } catch (err) {
    return createErrorResponse(err)
  }
}
