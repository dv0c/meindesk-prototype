"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsFilters } from "./AnalyticsFilterProvider"

export function AnalyticsSearchTab({ siteId }: { siteId: string }) {
  const { filters } = useAnalyticsFilters()
  const [data, setData] = useState<{
    totalSearches: number
    uniqueQueries: number
    noResultSearches: number
    searchSuccessRate: number
    topQueries: { query: string; count: number; noResults: number }[]
  } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.preset) params.set("preset", filters.preset)
    fetch(`/api/analytics/${siteId}/search?${params}`)
      .then((r) => r.json())
      .then(setData)
  }, [siteId, filters])

  if (!data) return <p className="text-sm text-muted-foreground">Loading search analytics…</p>

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total searches</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totalSearches}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Unique queries</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.uniqueQueries}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">No results</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.noResultSearches}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Success rate</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.searchSuccessRate}%</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top search queries</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {data.topQueries.map((q) => (
              <li key={q.query} className="flex justify-between border-b border-border/50 pb-2">
                <span>{q.query}</span>
                <span className="text-muted-foreground">{q.count} searches{q.noResults ? ` · ${q.noResults} empty` : ""}</span>
              </li>
            ))}
            {!data.topQueries.length && (
              <li className="text-muted-foreground py-4 text-center">No search events tracked yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
