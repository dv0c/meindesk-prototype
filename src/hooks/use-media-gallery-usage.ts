"use client"

import { useCallback, useEffect, useState } from "react"
import type { MediaUsageIndex } from "@/types/media-gallery"

const EMPTY_INDEX: MediaUsageIndex = {
  byUrl: {},
  articles: [],
  categories: [],
}

export function useMediaGalleryUsage(siteId: string | undefined, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [usageIndex, setUsageIndex] = useState<MediaUsageIndex>(EMPTY_INDEX)
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsage = useCallback(async () => {
    if (!siteId || !enabled) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/team/${siteId}/media-gallery/usage`)
      if (!response.ok) {
        throw new Error("Failed to load media usage data")
      }
      const data: MediaUsageIndex = await response.json()
      setUsageIndex(data)
    } catch {
      setUsageIndex(EMPTY_INDEX)
    } finally {
      setIsLoading(false)
    }
  }, [siteId, enabled])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return { usageIndex, isLoadingUsage: isLoading, refetchUsage: fetchUsage }
}
