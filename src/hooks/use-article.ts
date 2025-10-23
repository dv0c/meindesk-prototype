'use client'

import axios from "axios"
import { useCallback, useState } from "react"
import { toast } from "sonner"

interface UseArticleOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useArticle({ onSuccess, onError }: UseArticleOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])

  // ----------------------------------------
  // GET all articles
  // ----------------------------------------
  const getArticles = useCallback(
    async (teamId: string) => {
      if (!teamId) {
        toast.error("Team not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.get(`/api/team/${teamId}/articles`)
        setArticles(res.data)
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to load articles"
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
  // GET single article
  // ----------------------------------------
  const getArticle = useCallback(
    async (teamId: string, articleId: string) => {
      if (!teamId) {
        toast.error("Team not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.get(`/api/team/${teamId}/articles/${articleId}`)
        setArticle(res.data)
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to load article"
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
  // PATCH update article
  // ----------------------------------------
  const updateArticle = useCallback(
    async (teamId: string, articleId: string, data: Record<string, any>) => {
      if (!teamId) {
        toast.error("Team not found.")
        return
      }

      setLoading(true)
      try {
        const res = await axios.patch(`/api/team/${teamId}/articles/${articleId}`, data)
        toast.success("Article updated successfully!")
        setArticle(res.data)
        setArticles((prev) =>
          prev.map((a) => (a.id === articleId ? res.data : a))
        )
        onSuccess?.(res.data)
        return res.data
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to update article"
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
  // DELETE article
  // ----------------------------------------
  const deleteArticle = useCallback(
    async (teamId: string, articleId: string) => {
      if (!teamId) {
        toast.error("Team not found.")
        return
      }

      setLoading(true)
      try {
        await axios.delete(`/api/team/${teamId}/articles/${articleId}`)
        toast.success("Article deleted successfully!")
        // Remove from local list
        setArticles((prev) => prev.filter((a) => a.id !== articleId))
        // Clear current if it was deleted
        if (article?.id === articleId) setArticle(null)
        onSuccess?.({ deleted: articleId })
      } catch (error: any) {
        const message = error.response?.data?.error || "Failed to delete article"
        toast.error(message)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [article, onSuccess, onError]
  )

  return {
    article,
    articles,
    getArticle,
    getArticles,
    updateArticle,
    deleteArticle,
    loading,
  }
}
