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
}

export function useSite() {
  const [site, setSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSite = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get<Site | null>("/api/projects/website")
        setSite(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch site")
      } finally {
        setLoading(false)
      }
    }

    fetchSite()
  }, [])

  return { site, loading, error }
}
