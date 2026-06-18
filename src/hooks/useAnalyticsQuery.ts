"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { AnalyticsFilterState, AnalyticsQueryResult } from "@/lib/analytics/types"

function buildQueryString(siteId: string, filters: AnalyticsFilterState): string {
  const params = new URLSearchParams()
  if (filters.preset) params.set("preset", filters.preset)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.compareMode) params.set("compareMode", filters.compareMode)
  if (filters.device) params.set("device", filters.device)
  if (filters.source) params.set("source", filters.source)
  if (filters.country) params.set("country", filters.country)
  if (filters.browser) params.set("browser", filters.browser)
  if (filters.os) params.set("os", filters.os)
  if (filters.contentType) params.set("contentType", filters.contentType)
  if (filters.userType) params.set("userType", filters.userType)
  return `/api/analytics/${siteId}/query?${params.toString()}`
}

export function useAnalyticsQuery(siteId: string, filters: AnalyticsFilterState) {
  const [data, setData] = useState<(AnalyticsQueryResult & { meta?: Record<string, string> }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  const queryKey = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => {
    if (!siteId) return

    let cancelled = false
    const parsedFilters = JSON.parse(queryKey) as AnalyticsFilterState

    const fetchData = async () => {
      try {
        if (!hasLoadedRef.current) setLoading(true)
        setError(null)
        const res = await fetch(buildQueryString(siteId, parsedFilters))
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          hasLoadedRef.current = true
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const t = setTimeout(fetchData, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [siteId, queryKey])

  return { data, loading, error }
}

/** Backward-compatible hook */
export function useAnalytics(siteId: string, range: string = "last30Days") {
  const filters = useMemo<AnalyticsFilterState>(
    () => ({ preset: range, compareMode: "previous_period" }),
    [range]
  )
  const { data, loading, error } = useAnalyticsQuery(siteId, filters)

  const legacy = data
    ? {
        viewsOverTime: data.viewsOverTime,
        topPages: data.topPages,
        trafficSources: data.trafficSources,
        regions: data.regions,
        devices: data.devices,
        cardMetrics: {
          totalViews: data.cardMetrics.totalViews.value,
          viewsChange: data.cardMetrics.totalViews.percent,
          uniqueVisitors: data.cardMetrics.uniqueVisitors.value,
          visitorsChange: data.cardMetrics.uniqueVisitors.percent,
          pageViews: data.cardMetrics.totalViews.value,
          pageViewsChange: data.cardMetrics.totalViews.percent,
          avgSessionDuration: data.cardMetrics.avgSessionDuration.value,
          durationChange: data.cardMetrics.avgSessionDuration.comparison.percent,
          newVisitors: data.cardMetrics.newVisitors.value,
          returningVisitors: data.cardMetrics.returningVisitors.value,
          sessions: data.cardMetrics.sessions.value,
          bounceRate: data.cardMetrics.bounceRate.value,
          pagesPerSession: data.cardMetrics.pagesPerSession.value,
        },
      }
    : null

  return { data: legacy, loading, error, raw: data }
}
