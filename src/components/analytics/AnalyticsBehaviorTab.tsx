"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsFilters } from "./AnalyticsFilterProvider"

export function AnalyticsBehaviorTab({ siteId }: { siteId: string }) {
  const { filters } = useAnalyticsFilters()
  const [funnel, setFunnel] = useState<{
    label: string
    steps: { name: string; count: number; dropOffPercent: number }[]
  } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ id: "search-to-contact" })
    if (filters.preset) params.set("preset", filters.preset)
    fetch(`/api/analytics/${siteId}/funnels?${params}`)
      .then((r) => r.json())
      .then(setFunnel)
  }, [siteId, filters])

  if (!funnel) return <p className="text-sm text-muted-foreground">Loading behavior analytics…</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{funnel.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnel.steps.map((step, i) => (
            <div key={step.name} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{step.name.replace(/_/g, " ")}</span>
                  <span>{step.count.toLocaleString()} users</span>
                </div>
                {step.dropOffPercent > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.dropOffPercent}% drop-off from previous step
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
