"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DATE_PRESETS } from "@/lib/analytics/date-ranges"
import { useAnalyticsFilters } from "./AnalyticsFilterProvider"
import { Download } from "lucide-react"

export function AnalyticsFilterBar({
  siteId,
  onExport,
}: {
  siteId: string
  onExport?: () => void
}) {
  const { filters, setFilters, preset, setPreset } = useAnalyticsFilters()

  return (
    <div className="flex flex-wrap items-center gap-2 justify-between">
      <div className="flex flex-wrap gap-1">
        {DATE_PRESETS.slice(0, 8).map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={preset === opt.value ? "secondary" : "ghost"}
            onClick={() => setPreset(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.compareMode ?? "previous_period"}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              compareMode: v as typeof prev.compareMode,
            }))
          }
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Compare" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No comparison</SelectItem>
            <SelectItem value="previous_period">Previous period</SelectItem>
            <SelectItem value="previous_week">Previous week</SelectItem>
            <SelectItem value="previous_month">Previous month</SelectItem>
            <SelectItem value="previous_year">Previous year</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.device ?? "all"}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              device: v === "all" ? undefined : v,
            }))
          }
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All devices</SelectItem>
            <SelectItem value="Desktop">Desktop</SelectItem>
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.source ?? "all"}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              source: v === "all" ? undefined : v,
            }))
          }
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>

        {onExport && (
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        )}
      </div>
    </div>
  )
}
