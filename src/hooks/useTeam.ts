"use client"

import axios from "axios"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef, useMemo } from "react"

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

// Global cache to share data between hook instances and dedupe requests
const teamCache = new Map<string, Site>()
const fetchPromises = new Map<string, Promise<Site>>()

export function useTeam(fallbackId?: string, tenantPrefix?: string) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mounted = useRef(true)

  // 1. Resolve ID logic
  // We try to derive it from URL synchronously to avoid useEffect delay for the first attempt
  const urlId = useMemo(() => {
    let id: string | null = null
    if (pathname) {
      const parts = pathname.split("/")
      id = parts[2] || null
    }
    if (!id) {
      id = searchParams?.get("teamId") || null
    }
    return id
  }, [pathname, searchParams])

  // Initialize state
  const [team, setTeam] = useState<Site | null>(() => {
    // Try to initialize from cache if we have a URL ID
    if (urlId && teamCache.has(urlId)) {
      return teamCache.get(urlId)!
    }
    return null
  })

  const [loading, setLoading] = useState<boolean>(() => {
    // If we have data in cache for urlId, we are not loading
    if (urlId && teamCache.has(urlId)) return false
    return true
  })

  const [error, setError] = useState<string | null>(null)

  // Track attempted IDs to avoid creating infinite loops if we retry
  const attemptedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    // Determine the initial ID to try
    let initialId = urlId

    // If no URL ID, we can't check localStorage synchronously in SSR safe way,
    // so we defer to the async fetch logic which handles it.
    // However, if we didn't have a URL ID, we are likely still loading.

    const fetchTeam = async (idToUse: string | null) => {
      // If we ran out of IDs to try
      if (!idToUse) {
        if (!cancelled && mounted.current) {
          setLoading(false)
          // Only set error if we really have no team and we tried something or have no fallbacks
          if (!team && attemptedIds.current.size > 0) {
            // We failed everything
          }
        }
        return
      }

      if (attemptedIds.current.has(idToUse)) {
        // Already tried this ID, preventing loop
        return
      }
      attemptedIds.current.add(idToUse)

      // Check cache first
      if (teamCache.has(idToUse)) {
        if (!cancelled && mounted.current) {
          const cachedSite = teamCache.get(idToUse)!
          setTeam(cachedSite)
          setLoading(false)
          setError(null)
          // Update localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_KEY, cachedSite.id)
          }
        }
        return
      }

      if (!cancelled && mounted.current) {
        setLoading(true)
        setError(null)
      }

      try {
        let promise = fetchPromises.get(idToUse)
        if (!promise) {
          const apiUrl = tenantPrefix
            ? fallbackId
              ? `/api/v1/${idToUse}`
              : `/api/v1/${idToUse}/`
            : `/api/team/${idToUse}`

          promise = axios.get<{ site: Site }>(apiUrl).then((res) => res.data.site)
          fetchPromises.set(idToUse, promise)
        }

        const site = await promise

        // Success
        teamCache.set(idToUse, site)

        if (!cancelled && mounted.current) {
          setTeam(site)
          setLoading(false)
          setError(null)
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_KEY, site.id)
          }
        }
      } catch (err: any) {
        // Failed
        fetchPromises.delete(idToUse) // Allow retry later

        if (cancelled || !mounted.current) return

        // Implement the Fallback Strategy
        // 1. If we just tried URL ID (or passed ID), try LocalStorage
        if (typeof window !== "undefined") {
          const storedId = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (storedId && !attemptedIds.current.has(storedId)) {
            await fetchTeam(storedId)
            return
          }
        }

        // 2. If we just tried LocalStorage (or it wasn't there), try fallbackId
        if (fallbackId && !attemptedIds.current.has(fallbackId)) {
          await fetchTeam(fallbackId)
          return
        }

        // 3. Give up
        setError(err.response?.data?.error || err.message || "Failed to fetch site")
        setTeam(null)
        setLoading(false)
      }
    }

    // Start the process
    // If we have no initialId (no URL ID), we try localStorage immediately
    if (!initialId) {
      if (typeof window !== "undefined") {
        initialId = localStorage.getItem(LOCAL_STORAGE_KEY)
      }
    }

    // If still no ID, use fallback
    if (!initialId && fallbackId) {
      initialId = fallbackId
    }

    fetchTeam(initialId)

    return () => {
      cancelled = true
    }
  }, [urlId, fallbackId, tenantPrefix])

  return { team, loading, error }
}
