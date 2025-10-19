"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UsersIcon,
  FileTextIcon,
  MousePointerClickIcon,
} from "lucide-react"
import { useAnalytics } from "@/hooks/useAnalytics" // adjust path if needed

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
}

function StatCard({ title, value, change, icon }: StatCardProps) {
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
          {isPositive ? (
            <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
          )}
          <span className={isPositive ? "text-green-600" : "text-red-600"}>{Math.abs(change).toFixed(1)}%</span>
          <span className="ml-1 text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalyticsCardsProps {
  siteId: string
}

export function AnalyticsCards({ siteId }: AnalyticsCardsProps) {
  const { data, loading, error } = useAnalytics(siteId)


  if (loading) return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card className="h-28 animate-pulse" key={idx}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium"></CardTitle>
          <div className="text-muted-foreground"></div>
        </CardHeader>
        <CardContent className="h-100 w-full">
        </CardContent>
      </Card>
      ))}
    </div>
  )

  if (error) return <p className="text-red-600">Error: {error}</p>
  if (!data || !data.cardMetrics) return <p>No analytics data available</p>

  const {
    totalViews,
    viewsChange,
    uniqueVisitors,
    visitorsChange,
    pageViews,
    pageViewsChange,
    avgSessionDuration,
    durationChange,
  } = data.cardMetrics

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Views" value={totalViews} change={viewsChange} icon={<EyeIcon className="h-4 w-4" />} />
      <StatCard title="Unique Visitors" value={uniqueVisitors} change={visitorsChange} icon={<UsersIcon className="h-4 w-4" />} />
      <StatCard title="Page Views" value={pageViews} change={pageViewsChange} icon={<FileTextIcon className="h-4 w-4" />} />
      <StatCard title="Avg. Session" value={avgSessionDuration} change={durationChange} icon={<MousePointerClickIcon className="h-4 w-4" />} />
    </div>
  )
}
