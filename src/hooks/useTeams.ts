"use client"

import { useState, useEffect } from "react"
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

export function useTeams() {
  const [teams, setTeams] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchTeams = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await axios.get<{ teams: Site[] }>("/api/team")
        if (!cancelled) setTeams(res.data.teams)
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.error || err.message || "Failed to fetch teams")
        if (!cancelled) setTeams([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTeams()

    return () => {
      cancelled = true
    }
  }, [])

  return { teams, loading, error }
}
