"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AnalyticsRetentionTab({ siteId }: { siteId: string }) {
  const [data, setData] = useState<{
    cohorts: { label: string; size: number; retention: number[] }[]
  } | null>(null)

  useEffect(() => {
    fetch(`/api/analytics/${siteId}/retention?granularity=weekly&preset=last90Days`)
      .then((r) => r.json())
      .then(setData)
  }, [siteId])

  if (!data) return <p className="text-sm text-muted-foreground">Loading retention…</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly cohort retention</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="text-xs w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-2">Cohort</th>
              <th className="text-right p-2">Size</th>
              {[0, 1, 2, 3, 4, 5].map((w) => (
                <th key={w} className="text-center p-2">W{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cohorts.map((c) => (
              <tr key={c.label} className="border-t">
                <td className="p-2 font-medium">{c.label}</td>
                <td className="p-2 text-right">{c.size}</td>
                {c.retention.map((pct, i) => (
                  <td
                    key={i}
                    className="p-2 text-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, hsl(var(--primary)) ${pct}%, transparent)`,
                    }}
                  >
                    {pct}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
