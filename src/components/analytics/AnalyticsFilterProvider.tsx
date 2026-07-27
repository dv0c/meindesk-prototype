"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { AnalyticsFilterState } from "@/lib/analytics/types"

interface AnalyticsFilterContextValue {
  filters: AnalyticsFilterState
  setFilters: (next: AnalyticsFilterState | ((prev: AnalyticsFilterState) => AnalyticsFilterState)) => void
  preset: string
  setPreset: (preset: string) => void
}

const AnalyticsFilterContext = createContext<AnalyticsFilterContextValue | null>(null)

export function AnalyticsFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    preset: "last30Days",
    compareMode: "previous_period",
  })

  const preset = filters.preset ?? "last30Days"

  const setPreset = (p: string) => {
    setFilters((prev) => ({ ...prev, preset: p, from: undefined, to: undefined }))
  }

  const value = useMemo(
    () => ({ filters, setFilters, preset, setPreset }),
    [filters, preset]
  )

  return (
    <AnalyticsFilterContext.Provider value={value}>
      {children}
    </AnalyticsFilterContext.Provider>
  )
}

export function useAnalyticsFilters() {
  const ctx = useContext(AnalyticsFilterContext)
  if (!ctx) {
    throw new Error("useAnalyticsFilters must be used within AnalyticsFilterProvider")
  }
  return ctx
}

/** Returns null when rendered outside AnalyticsFilterProvider */
export function useOptionalAnalyticsFilters() {
  return useContext(AnalyticsFilterContext)
}
