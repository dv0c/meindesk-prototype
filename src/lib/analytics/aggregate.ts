import { format, startOfDay } from "date-fns"
import type { Prisma } from "@prisma/client"
import { parseUserAgent } from "./parse-user-agent"
import { classifyTrafficSource, sourceLabel } from "./classify-source"
import type { AnalyticsFilterState, AnalyticsQueryResult, ComparisonMetric } from "./types"
import { CHART_COLORS as COLORS } from "./types"

export type AnalyticsEventRow = {
  id: string
  siteId: string
  path: string
  referrer: string | null
  userAgent: string | null
  region: string | null
  device: string | null
  browser: string | null
  os: string | null
  ipAddress: string | null
  country: string | null
  city: string | null
  articleSlug: string | null
  eventType: string
  visitorId: string | null
  sessionId: string | null
  source: string | null
  contentType: string | null
  contentId: string | null
  metadata: unknown
  isBot: boolean
  createdAt: Date
}

const SESSION_GAP_MS = 30 * 60 * 1000

function visitorKey(e: AnalyticsEventRow): string {
  return e.visitorId || e.ipAddress || "unknown"
}

function matchesFilters(e: AnalyticsEventRow, filters: AnalyticsFilterState): boolean {
  if (e.isBot) return false
  if (filters.device && e.device !== filters.device) return false
  if (filters.source && e.source !== filters.source) return false
  if (filters.country && e.country !== filters.country) return false
  if (filters.browser && e.browser !== filters.browser) return false
  if (filters.os && e.os !== filters.os) return false
  if (filters.contentType && e.contentType !== filters.contentType) return false
  return true
}

