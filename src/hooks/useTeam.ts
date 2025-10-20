"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useSession } from "next-auth/react"

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
}

export function useTeam() {
  const pathname = usePathname()
  const [team, setTeam] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Store siteId in state once to prevent repeated reloads
  const [siteId, setSiteId] = useState<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    const parts = pathname.split("/")
    const id = parts[2] || null

    if (id && id !== siteId) {
      setSiteId(id) // only update if different
    }
  }, [pathname, siteId])

  useEffect(() => {
    if (!siteId) return

    let cancelled = false

    const fetchTeam = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await axios.get<{ site: Site }>(`/api/team/${siteId}`)
        if (!cancelled) setTeam(res.data.site)
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


