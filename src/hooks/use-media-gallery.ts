"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { formatTimeLeft } from "@/lib/utils"
import type { Media, MediaGalleryResponse } from "@/types/media-gallery"

const MAX_PAGES = 50

export function useMediaGallery(siteId: string | undefined, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wasTruncated, setWasTruncated] = useState(false)

  const fetchMedia = useCallback(async () => {
    if (!siteId || !enabled) return

    setIsLoading(true)
    setError(null)
    setWasTruncated(false)

    try {
      const allMedia: Media[] = []
      let cursor: string | null | undefined = undefined
      let pageCount = 0
      let truncated = false

      do {
        const params = new URLSearchParams()
        if (cursor) params.set("next_cursor", cursor)

        const url = `/api/team/${siteId}/media-gallery${params.toString() ? `?${params}` : ""}`
        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 429) {
            const retryAfter = errorData.retryAfterSeconds
              ? formatTimeLeft(errorData.retryAfterSeconds)
              : "a moment"
            throw new Error(`Rate limit exceeded. Please try again in ${retryAfter}.`)
          }
          throw new Error(errorData.error || `Failed to fetch media: ${response.statusText}`)
        }

        const data: MediaGalleryResponse = await response.json()
        allMedia.push(...(data.media || []))
        cursor = data.nextPageCursor ?? null
        pageCount++

        if (pageCount >= MAX_PAGES && cursor) {
          truncated = true
          break
        }
      } while (cursor)

      if (truncated) {
        setWasTruncated(true)
        toast.warning("Showing the first 1,200 images. Some older assets may be hidden.")
      }

      setMedia(allMedia)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load media"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [siteId, enabled])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const removeMedia = useCallback((publicId: string) => {
    setMedia((prev) => prev.filter((item) => item.public_id !== publicId))
  }, [])

  return {
    media,
    isLoading,
    error,
    wasTruncated,
    refetch: fetchMedia,
    removeMedia,
    setMedia,
  }
}
