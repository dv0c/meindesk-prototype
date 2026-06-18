import { NextRequest, NextResponse } from "next/server"
import { startOfDay, subDays } from "date-fns"
import { db } from "@/lib/db"
import { aggregateDayForSite, type AnalyticsEventRow } from "@/lib/analytics"
import { verifyInternalCronRequest } from "@/lib/security/internal-cron"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")

  if (
    !verifyInternalCronRequest(request) &&
    (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET)
  ) {
    return NextResponse.json({ error: "Not authorized" }, { status: 404 })
  }

  try {
    const day = startOfDay(subDays(new Date(), 1))
    const dayEnd = new Date(day.getTime() + 86400000 - 1)

    const sites = await db.site.findMany({ select: { id: true } })
    let processed = 0

    for (const site of sites) {
      const events = (await db.analyticsEvent.findMany({
        where: {
          siteId: site.id,
          createdAt: { gte: day, lte: dayEnd },
        },
      })) as AnalyticsEventRow[]

      if (!events.length) continue

      const rollup = await aggregateDayForSite(site.id, day, events)

      await db.analyticsDailyRollup.upsert({
        where: {
          siteId_date: { siteId: site.id, date: day },
        },
        create: rollup,
        update: {
          views: rollup.views as number,
          uniqueVisitors: rollup.uniqueVisitors as number,
          sessions: rollup.sessions as number,
          bounces: rollup.bounces as number,
          avgDurationSec: rollup.avgDurationSec as number,
          byDevice: rollup.byDevice,
          bySource: rollup.bySource,
          byCountry: rollup.byCountry,
          byPath: rollup.byPath,
          byArticleSlug: rollup.byArticleSlug,
        },
      })
      processed++
    }

    return NextResponse.json({ success: true, sitesProcessed: processed, day: day.toISOString() })
  } catch (err) {
    console.error("[ANALYTICS_ROLLUP]", err)
    return NextResponse.json({ error: "Rollup failed" }, { status: 500 })
  }
}
