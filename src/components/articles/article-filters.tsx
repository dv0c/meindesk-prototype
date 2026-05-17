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
import {
  countActiveArticleFilters,
  formatMonthLabel,
  hasActiveArticleFilters,
} from "@/lib/article-filters"
import type { ArticleGalleryFilterState } from "@/types/article-filters"

interface ArticleFiltersProps {
  filters: ArticleGalleryFilterState
  onFiltersChange: (patch: Partial<ArticleGalleryFilterState>) => void
  onClear: () => void
  availableMonths: string[]
  categoryOptions: { id: string; label: string }[]
  authorOptions: { id: string; label: string }[]
  resultCount: number
  totalCount: number
  className?: string
}

export function ArticleFilters({
  filters,
  onFiltersChange,
  onClear,
  availableMonths,
  categoryOptions,
  authorOptions,
  resultCount,
  totalCount,
  className,
}: ArticleFiltersProps) {
  const activeCount = countActiveArticleFilters(filters)
  const showClear = hasActiveArticleFilters(filters)
  const selectTriggerClass = "h-9 min-w-[130px]"

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9 h-9"
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
          value={filters.authorId ?? "all"}
          onValueChange={(v) => onFiltersChange({ authorId: v === "all" ? null : v })}
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All authors</SelectItem>
            {authorOptions.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) =>
            onFiltersChange({ status: v as ArticleGalleryFilterState["status"] })
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
            <SelectItem value="DELETED">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.cover}
          onValueChange={(v) =>
            onFiltersChange({ cover: v as ArticleGalleryFilterState["cover"] })
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Cover" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All articles</SelectItem>
            <SelectItem value="with_cover">With cover</SelectItem>
            <SelectItem value="without_cover">Without cover</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) =>
            onFiltersChange({ sort: v as ArticleGalleryFilterState["sort"] })
          }
        >
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="title-asc">Title A–Z</SelectItem>
            <SelectItem value="title-desc">Title Z–A</SelectItem>
          </SelectContent>
        </Select>

        {showClear && (
          <Button type="button" variant="ghost" onClick={onClear}>
            <X className="mr-1 h-3.5 w-3.5" />
            Clear{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {resultCount === totalCount
          ? `${resultCount} article${resultCount === 1 ? "" : "s"}`
          : `${resultCount} of ${totalCount} articles`}
      </p>
    </div>
  )
}
