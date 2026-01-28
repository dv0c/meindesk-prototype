"use server"

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireSiteAccess } from "@/lib/security/route-auth"

export async function getChannels(siteId: string) {
    const session = await getAuthSession()
    if (!session?.user) return []

    try {
        await requireSiteAccess(siteId, session.user.id)

        const channels = await db.channel.findMany({
            where: { siteId },
            orderBy: { createdAt: 'asc' }
        })

        return channels
    } catch (error) {
        console.error("Get channels error:", error)
        return []
    }
}

export async function createChannel(siteId: string, name: string, type: "TEXT" | "VOICE" = "TEXT") {
    const session = await getAuthSession()
    if (!session?.user) return { error: "Unauthorized" }

    if (!name.trim()) return { error: "Channel name is required" }

    try {
        if (!/^[a-z0-9-]+$/.test(name)) {
            return { error: "Channel name must be lowercase, alphanumeric, and dashes only." }
        }

        await requireSiteAccess(siteId, session.user.id)

        const existing = await db.channel.findFirst({
            where: { siteId, name }
        })

        if (existing) {
            return { error: "Channel already exists" }
        }

        const channel = await db.channel.create({
            data: {
                name,
                type,
                siteId
            }
        })

        revalidatePath(`/dashboard/${siteId}/chat`)
        return { success: true, channel }
    } catch (error) {
        console.error("Create channel error:", error)
        return { error: "Failed to create channel" }
    }
}

export async function deleteChannel(siteId: string, channelId: string) {
    const session = await getAuthSession()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        // Only owners/admins might want to delete, but for now reuse standard access
        await requireSiteAccess(siteId, session.user.id)

        await db.channel.delete({
            where: { id: channelId, siteId } // ensure belongs to site
        })

        revalidatePath(`/dashboard/${siteId}/chat`)
        return { success: true }
    } catch (error) {
        console.error("Delete channel error:", error)
        return { error: "Failed to delete channel" }
    }
}
