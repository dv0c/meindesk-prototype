"use client"

import { useMemo, useState } from "react"
import {
  applyMediaFilters,
  getAvailableMonths,
} from "@/lib/media-gallery-filters"
import type { Media } from "@/types/media-gallery"
import {
  DEFAULT_MEDIA_GALLERY_FILTERS,
  type MediaGalleryFilterState,
  type MediaUsageIndex,
} from "@/types/media-gallery"

export function useMediaGalleryFilters(media: Media[], usageIndex: MediaUsageIndex) {
  const [filters, setFilters] = useState<MediaGalleryFilterState>(DEFAULT_MEDIA_GALLERY_FILTERS)

  const filteredMedia = useMemo(
    () => applyMediaFilters(media, filters, usageIndex),
    [media, filters, usageIndex],
  )

  const availableMonths = useMemo(() => getAvailableMonths(media), [media])

  const articleOptions = useMemo(
    () =>
      usageIndex.articles
        .filter((a) => a.cover)
        .map((a) => ({ id: a.id, label: a.title })),
    [usageIndex.articles],
  )

  const categoryOptions = useMemo(
    () =>
      usageIndex.categories
        .filter((c) => c.thumbnail)
        .map((c) => ({ id: c.id, label: c.name })),
    [usageIndex.categories],
  )

  const updateFilters = (patch: Partial<MediaGalleryFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const clearFilters = () => {
    setFilters(DEFAULT_MEDIA_GALLERY_FILTERS)
  }

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    filteredMedia,
    availableMonths,
    articleOptions,
    categoryOptions,
  }
}
