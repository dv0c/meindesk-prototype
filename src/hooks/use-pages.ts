'use client'

import axios from "axios"
import { useCallback, useState } from "react"
import { toast } from "sonner"

interface UsePageOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function usePages({ onSuccess, onError }: UsePageOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])

  // ----------------------------------------
  // GET all pages
  // ----------------------------------------
  const getPages = useCallback(
    async (siteId: string) => {
      if (!siteId) {
        toast.error("Site not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.get(`/api/team/${siteId}/pages`)
        setPages(res.data)
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to load pages"
        toast.error(message)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, onError]
  )

  // ----------------------------------------
  // GET single page
  // ----------------------------------------
  const getPage = useCallback(
    async (siteId: string, pageId: string) => {
      if (!siteId) {
        toast.error("Site not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.get(`/api/taem/${siteId}/pages/${pageId}`)
        setPage(res.data)
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to load page"
        toast.error(message)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, onError]
  )

  // ----------------------------------------
  // PATCH update page
  // ----------------------------------------
  const updatePage = useCallback(
    async (siteId: string, pageId: string, data: Record<string, any>) => {
      if (!siteId) {
        toast.error("Site not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.patch(`/api/team/${siteId}/pages/${pageId}`, data)
        toast.success("Page updated successfully!")
        setPage(res.data)
        setPages((prev) => prev.map((p) => (p.id === pageId ? res.data : p)))
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to update page"
        toast.error(message)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, onError]
  )

  // ----------------------------------------
  // DELETE page
  // ----------------------------------------
  const deletePage = useCallback(
    async (siteId: string, pageId: string) => {
      if (!siteId) {
        toast.error("Site not found.")
        return
      }

      setLoading(true)
      try {
        await axios.delete(`/api/team/${siteId}/pages/${pageId}`)
        toast.success("Page deleted successfully!")
        setPages((prev) => prev.filter((p) => p.id !== pageId))
        if (page?.id === pageId) setPage(null)
        onSuccess?.({ deleted: pageId })
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to delete page"
        toast.error(message)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [page, onSuccess, onError]
  )

  return {
    page,
    pages,
    getPage,
    getPages,
    updatePage,
    deletePage,
    loading,
  }
}
