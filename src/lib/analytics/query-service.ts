import { db } from "@/lib/db"
import { format, startOfDay } from "date-fns"
import type { AnalyticsFilterState, AnalyticsQueryResult } from "./types"
import {
  aggregateEvents,
  toLegacyCardMetrics,
  type AnalyticsEventRow,
  type RollupSlice,
} from "./aggregate"
import { resolveDateRange, resolveComparisonRange, shouldUseRollups } from "./date-ranges"
import { CHART_COLORS as COLORS } from "./types"
import { sourceLabel } from "./classify-source"

function hasDimensionFilters(filters: AnalyticsFilterState): boolean {
  return !!(
    filters.device ||
    filters.source ||
    filters.country ||
    filters.browser ||
    filters.os ||
    filters.contentType ||
    filters.userType
  )
}

type DailyRollupRow = {
  date: Date
  views: number
  uniqueVisitors: number
  sessions: number
  bounces: number
  avgDurationSec: number
  byDevice: unknown
  bySource: unknown
  byCountry: unknown
  byPath: unknown
  byArticleSlug: unknown
}

function mergeSlices(target: RollupSlice, slice: unknown) {
  if (!slice || typeof slice !== "object") return
  for (const [key, count] of Object.entries(slice as RollupSlice)) {
    target[key] = (target[key] || 0) + (count || 0)
  }
}

