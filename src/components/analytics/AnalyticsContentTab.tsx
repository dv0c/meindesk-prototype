"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsFilters } from "./AnalyticsFilterProvider"

interface ContentRow {
  contentId: string
  contentType: string
  title: string
  views: number
  uniqueViews: number
}

export function AnalyticsContentTab({ siteId }: { siteId: string }) {
  const { filters } = useAnalyticsFilters()
  const [items, setItems] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.preset) params.set("preset", filters.preset)
    if (filters.from) params.set("from", filters.from)
    if (filters.to) params.set("to", filters.to)

    fetch(`/api/analytics/${siteId}/content?${params}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [siteId, filters])

  if (loading) return <p className="text-sm text-muted-foreground">Loading content analytics…</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4 text-right">Views</th>
                <th className="pb-2 text-right">Unique</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={`${row.contentType}:${row.contentId}`} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium truncate max-w-[240px]">{row.title}</td>
                  <td className="py-2 pr-4 capitalize text-muted-foreground">{row.contentType}</td>
                  <td className="py-2 pr-4 text-right">{row.views.toLocaleString()}</td>
                  <td className="py-2 text-right">{row.uniqueViews.toLocaleString()}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No content views in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
