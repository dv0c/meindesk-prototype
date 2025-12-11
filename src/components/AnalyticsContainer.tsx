"use client"

import { AnalyticsCards } from "@/components/AnalyticsCards"
import { AnalyticsCharts } from "@/components/AnalyticsChart"
import { AnalyticsLogs } from "@/components/AnalyticsLogs"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const RANGE_OPTIONS = [
    { label: "Yesterday", value: "yesterday" },
    { label: "Last Week", value: "lastWeek" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Last 3 Months", value: "last3Months" },
]

export function AnalyticsContainer({ siteId }: { siteId: string }) {
    const [range, setRange] = useState("lastMonth")

    return (
        <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Range selector */}
            <div className="flex gap-2">
                {RANGE_OPTIONS.map((opt) => (
                    <Button
                        key={opt.value}
                        size="sm"
                        variant={range === opt.value ? "default" : "outline"}
                        onClick={() => setRange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            {/* Analytics Cards */}
            <AnalyticsCards siteId={siteId} />

            {/* Charts */}
            <AnalyticsCharts siteId={siteId} range={range} />

            {/* Event Logs */}
            <AnalyticsLogs siteId={siteId} range={range} />
        </div>
    )
}
