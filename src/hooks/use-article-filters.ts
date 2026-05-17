"use client"

import { useEffect, useMemo, useState } from "react"
import {
  applyArticleFilters,
  buildAuthorOptions,
  buildCategoryOptionsFromArticles,
  getAvailableMonthsForArticles,
  mergeCategoryOptions,
} from "@/lib/article-filters"
import {
  DEFAULT_ARTICLE_FILTERS,
  type ArticleGalleryFilterState,
  type ArticleListItem,
} from "@/types/article-filters"

export function useArticleFilters(articles: ArticleListItem[], siteId?: string) {
  const [filters, setFilters] = useState<ArticleGalleryFilterState>(DEFAULT_ARTICLE_FILTERS)
  const [allCategories, setAllCategories] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    if (!siteId) return
    let cancelled = false
    fetch(`/api/team/${siteId}/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { id: string; name: string }[]) => {
        if (cancelled) return
        setAllCategories(
          (Array.isArray(data) ? data : []).map((c) => ({
            id: c.id,
            label: c.name || "Untitled",
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setAllCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [siteId])

  const filteredArticles = useMemo(
    () => applyArticleFilters(articles, filters),
    [articles, filters],
  )

  const availableMonths = useMemo(
    () => getAvailableMonthsForArticles(articles),
    [articles],
  )

  const authorOptions = useMemo(() => buildAuthorOptions(articles), [articles])

  const categoryOptions = useMemo(
    () =>
      mergeCategoryOptions(
        buildCategoryOptionsFromArticles(articles),
        allCategories,
      ),
    [articles, allCategories],
  )

  const updateFilters = (patch: Partial<ArticleGalleryFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_ARTICLE_FILTERS)
  }

  return {
    filters,
    updateFilters,
    clearFilters,
    filteredArticles,
    availableMonths,
    authorOptions,
    categoryOptions,
  }
}
