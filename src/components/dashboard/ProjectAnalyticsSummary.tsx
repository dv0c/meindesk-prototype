"use client"

import { AnalyticsCards } from "@/components/AnalyticsCards"
import { AnalyticsAreaChart } from "@/components/AnalyticsAreaChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProjectAnalyticsSummary({ siteId }: { siteId: string }) {
    const { data, loading } = useAnalytics(siteId, "lastMonth") // Default to last month

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium">Analytics</h2>

            {/* Quick Stats */}
            <AnalyticsCards siteId={siteId} />

            {/* Main Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Visitors & Views (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    {loading ? (
                        <div className="h-[250px] w-full bg-muted animate-pulse rounded" />
                    ) : data?.viewsOverTime ? (
                        <AnalyticsAreaChart data={data.viewsOverTime} />
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
