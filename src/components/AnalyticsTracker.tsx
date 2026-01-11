"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface AnalyticsTrackerProps {
    siteUrl: string // The site's URL for looking up in DB
}

export function AnalyticsTracker({ siteUrl }: AnalyticsTrackerProps) {
    const pathname = usePathname()
    const tracked = useRef<Set<string>>(new Set())

    useEffect(() => {
        // Avoid double-tracking the same path in the same session
        const key = `${siteUrl}:${pathname}`
        if (tracked.current.has(key)) return
        tracked.current.add(key)

        // Send analytics event
        const trackPageView = async () => {
            try {
                await fetch("/api/analytics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: siteUrl,
                        path: pathname,
                        referrer: typeof document !== "undefined" ? document.referrer : null,
                        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
                    }),
                })
            } catch (error) {
                // Silently fail - analytics should not break the page
                console.error("Analytics tracking failed:", error)
            }
        }

        trackPageView()
    }, [siteUrl, pathname])

    return null // This component renders nothing
}
