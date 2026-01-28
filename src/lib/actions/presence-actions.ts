"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

// Update the current user's lastSeen timestamp
export async function updatePresence() {
    const session = await getAuthSession()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: { lastSeen: new Date() }
        })
        return { success: true }
    } catch (error) {
        console.error("Presence update failed:", error)
        return { error: "Failed to update presence" }
    }
}

// Get online members for a specific site
export async function getOnlineMembers(siteId: string) {
    try {
        // 1. Get site with ALL members
        const site = await db.site.findUnique({
            where: { id: siteId },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        lastSeen: true
                    }
                },
                user: { // Also check the owner
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        lastSeen: true
                    }
                }
            }
        })

        if (!site) return []

        // 2. Combine members + owner
        const allUsers = [...site.members]
        if (site.user && !allUsers.some(u => u.id === site.user?.id)) {
            allUsers.push(site.user)
        }

        // 3. Filter 'online' users (active in last 5 minutes)
        // and sort by online status
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

        return allUsers.map(u => {
            const isOnline = u.lastSeen ? u.lastSeen > fiveMinutesAgo : false
            return {
                ...u,
                isOnline
            }
        }).sort((a, b) => {
            // Online first
            if (a.isOnline && !b.isOnline) return -1
            if (!a.isOnline && b.isOnline) return 1
            return 0
        })

    } catch (error) {
        console.error("Get online members failed:", error)
        return []
    }
}
