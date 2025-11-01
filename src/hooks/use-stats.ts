"use client"
import { useEffect, useState } from "react"

export interface RecentItem {
  id: string
  title?: string
  name?: string
  slug: string
  createdAt: string
}

export interface StatsData {
  siteId: string
  totals: { articles: number; categories: number; analyticsEvents: number; pages?: number; media?: number }
  newFromLastMonth: { articles: number; categories: number; analyticsEvents: number; pages?: number; media?: number }
  recent?: { articles: RecentItem[]; categories: RecentItem[] }
  period: { from: string; to: string }
}

export function useStats(siteId: string, recentCount = 5) {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteId) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/analytics/${siteId}/stats?recentCount=${recentCount}`)
        if (!res.ok) throw new Error(`Failed to load stats: ${res.statusText}`)

        const json: StatsData = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [siteId, recentCount])

  return { data, loading, error }
}
