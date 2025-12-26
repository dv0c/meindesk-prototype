"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

// Function to clear the global cache (callable from outside the hook)
export function clearTeamsCache() {
  teamsCache = null
  teamsFetchPromise = null
}

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

  const fetchTeams = useCallback(async (force = false) => {
    // If force refresh, clear cache
    if (force) {
      teamsCache = null
      teamsFetchPromise = null
    }

    // If we already have data in cache and not forcing, use it
    if (teamsCache && !force) {
      setTeams(teamsCache)
      setLoading(false)
      return
    }

    setLoading(true)

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
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Mutate function to refresh teams list
  const mutate = useCallback(() => {
    fetchTeams(true)
  }, [fetchTeams])

  return { teams, loading, error, mutate }
}
