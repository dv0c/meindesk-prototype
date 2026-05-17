"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { countActiveFilters, formatMonthLabel, hasActiveFilters } from "@/lib/media-gallery-filters"
import type { MediaGalleryFilterState } from "@/types/media-gallery"

interface MediaGalleryFiltersProps {
  filters: MediaGalleryFilterState
  onFiltersChange: (patch: Partial<MediaGalleryFilterState>) => void
  onClear: () => void
  availableMonths: string[]
  articleOptions: { id: string; label: string }[]
  categoryOptions: { id: string; label: string }[]
  resultCount: number
  totalCount: number
  compact?: boolean
  className?: string
}

export function MediaGalleryFilters({
  filters,
  onFiltersChange,
  onClear,
  availableMonths,
  articleOptions,
  categoryOptions,
  resultCount,
  totalCount,
  compact = false,
  className,
}: MediaGalleryFiltersProps) {
  const activeCount = countActiveFilters(filters)
  const showClear = hasActiveFilters(filters)

  const selectTriggerClass = compact ? "h-8 text-xs min-w-[110px]" : "h-9 min-w-[130px]"

  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("flex flex-wrap items-center gap-2", compact && "gap-1.5")}>
        <div className={cn("relative", compact ? "w-full sm:flex-1 sm:min-w-[180px]" : "w-full max-w-sm")}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className={cn("pl-9", compact ? "h-8 text-xs" : "h-9")}
          />
        </div>

        <Select
          value={filters.month ?? "all"}
          onValueChange={(v) => onFiltersChange({ month: v === "all" ? null : v })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m}>
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.articleId ?? "all"}
          onValueChange={(v) => onFiltersChange({ articleId: v === "all" ? null : v })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Article" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All articles</SelectItem>
            {articleOptions.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(v) => onFiltersChange({ categoryId: v === "all" ? null : v })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.usage}
          onValueChange={(v) =>
            onFiltersChange({ usage: v as MediaGalleryFilterState["usage"] })
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assets</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) =>
            onFiltersChange({ sort: v as MediaGalleryFilterState["sort"] })
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
          </SelectContent>
        </Select>

        {showClear && (
          <Button
            type="button"
            variant="ghost"
            size={compact ? "sm" : "default"}
            className={cn(compact && "h-8 text-xs")}
            onClick={onClear}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        )}
      </div>

      <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
        {resultCount === totalCount
          ? `${resultCount} asset${resultCount === 1 ? "" : "s"}`
          : `${resultCount} of ${totalCount} assets`}
      </p>
    </div>
  )
}
