/**
 * Backfill daily analytics rollups for the last N days.
 * Usage: npx tsx scripts/backfill-analytics-rollups.ts [days]
 */
import { PrismaClient } from "@prisma/client"
import { startOfDay, subDays } from "date-fns"
import { aggregateDayForSite, type AnalyticsEventRow } from "../src/lib/analytics/aggregate"

const db = new PrismaClient()

async function main() {
  const days = Number(process.argv[2] ?? 30)
  const sites = await db.site.findMany({ select: { id: true } })

  for (let i = 1; i <= days; i++) {
    const day = startOfDay(subDays(new Date(), i))
    const dayEnd = new Date(day.getTime() + 86400000 - 1)

    for (const site of sites) {
      const events = (await db.analyticsEvent.findMany({
        where: { siteId: site.id, createdAt: { gte: day, lte: dayEnd } },
      })) as AnalyticsEventRow[]

      if (!events.length) continue

      const rollup = await aggregateDayForSite(site.id, day, events)
      await db.analyticsDailyRollup.upsert({
        where: { siteId_date: { siteId: site.id, date: day } },
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
    }
    console.log(`Backfilled ${day.toISOString().slice(0, 10)}`)
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