function buildComparison(current: number, previous: number): ComparisonMetric {
  const absolute = current - previous
  const percent = previous ? (absolute / previous) * 100 : current ? 100 : 0
  return {
    value: current,
    previous,
    absolute,
    percent,
    trend: absolute > 0 ? "up" : absolute < 0 ? "down" : "flat",
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function computeSessions(events: AnalyticsEventRow[]) {
  const byVisitor: Record<string, Date[]> = {}
  for (const e of events) {
    const k = visitorKey(e)
    if (!byVisitor[k]) byVisitor[k] = []
    byVisitor[k].push(e.createdAt)
  }

  let sessionCount = 0
  let bounceCount = 0
  const durations: number[] = []

  for (const times of Object.values(byVisitor)) {
    times.sort((a, b) => a.getTime() - b.getTime())
    let sessionStart = times[0].getTime()
    let pagesInSession = 1

    for (let i = 1; i < times.length; i++) {
      const diff = times[i].getTime() - times[i - 1].getTime()
      if (diff > SESSION_GAP_MS) {
        sessionCount++
        if (pagesInSession === 1) bounceCount++
        durations.push(times[i - 1].getTime() - sessionStart)
        sessionStart = times[i].getTime()
        pagesInSession = 1
      } else {
        pagesInSession++
      }
    }
    sessionCount++
    if (pagesInSession === 1) bounceCount++
    durations.push(times[times.length - 1].getTime() - sessionStart)
  }

  const avgDurationSec = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000
    : 0

  return { sessionCount, bounceCount, avgDurationSec }
}

export function aggregateEvents(
  events: AnalyticsEventRow[],
  prevEvents: AnalyticsEventRow[],
  filters: AnalyticsFilterState,
  returningVisitorIds: Set<string>
): AnalyticsQueryResult {
  const filtered = events.filter((e) => matchesFilters(e, filters))
  const prevFiltered = prevEvents.filter((e) => matchesFilters(e, filters))

  if (filters.userType === "new") {
    // keep only visitors not in returning set
  } else if (filters.userType === "returning") {
    // handled below via returningVisitorIds
  }

  const pageViews = filtered.filter((e) => e.eventType === "page_view" || !e.eventType)
  const prevPageViews = prevFiltered.filter((e) => e.eventType === "page_view" || !e.eventType)

  const dailyStats: Record<string, { views: number; visitors: Set<string>; sessions: Set<string> }> = {}
  for (const e of pageViews) {
    const day = format(e.createdAt, "MMM d")
    if (!dailyStats[day]) dailyStats[day] = { views: 0, visitors: new Set(), sessions: new Set() }
    dailyStats[day].views++
    dailyStats[day].visitors.add(visitorKey(e))
    if (e.sessionId) dailyStats[day].sessions.add(e.sessionId)
  }

  const viewsOverTime = Object.entries(dailyStats).map(([date, data]) => ({
    date,
    views: data.views,
    visitors: data.visitors.size,
    sessions: data.sessions.size || data.visitors.size,
  }))

  const pathCounts: Record<string, number> = {}
  for (const e of pageViews) pathCounts[e.path] = (pathCounts[e.path] || 0) + 1
  const topPages = Object.entries(pathCounts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  const sourceCounts: Record<string, number> = {}
  for (const e of pageViews) {
    const src = e.source || classifyTrafficSource(e.referrer, e.path, e.metadata as Record<string, unknown>)
    const label = sourceLabel(src as Parameters<typeof sourceLabel>[0])
    sourceCounts[label] = (sourceCounts[label] || 0) + 1
  }
  const trafficSources = Object.entries(sourceCounts).map(([source, value], i) => ({
    source,
    value,
    color: COLORS[i % COLORS.length],
  }))

  const regionCounts: Record<string, number> = {}
  const deviceCounts: Record<string, number> = {}
  for (const e of pageViews) {
    const region = e.region || e.country || "Unknown"
    regionCounts[region] = (regionCounts[region] || 0) + 1
    const device = e.device || parseUserAgent(e.userAgent).device
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  }

  const regions = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const devices = Object.entries(deviceCounts).map(([device, count], i) => ({
    device,
    count,
    color: COLORS[i % COLORS.length],
  }))

  const totalViews = pageViews.length
  const prevTotalViews = prevPageViews.length
  const uniqueSet = new Set(pageViews.map(visitorKey))
  const prevUniqueSet = new Set(prevPageViews.map(visitorKey))

  let filteredVisitors = uniqueSet
  if (filters.userType === "new") {
    filteredVisitors = new Set([...uniqueSet].filter((v) => !returningVisitorIds.has(v)))
  } else if (filters.userType === "returning") {
    filteredVisitors = new Set([...uniqueSet].filter((v) => returningVisitorIds.has(v)))
  }

  const uniqueVisitors = filteredVisitors.size
  const prevUniqueVisitors = prevUniqueSet.size

  const { sessionCount, bounceCount, avgDurationSec } = computeSessions(pageViews)
  const prevSessions = computeSessions(prevPageViews)

  const bounceRate = sessionCount ? (bounceCount / sessionCount) * 100 : 0
  const prevBounceRate = prevSessions.sessionCount
    ? (prevSessions.bounceCount / prevSessions.sessionCount) * 100
    : 0

  const pagesPerSession = sessionCount ? totalViews / sessionCount : 0
  const prevPagesPerSession = prevSessions.sessionCount
    ? prevTotalViews / prevSessions.sessionCount
    : 0

  const returningCount = [...uniqueSet].filter((v) => returningVisitorIds.has(v)).length
  const newCount = uniqueVisitors - (filters.userType === "returning" ? 0 : returningCount)

  return {
    viewsOverTime,
    topPages,
    trafficSources,
    regions,
    devices,
    cardMetrics: {
      totalViews: buildComparison(totalViews, prevTotalViews),
      uniqueVisitors: buildComparison(uniqueVisitors, prevUniqueVisitors),
      sessions: buildComparison(sessionCount, prevSessions.sessionCount),
      bounceRate: buildComparison(Math.round(bounceRate * 10) / 10, Math.round(prevBounceRate * 10) / 10),
      avgSessionDuration: {
        value: formatDuration(avgDurationSec),
        seconds: avgDurationSec,
        comparison: buildComparison(Math.round(avgDurationSec), Math.round(prevSessions.avgDurationSec)),
      },
      pagesPerSession: buildComparison(
        Math.round(pagesPerSession * 10) / 10,
        Math.round(prevPagesPerSession * 10) / 10
      ),
      newVisitors: buildComparison(newCount, prevUniqueVisitors - returningCount),
      returningVisitors: buildComparison(returningCount, 0),
    },
  }
}

export type RollupSlice = Record<string, number>

export function mergeRollupSlices(existing: unknown, key: string, increment = 1): RollupSlice {
  const base = (existing && typeof existing === "object" ? existing : {}) as RollupSlice
  return { ...base, [key]: (base[key] || 0) + increment }
}

export async function aggregateDayForSite(
  siteId: string,
  day: Date,
  events: AnalyticsEventRow[]
): Promise<Prisma.AnalyticsDailyRollupCreateInput> {
  const dayStart = startOfDay(day)
  const pageViews = events.filter((e) => !e.isBot && (e.eventType === "page_view" || !e.eventType))

  let byDevice: RollupSlice = {}
  let bySource: RollupSlice = {}
  let byCountry: RollupSlice = {}
  let byPath: RollupSlice = {}
  let byArticleSlug: RollupSlice = {}

  const visitors = new Set<string>()
  for (const e of pageViews) {
    visitors.add(visitorKey(e))
    const device = e.device || parseUserAgent(e.userAgent).device
    byDevice = mergeRollupSlices(byDevice, device)
    const src = e.source || "direct"
    bySource = mergeRollupSlices(bySource, src)
    const country = e.country || e.region || "Unknown"
    byCountry = mergeRollupSlices(byCountry, country)
    byPath = mergeRollupSlices(byPath, e.path)
    if (e.articleSlug) byArticleSlug = mergeRollupSlices(byArticleSlug, e.articleSlug)
  }

  const { sessionCount, bounceCount, avgDurationSec } = computeSessions(pageViews)

  // Cap path map to top 50
  const topPaths = Object.fromEntries(
    Object.entries(byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
  )

  return {
    Site: { connect: { id: siteId } },
    date: dayStart,
    views: pageViews.length,
    uniqueVisitors: visitors.size,
    sessions: sessionCount,
    bounces: bounceCount,
    avgDurationSec,
    byDevice,
    bySource,
    byCountry,
    byPath: topPaths,
    byArticleSlug,
  }
}

/** Legacy flat card metrics for backward-compatible API */
export function toLegacyCardMetrics(result: AnalyticsQueryResult) {
  const c = result.cardMetrics
  return {
    totalViews: c.totalViews.value,
    viewsChange: c.totalViews.percent,
    uniqueVisitors: c.uniqueVisitors.value,
    visitorsChange: c.uniqueVisitors.percent,
    pageViews: c.totalViews.value,
    pageViewsChange: c.totalViews.percent,
    avgSessionDuration: c.avgSessionDuration.value,
    durationChange: c.avgSessionDuration.comparison.percent,
    newVisitors: c.newVisitors.value,
    returningVisitors: c.returningVisitors.value,
    sessions: c.sessions.value,
    bounceRate: c.bounceRate.value,
    pagesPerSession: c.pagesPerSession.value,
  }
}
