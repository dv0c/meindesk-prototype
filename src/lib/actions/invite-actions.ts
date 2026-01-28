"use server"

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function inviteUserToSite(siteId: string, email: string) {
    const session = await getAuthSession()
    if (!session?.user) {
        return { error: "Unauthorized" }
    }

    try {
        // 1. Check if user exists
        const userToInvite = await db.user.findUnique({
            where: { email },
        })

        if (!userToInvite) {
            // TODO: Create Invitation record for non-user email
            return { error: "User not found. Invite via email coming soon." }
        }

        // 2. Check if already a member
        const site = await db.site.findUnique({
            where: { id: siteId },
            include: { members: true }
        })

        if (!site) return { error: "Project not found" }

        const isAlreadyMember = site.members.some(m => m.id === userToInvite.id) || site.userId === userToInvite.id
        if (isAlreadyMember) {
            return { error: "User is already a member of this project." }
        }

        // 3. Add to members
        await db.site.update({
            where: { id: siteId },
            data: {
                members: {
                    connect: { id: userToInvite.id }
                }
            }
        })

        revalidatePath(`/dashboard/${siteId}/projects/settings/team`)
        return { success: true }
    } catch (error) {
        console.error("Invite error:", error)
        return { error: "Failed to invite user." }
    }
}

export async function removeUserFromSite(siteId: string, userId: string) {
    const session = await getAuthSession()
    if (!session?.user) return { error: "Unauthorized" }

    const site = await db.site.findUnique({
        where: { id: siteId },
        select: { userId: true } // get owner id
    })

    if (!site) return { error: "Project not found" }
    if (site.userId !== session.user.id) return { error: "Only the owner can remove members." }

    try {
        await db.site.update({
            where: { id: siteId },
            data: {
                members: {
                    disconnect: { id: userId }
                }
            }
        })

        revalidatePath(`/dashboard/${siteId}/projects/settings/team`)
        return { success: true }
    } catch (error) {
        console.error("Remove member error:", error)
        return { error: "Failed to remove member." }
    }
}
