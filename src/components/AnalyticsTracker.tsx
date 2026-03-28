"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface AnalyticsTrackerProps {
    siteId: string
    /** Optional label for deduplicating session keys (e.g. public site URL) */
    dedupeKey?: string | null
    /** HMAC ingest token from server when ANALYTICS_INGEST_SECRET is set */
    ingestToken?: string | null
}

export function AnalyticsTracker({ siteId, dedupeKey, ingestToken }: AnalyticsTrackerProps) {
    const pathname = usePathname()
    const tracked = useRef<Set<string>>(new Set())

    useEffect(() => {
        const key = `${siteId}:${dedupeKey ?? ""}:${pathname}`
        if (tracked.current.has(key)) return
        tracked.current.add(key)

        const trackPageView = async () => {
            try {
                await fetch("/api/analytics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        siteId,
                        path: pathname,
                        referrer: typeof document !== "undefined" ? document.referrer : null,
                        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
                        ...(ingestToken ? { ingestToken } : {}),
                    }),
                })
            } catch (error) {
                console.error("Analytics tracking failed:", error)
            }
        }

        trackPageView()
    }, [siteId, dedupeKey, pathname, ingestToken])

    return null // This component renders nothing
}
