/**
 * Route Authentication Utilities
 * Centralized authentication and authorization helpers for API routes
 */

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"

/**
 * Require authenticated user
 * Returns session or throws 401 error
 */
export async function requireAuth() {
    const session = await getAuthSession()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    return session
}

/**
 * Require admin role
 * Returns session or throws 401/403 error
 */
export async function requireAdmin() {
    const session = await requireAuth()

    if (session.user.role !== Role.ADMIN) {
        throw new Error("Forbidden: Admin access required")
    }

    return session
}

/**
 * Verify site ownership
 * Checks if the authenticated user owns the specified site
 */
export async function requireSiteOwnership(siteId: string, userId: string) {
    if (!siteId || !userId) {
        throw new Error("Missing siteId or userId")
    }

    const site = await db.site.findFirst({
        where: {
            id: siteId,
            userId: userId
        },
        select: { id: true }
    })

    if (!site) {
        throw new Error("Forbidden: You do not own this site")
    }

    return site
}

/**
 * Verify article ownership
 * Checks if the authenticated user owns the specified article
 */
export async function requireArticleOwnership(articleId: string, userId: string) {
    if (!articleId || !userId) {
        throw new Error("Missing articleId or userId")
    }

    const article = await db.article.findFirst({
        where: {
            id: articleId,
            authorId: userId
        },
        select: { id: true, siteId: true }
    })

    if (!article) {
        throw new Error("Forbidden: You do not own this article")
    }

    return article
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: any, defaultStatus = 500) {
    const message = error?.message || "Internal Server Error"

    // Map specific error messages to status codes
    if (message === "Unauthorized") {
        return NextResponse.json({ error: message }, { status: 401 })
    }

    if (message.startsWith("Forbidden")) {
        return NextResponse.json({ error: message }, { status: 403 })
    }

    if (message.startsWith("Missing") || message.includes("required")) {
        return NextResponse.json({ error: message }, { status: 400 })
    }

    // Log unexpected errors but return generic message
    if (defaultStatus === 500) {
        console.error("[API Error]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }

    return NextResponse.json({ error: message }, { status: defaultStatus })
}
