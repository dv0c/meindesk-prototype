"use client"

import { useEffect, useState } from "react"
import axios, { AxiosError } from "axios"

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Generic data fetching hook
 * @param url API endpoint to fetch from
 */
export function useFetch<T = any>(url: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return

    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const res = await axios.get<T>(url)
        if (!cancelled) {
          setData(res.data)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            (err as AxiosError)?.response?.data?.error ||
            (err as Error).message ||
            "Failed to fetch data"
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [url])

  return { data, loading, error }
}
