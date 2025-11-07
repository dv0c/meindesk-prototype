// context/SiteContext.tsx
"use client"

import { createContext, useContext, useMemo } from "react"
import { useParams } from "next/navigation"

const SiteContext = createContext<{ siteId: string | null }>({ siteId: null })

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const siteId = useMemo(() => {
    if (!params?.siteId) return null
    return Array.isArray(params.siteId) ? params.siteId[0] : params.siteId
  }, [params])

  return (
    <SiteContext value={{ siteId }}>
      {children}
    </SiteContext>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider")
  }
  return context
}
