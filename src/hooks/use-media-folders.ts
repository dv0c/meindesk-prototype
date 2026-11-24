"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { MediaFolderNode, MediaFolderSelection } from "@/types/media-gallery"

interface FoldersResponse {
  folders: MediaFolderNode[]
  root: string
}

export function useMediaFolders(siteId: string | undefined, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [folders, setFolders] = useState<MediaFolderNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<MediaFolderSelection>("all")

  const fetchFolders = useCallback(async () => {
    if (!siteId || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/team/${siteId}/media-gallery/folders`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load folders")
      }
      const data: FoldersResponse = await response.json()
      setFolders(data.folders || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load folders"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [siteId, enabled])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const createFolder = useCallback(
    async (path: string) => {
      if (!siteId) return null
      const response = await fetch(`/api/team/${siteId}/media-gallery/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to create folder")
      }
      await fetchFolders()
      toast.success("Folder created")
      return data.path as string
    },
    [siteId, fetchFolders],
  )

  const renameFolder = useCallback(
    async (from: string, to: string) => {
      if (!siteId) return null
      const response = await fetch(`/api/team/${siteId}/media-gallery/folders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to rename folder")
      }
      if (selectedFolder === from || (typeof selectedFolder === "string" && selectedFolder.startsWith(`${from}/`))) {
        const next =
          selectedFolder === from
            ? (data.path as string)
            : `${data.path}${selectedFolder.slice(from.length)}`
        setSelectedFolder(next)
      }
      await fetchFolders()
      toast.success("Folder renamed")
      return data.path as string
    },
    [siteId, fetchFolders, selectedFolder],
  )

  const deleteFolder = useCallback(
    async (path: string) => {
      if (!siteId) return
      const response = await fetch(
        `/api/team/${siteId}/media-gallery/folders?path=${encodeURIComponent(path)}`,
        { method: "DELETE" },
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete folder")
      }
      if (
        selectedFolder === path ||
        (typeof selectedFolder === "string" && selectedFolder.startsWith(`${path}/`))
      ) {
        setSelectedFolder("all")
      }
      await fetchFolders()
      toast.success("Folder deleted")
    },
    [siteId, fetchFolders, selectedFolder],
  )

  const uploadFolderPath =
    !selectedFolder || selectedFolder === "all" || selectedFolder === siteId
      ? siteId
        ? `${siteId}/uploads`
        : ""
      : selectedFolder

  return {
    folders,
    isLoading,
    error,
    selectedFolder,
    setSelectedFolder,
    uploadFolderPath,
    refetch: fetchFolders,
    createFolder,
    renameFolder,
    deleteFolder,
  }
}
