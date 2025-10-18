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
}

export interface Subscription {
  id: string
  price: number
  billing_cycle: string
  next_billing_date: string
  userId?: string
  createdAt?: string
}

interface ApiResponse {
  site: Site | null
  subscription: Subscription | null
}

export function useSite() {
  const [site, setSite] = useState<Site | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get<ApiResponse>("/api/projects/website")

        if (res.data) {
          setSite(res.data.site)
          setSubscription(res.data.subscription)
        } else {
          setSite(null)
          setSubscription(null)
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch site data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { site, subscription, loading, error }
}
