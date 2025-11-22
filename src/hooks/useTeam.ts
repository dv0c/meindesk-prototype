"use client"

import axios from "axios"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export interface Site {
  id: string
  title: string
  description?: string | null
  url?: string | null
  logo?: string | null
  views: number
  limitViews: number
  createdAt: string
  updatedAt: string
  userId?: string
  subscription?: {
    id: string
    price: number
    billing_cycle: string
    next_billing_date: string
  } | null
  features: {
    articles: boolean
    pages: boolean
    categories: boolean
    media: boolean
    analytics: boolean
  }
}

const LOCAL_STORAGE_KEY = "teamId_session-key"

export function useTeam(fallbackId?: string) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [team, setTeam] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [siteId, setSiteId] = useState<string | null>(null)

  useEffect(() => {
    let id: string | null = null

    // 1. Try URL param
    if (pathname) {
      const parts = pathname.split("/")
      id = parts[2] || null
    }

    // 2. Try query param ?teamId=
    if (!id) {
      const queryId = searchParams?.get("teamId")
      if (queryId) id = queryId
    }

    // 3. Try localStorage
    if (!id && typeof window !== "undefined") {
      const storedId = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (storedId) id = storedId
    }

    // 4. Fallback argument
    if (!id && fallbackId) id = fallbackId

    if (id && id !== siteId) setSiteId(id)
  }, [pathname, searchParams, fallbackId, siteId])

  useEffect(() => {
    if (!siteId) return

    let cancelled = false

    const fetchTeam = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await axios.get<{ site: Site }>(`/api/team/${siteId}`)
        if (!cancelled) {
          setTeam(res.data.site)
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_KEY, res.data.site.id)
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.error || err.message || "Failed to fetch team")
        if (!cancelled) setTeam(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTeam()

    return () => {
      cancelled = true
    }
  }, [siteId])

  return { team, loading, error }
}
