"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, PieChart, Pie } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { AnalyticsAreaChart } from "./AnalyticsAreaChart"

export function AnalyticsCharts({ siteId }: { siteId: string }) {
    const { data, loading, error } = useAnalytics(siteId)

    if (loading) return (
        <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
                <Card className="h-[300px] animate-pulse" key={idx}>
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

    if (error) return <p className="text-destructive">Error: {error}</p>
    if (!data) return <p className="text-muted-foreground">No analytics data available.</p>

    const { viewsOverTime, topPages, trafficSources } = data

    // Dynamic color palette
    const colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ]

    const trafficConfig: Record<string, { label: string; color: string }> =
        trafficSources?.reduce((acc, src, i) => {
            const key =
                (typeof src.source === "string"
                    ? src.source.toLowerCase().replace(/\s+/g, "_")
                    : `source_${i}`)
            acc[key] = { label: src.source ?? key, color: colors[i % colors.length] }
            return acc
        }, {} as Record<string, { label: string; color: string }>) ?? {}


    const chartConfig: ChartConfig = {
        visitors: { label: "Views" },
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Views Over Time */}
            <div className="lg:col-span-2">
                <AnalyticsAreaChart data={viewsOverTime} />
            </div>

            {/* Top Pages - Dynamic Bar Colors */}
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>Most visited pages on your site</CardDescription>
                </CardHeader>
                <CardContent className="border-b">
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={topPages.map((p) => ({ browser: p.page, visitors: p.views }))}
                            layout="vertical"
                            margin={{ left: 0 }}
                        >
                            <YAxis
                                dataKey="browser"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <XAxis dataKey="visitors" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="visitors" layout="vertical" radius={5}>
                                {topPages.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Showing total views for top pages
                    </div>
                </CardFooter>
            </Card>

            {/* Traffic Sources Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={trafficConfig}
                        className="h-[400px] w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trafficSources}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {trafficSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
