"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { ActivityAction } from "@/generated/client"

interface LogActivityParams {
    siteId: string
    action: ActivityAction
    entity: string
    entityId?: string
    entityName?: string
    metadata?: Record<string, any>
}

/**
 * Logs an activity for audit tracking.
 * Should be called after successful operations (create, update, delete, etc.)
 */
export async function logActivity({
    siteId,
    action,
    entity,
    entityId,
    entityName,
    metadata,
}: LogActivityParams) {
    try {
        const session = await getAuthSession()
        if (!session?.user?.id) return null

        return await db.activityLog.create({
            data: {
                siteId,
                userId: session.user.id,
                action,
                entity,
                entityId,
                entityName,
                metadata: metadata ?? undefined,
            },
        })
    } catch (error) {
        console.error("[logActivity] Failed to log activity:", error)
        return null
    }
}

/**
 * Get activity logs for a site with pagination
 */
export async function getActivityLogs(siteId: string, page = 1, limit = 50) {
    const session = await getAuthSession()
    if (!session?.user?.id) return { logs: [], total: 0 }

    const [logs, total] = await Promise.all([
        db.activityLog.findMany({
            where: { siteId },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: { id: true, name: true, image: true, email: true },
                },
            },
        }),
        db.activityLog.count({ where: { siteId } }),
    ])

    return { logs, total }
}
