import { NextRequest, NextResponse } from "next/server"
import { format, startOfWeek, startOfMonth, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import { db } from "@/lib/db"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import { resolveDateRange } from "@/lib/analytics"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const granularity = req.nextUrl.searchParams.get("granularity") ?? "weekly"

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const preset = req.nextUrl.searchParams.get("preset") ?? "last90Days"
    const range = resolveDateRange(preset)

    const sessions = await db.analyticsSession.findMany({
      where: {
        siteId,
        isBot: false,
        startedAt: { gte: range.from, lte: range.to },
      },
      select: { visitorId: true, startedAt: true },
      orderBy: { startedAt: "asc" },
    })

    const firstSeen: Record<string, Date> = {}
    for (const s of sessions) {
      if (!firstSeen[s.visitorId] || s.startedAt < firstSeen[s.visitorId]) {
        firstSeen[s.visitorId] = s.startedAt
      }
    }

    const buckets =
      granularity === "monthly"
        ? eachMonthOfInterval({ start: range.from, end: range.to })
        : eachWeekOfInterval({ start: range.from, end: range.to }, { weekStartsOn: 1 })

    const cohorts = buckets.slice(0, 8).map((bucketStart) => {
      const bucketEnd =
        granularity === "monthly"
          ? startOfMonth(new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 1))
          : startOfWeek(new Date(bucketStart.getTime() + 7 * 86400000), { weekStartsOn: 1 })

      const cohortVisitors = Object.entries(firstSeen)
        .filter(([, d]) => d >= bucketStart && d < bucketEnd)
        .map(([vid]) => vid)

      const retention: number[] = []
      for (let period = 0; period < 6; period++) {
        const periodStart = new Date(bucketStart.getTime() + period * (granularity === "monthly" ? 30 : 7) * 86400000)
        const periodEnd = new Date(periodStart.getTime() + (granularity === "monthly" ? 30 : 7) * 86400000)
        const active = sessions.filter(
          (s) =>
            cohortVisitors.includes(s.visitorId) &&
            s.startedAt >= periodStart &&
            s.startedAt < periodEnd
        )
        const uniqueActive = new Set(active.map((s) => s.visitorId)).size
        retention.push(
          cohortVisitors.length
            ? Math.round((uniqueActive / cohortVisitors.length) * 100)
            : 0
        )
      }

      return {
        label: format(bucketStart, granularity === "monthly" ? "MMM yyyy" : "MMM d"),
        size: cohortVisitors.length,
        retention,
      }
    })

    return NextResponse.json({ granularity, cohorts })
  } catch (err) {
    return createErrorResponse(err)
  }
}
