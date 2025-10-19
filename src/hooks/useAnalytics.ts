"use client"

import { useEffect, useState } from "react"

export interface ViewData {
  date: string
  views: number
  visitors: number
}

export interface TopPage {
  page: string
  views: number
}

export interface TrafficSource {
  source: string
  value: number
  color: string
}

export interface CardMetrics {
  totalViews: number
  viewsChange: number
  uniqueVisitors: number
  visitorsChange: number
  pageViews: number
  pageViewsChange: number
  avgSessionDuration: string
  durationChange: number
}

export interface AnalyticsData {
  viewsOverTime: ViewData[]
  topPages: TopPage[]
  trafficSources: TrafficSource[]
  cardMetrics: CardMetrics
}

export function useAnalytics(siteId: string) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteId) return

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/analytics/${siteId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) {
          throw new Error(`Failed to load analytics: ${res.statusText}`)
        }

        const json: AnalyticsData = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [siteId])

  return { data, loading, error }
}
