"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface AnalyticsTrackerProps {
    siteId: string
    dedupeKey?: string | null
    ingestToken?: string | null
}

const VISITOR_COOKIE = "_md_vid"
const SESSION_KEY = "_md_sid"

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days: number) {
    const d = new Date()
    d.setTime(d.getTime() + days * 86400000)
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`
}

function getVisitorId(): string {
    const existing = getCookie(VISITOR_COOKIE)
    if (existing) return existing
    const id = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    setCookie(VISITOR_COOKIE, id, 365)
    return id
}

function getSessionId(): string | null {
    try {
        const existing = sessionStorage.getItem(SESSION_KEY)
        if (existing) return existing
        const id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
        sessionStorage.setItem(SESSION_KEY, id)
        return id
    } catch {
        return null
    }
}

function detectArticleSlug(pathname: string): string | null {
    const patterns = [
        /^\/article\/([^/]+)\/?$/,
        /^\/articles\/([^/]+)\/?$/,
        /^\/blog\/([^/]+)\/?$/,
        /^\/news\/([^/]+)\/?$/,
        /^\/post\/([^/]+)\/?$/,
        /^\/p\/([^/]+)\/?$/,
        /\/projects\/website\/articles\/[^/]+\/editor$/,
    ]
    for (const pattern of patterns) {
        const match = pathname.match(pattern)
        if (match?.[1]) return match[1]
    }
    // Dashboard article editor: extract from path segment
    const editorMatch = pathname.match(/\/articles\/([a-f0-9]{24})\/editor/)
    if (editorMatch) return editorMatch[1]
    return null
}

function detectContentType(pathname: string): { contentType?: string; contentId?: string } {
    if (detectArticleSlug(pathname)) {
        const slug = detectArticleSlug(pathname)
        return { contentType: "article", contentId: slug ?? undefined }
    }
    if (/^\/pages?\//.test(pathname)) {
        return { contentType: "page", contentId: pathname.split("/").filter(Boolean).pop() }
    }
    if (/categor/.test(pathname)) {
        return { contentType: "category", contentId: pathname }
    }
    return {}
}

export function AnalyticsTracker({ siteId, dedupeKey, ingestToken }: AnalyticsTrackerProps) {
    const pathname = usePathname()
    const tracked = useRef<Set<string>>(new Set())

    useEffect(() => {
        const key = `${siteId}:${dedupeKey ?? ""}:${pathname}`
        if (tracked.current.has(key)) return
        tracked.current.add(key)

        const articleSlug = detectArticleSlug(pathname)
        const content = detectContentType(pathname)

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
                        eventType: "page_view",
                        visitorId: getVisitorId(),
                        sessionId: getSessionId(),
                        articleSlug,
                        contentType: content.contentType,
                        contentId: content.contentId,
                        ...(ingestToken ? { ingestToken } : {}),
                    }),
                })
            } catch (error) {
                console.error("Analytics tracking failed:", error)
            }
        }

        trackPageView()
    }, [siteId, dedupeKey, pathname, ingestToken])

    return null
}

/** Track custom events from React components */
export async function trackAnalyticsEvent(
    siteId: string,
    eventType: string,
    metadata?: Record<string, unknown>,
    path?: string
) {
    try {
        await fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                siteId,
                path: path ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
                referrer: typeof document !== "undefined" ? document.referrer : null,
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
                eventType,
                visitorId: getVisitorId(),
                sessionId: getSessionId(),
                metadata,
            }),
        })
    } catch {
        // silent
    }
}
