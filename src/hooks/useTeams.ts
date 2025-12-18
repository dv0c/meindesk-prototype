"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"

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
    articles?: boolean
    pages?: boolean
    cateories?: boolean
    media?: boolean
    analytics?: boolean

  }
}

// Global cache and promise for teams to avoid duplicate requests
let teamsCache: Site[] | null = null
let teamsFetchPromise: Promise<Site[]> | null = null

export function useTeams() {
  const [teams, setTeams] = useState<Site[]>(() => teamsCache || [])
  const [loading, setLoading] = useState<boolean>(() => !teamsCache)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    // If we already have data in cache, we might want to background refresh or just use it.
    // For now, if we have cache, we just ensure loading is false.
    if (teamsCache) {
      setTeams(teamsCache)
      setLoading(false)
      return
    }

    const fetchTeams = async () => {
      if (!teamsFetchPromise) {
        teamsFetchPromise = axios.get<{ teams: Site[] }>("/api/team").then(res => res.data.teams)
      }

      try {
        const data = await teamsFetchPromise
        teamsCache = data
        if (mounted.current) {
          setTeams(data)
          setLoading(false)
          setError(null)
        }
      } catch (err: any) {
        // Reset promise on error so we can retry later
        teamsFetchPromise = null
        if (mounted.current) {
          setError(err.response?.data?.error || err.message || "Failed to fetch teams")
          setTeams([])
          setLoading(false)
        }
      }
    }

    fetchTeams()
  }, [])

  // Expose a mutate function if needed in future to clear cache
  return { teams, loading, error }
}
