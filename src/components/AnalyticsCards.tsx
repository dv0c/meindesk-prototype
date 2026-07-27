"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UsersIcon,
  ActivityIcon,
  TimerIcon,
} from "lucide-react"
import { useAnalyticsQuery } from "@/hooks/useAnalyticsQuery"
import { useOptionalAnalyticsFilters } from "@/components/analytics/AnalyticsFilterProvider"
import type { AnalyticsFilterState } from "@/lib/analytics/types"

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  compareLabel?: string
}

function StatCard({ title, value, change, icon, compareLabel = "vs previous period" }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        <div className="mt-1 flex items-center text-xs">
          {change !== 0 && (
            isPositive ? (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
            )
          )}
          <span className={change >= 0 ? "text-green-600" : "text-red-600"}>{Math.abs(change).toFixed(1)}%</span>
          <span className="ml-1 text-muted-foreground">{compareLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsCards({
  siteId,
  range = "last30Days",
}: {
  siteId: string
  range?: string
}) {
  const ctx = useOptionalAnalyticsFilters()
  const filters = useMemo<AnalyticsFilterState>(
    () =>
      ctx?.filters ?? {
        preset: range,
        compareMode: "previous_period",
      },
    [ctx?.filters, range]
  )
  const { data, loading, error } = useAnalyticsQuery(siteId, filters)

  if (loading && !data?.cardMetrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) return <p className="text-red-600">Error: {error}</p>
  if (!data?.cardMetrics) return <p>No analytics data available</p>

  const c = data.cardMetrics

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard title="Page Views" value={c.totalViews.value} change={c.totalViews.percent} icon={<EyeIcon className="h-4 w-4" />} />
      <StatCard title="Unique Visitors" value={c.uniqueVisitors.value} change={c.uniqueVisitors.percent} icon={<UsersIcon className="h-4 w-4" />} />
      <StatCard title="Sessions" value={c.sessions.value} change={c.sessions.percent} icon={<ActivityIcon className="h-4 w-4" />} />
      <StatCard title="Bounce Rate" value={`${c.bounceRate.value}%`} change={c.bounceRate.percent} icon={<ActivityIcon className="h-4 w-4" />} />
      <StatCard title="Avg. Session" value={c.avgSessionDuration.value} change={c.avgSessionDuration.comparison.percent} icon={<TimerIcon className="h-4 w-4" />} />
      <StatCard title="New Visitors" value={c.newVisitors.value} change={c.newVisitors.percent} icon={<UsersIcon className="h-4 w-4" />} />
    </div>
  )
}