function buildComparison(current: number, previous: number) {
  const absolute = current - previous
  const percent = previous ? (absolute / previous) * 100 : current ? 100 : 0
  return {
    value: current,
    previous,
    absolute,
    percent,
    trend: absolute > 0 ? ("up" as const) : absolute < 0 ? ("down" as const) : ("flat" as const),
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function aggregateFromRollups(
  rollups: DailyRollupRow[],
  todayEvents: AnalyticsEventRow[],
  prevRollups: DailyRollupRow[],
  prevTodayEvents: AnalyticsEventRow[],
  filters: AnalyticsFilterState,
  _returningVisitorIds: Set<string>
): AnalyticsQueryResult {
  const todayAgg =
    todayEvents.length > 0
      ? aggregateEvents(todayEvents, prevTodayEvents, filters, _returningVisitorIds)
      : null

  const viewsOverTime = rollups.map((r) => ({
    date: format(r.date, "MMM d"),
    views: r.views,
    visitors: r.uniqueVisitors,
    sessions: r.sessions,
  }))

  if (todayAgg?.viewsOverTime.length) {
    viewsOverTime.push(...todayAgg.viewsOverTime)
  }

  const byPath: RollupSlice = {}
  const byDevice: RollupSlice = {}
  const bySource: RollupSlice = {}
  const byCountry: RollupSlice = {}

  let totalViews = 0
  let totalSessions = 0
  let totalBounces = 0
  let durationSum = 0

  for (const r of rollups) {
    totalViews += r.views
    totalSessions += r.sessions
    totalBounces += r.bounces
    durationSum += r.avgDurationSec * r.sessions
    mergeSlices(byPath, r.byPath)
    mergeSlices(byDevice, r.byDevice)
    mergeSlices(bySource, r.bySource)
    mergeSlices(byCountry, r.byCountry)
  }

  if (todayAgg) {
    totalViews += todayAgg.cardMetrics.totalViews.value
    totalSessions += todayAgg.cardMetrics.sessions.value
    totalBounces += Math.round(
      (todayAgg.cardMetrics.bounceRate.value / 100) * todayAgg.cardMetrics.sessions.value
    )
    durationSum += todayAgg.cardMetrics.avgSessionDuration.seconds * todayAgg.cardMetrics.sessions.value
    for (const p of todayAgg.topPages) byPath[p.page] = (byPath[p.page] || 0) + p.views
    for (const d of todayAgg.devices) byDevice[d.device] = (byDevice[d.device] || 0) + d.count
    for (const r of todayAgg.regions) byCountry[r.region] = (byCountry[r.region] || 0) + r.count
  }

  const topPages = Object.entries(byPath)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const displaySources: Record<string, number> = {}
  for (const [source, value] of Object.entries(bySource)) {
    const label = sourceLabel(source as Parameters<typeof sourceLabel>[0])
    displaySources[label] = (displaySources[label] || 0) + value
  }
  if (todayAgg) {
    for (const s of todayAgg.trafficSources) {
      displaySources[s.source] = (displaySources[s.source] || 0) + s.value
    }
  }

  const trafficSources = Object.entries(displaySources)
    .map(([source, value], i) => ({
      source,
      value,
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  const regions = Object.entries(byCountry)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const devices = Object.entries(byDevice)
    .map(([device, count], i) => ({ device, count, color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.count - a.count)

  let prevTotalViews = 0
  let prevSessions = 0
  let prevBounces = 0
  let prevDurationSum = 0
  for (const r of prevRollups) {
    prevTotalViews += r.views
    prevSessions += r.sessions
    prevBounces += r.bounces
    prevDurationSum += r.avgDurationSec * r.sessions
  }
  if (todayAgg) {
    prevTotalViews += todayAgg.cardMetrics.totalViews.previous
    prevSessions += todayAgg.cardMetrics.sessions.previous
  }

  const uniqueVisitors =
    rollups.reduce((sum, r) => sum + r.uniqueVisitors, 0) +
    (todayAgg?.cardMetrics.uniqueVisitors.value ?? 0)
  const prevUniqueVisitors =
    prevRollups.reduce((sum, r) => sum + r.uniqueVisitors, 0) +
    (todayAgg?.cardMetrics.uniqueVisitors.previous ?? 0)

  const bounceRate = totalSessions ? (totalBounces / totalSessions) * 100 : 0
  const prevBounceRate = prevSessions ? (prevBounces / prevSessions) * 100 : 0
  const avgDurationSec = totalSessions ? durationSum / totalSessions : 0
  const prevAvgDurationSec = prevSessions ? prevDurationSum / prevSessions : 0
  const pagesPerSession = totalSessions ? totalViews / totalSessions : 0
  const prevPagesPerSession = prevSessions ? prevTotalViews / prevSessions : 0

  const returningCount = todayAgg?.cardMetrics.returningVisitors.value ?? 0
  const newCount = todayAgg?.cardMetrics.newVisitors.value ?? uniqueVisitors

  return {
    viewsOverTime,
    topPages,
    trafficSources,
    regions,
    devices,
    cardMetrics: {
      totalViews: buildComparison(totalViews, prevTotalViews),
      uniqueVisitors: buildComparison(uniqueVisitors, prevUniqueVisitors),
      sessions: buildComparison(totalSessions, prevSessions),
      bounceRate: buildComparison(Math.round(bounceRate * 10) / 10, Math.round(prevBounceRate * 10) / 10),
      avgSessionDuration: {
        value: formatDuration(avgDurationSec),
        seconds: avgDurationSec,
        comparison: buildComparison(Math.round(avgDurationSec), Math.round(prevAvgDurationSec)),
      },
      pagesPerSession: buildComparison(
        Math.round(pagesPerSession * 10) / 10,
        Math.round(prevPagesPerSession * 10) / 10
      ),
      newVisitors: buildComparison(newCount, todayAgg?.cardMetrics.newVisitors.previous ?? 0),
      returningVisitors: buildComparison(returningCount, 0),
    },
  }
}

function rollupsAvailable(): boolean {
  return typeof db.analyticsDailyRollup?.findMany === "function"
}

async function fetchRollupsForRange(
  siteId: string,
  from: Date,
  to: Date
): Promise<DailyRollupRow[]> {
  if (!rollupsAvailable()) return []
  return db.analyticsDailyRollup.findMany({
    where: {
      siteId,
      date: { gte: startOfDay(from), lte: startOfDay(to) },
    },
    orderBy: { date: "asc" },
  })
}

export async function fetchReturningVisitorIds(
  siteId: string,
  visitorKeys: string[],
  before: Date
): Promise<Set<string>> {
  if (!visitorKeys.length) return new Set()

  const prior = await db.analyticsEvent.findMany({
    where: {
      siteId,
      isBot: false,
      createdAt: { lt: before },
      OR: [
        { visitorId: { in: visitorKeys.filter((k) => k.startsWith("v_")) } },
        { ipAddress: { in: visitorKeys } },
      ],
    },
    select: { visitorId: true, ipAddress: true },
    distinct: ["visitorId", "ipAddress"],
    take: 5000,
  })

  const set = new Set<string>()
  for (const row of prior) {
    if (row.visitorId) set.add(row.visitorId)
    if (row.ipAddress) set.add(row.ipAddress)
  }
  return set
}

export async function fetchEventsForRange(
  siteId: string,
  from: Date,
  to: Date
): Promise<AnalyticsEventRow[]> {
  return db.analyticsEvent.findMany({
    where: {
      siteId,
      createdAt: { gte: from, lte: to },
    },
  }) as Promise<AnalyticsEventRow[]>
}

export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): AnalyticsFilterState {
  return {
    preset: searchParams.get("preset") ?? searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    compareMode: (searchParams.get("compareMode") as AnalyticsFilterState["compareMode"]) ?? "previous_period",
    compareFrom: searchParams.get("compareFrom") ?? undefined,
    compareTo: searchParams.get("compareTo") ?? undefined,
    device: searchParams.get("device") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    browser: searchParams.get("browser") ?? undefined,
    os: searchParams.get("os") ?? undefined,
    contentType: searchParams.get("contentType") ?? undefined,
    userType: (searchParams.get("userType") as "new" | "returning") ?? undefined,
  }
}

export async function runAnalyticsQuery(siteId: string, filters: AnalyticsFilterState) {
  const range = resolveDateRange(filters.preset, filters.from, filters.to)
  const comparison = resolveComparisonRange(
    filters.compareMode ?? "previous_period",
    range,
    filters.compareFrom,
    filters.compareTo
  )

  const todayStart = startOfDay(new Date())
  const useRollups =
    rollupsAvailable() &&
    shouldUseRollups(range.from, range.to) &&
    !hasDimensionFilters(filters)

  if (useRollups) {
    const rollupTo = range.to < todayStart ? range.to : new Date(todayStart.getTime() - 1)
    const [rollups, prevRollups] = await Promise.all([
      rollupTo >= range.from
        ? fetchRollupsForRange(siteId, range.from, rollupTo)
        : Promise.resolve([] as DailyRollupRow[]),
      comparison
        ? fetchRollupsForRange(siteId, comparison.from, comparison.to)
        : Promise.resolve([] as DailyRollupRow[]),
    ])

    const todayFrom = range.to >= todayStart ? todayStart : null
    const [todayEvents, prevTodayEvents] = await Promise.all([
      todayFrom
        ? fetchEventsForRange(siteId, todayFrom, range.to)
        : Promise.resolve([] as AnalyticsEventRow[]),
      comparison && comparison.to >= todayStart
        ? fetchEventsForRange(siteId, todayStart, comparison.to)
        : Promise.resolve([] as AnalyticsEventRow[]),
    ])

    const visitorKeys = [
      ...new Set(
        todayEvents
          .filter((e) => !e.isBot)
          .map((e) => e.visitorId || e.ipAddress || "unknown")
          .filter((k) => k !== "unknown")
      ),
    ]
    const returningIds = await fetchReturningVisitorIds(siteId, visitorKeys, range.from)
    const result = aggregateFromRollups(
      rollups,
      todayEvents,
      prevRollups,
      prevTodayEvents,
      filters,
      returningIds
    )

    return {
      range,
      comparison,
      result,
      legacy: toLegacyCardMetrics(result),
      source: "rollup" as const,
    }
  }

  const [events, prevEvents] = await Promise.all([
    fetchEventsForRange(siteId, range.from, range.to),
    comparison
      ? fetchEventsForRange(siteId, comparison.from, comparison.to)
      : Promise.resolve([] as AnalyticsEventRow[]),
  ])

  const visitorKeys = [
    ...new Set(
      events
        .filter((e) => !e.isBot)
        .map((e) => e.visitorId || e.ipAddress || "unknown")
        .filter((k) => k !== "unknown")
    ),
  ]

  const returningIds = await fetchReturningVisitorIds(siteId, visitorKeys, range.from)
  const result = aggregateEvents(events, prevEvents, filters, returningIds)

  return {
    range,
    comparison,
    result,
    legacy: toLegacyCardMetrics(result),
    source: "events" as const,
  }
}
