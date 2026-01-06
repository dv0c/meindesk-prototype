"use server"

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Get user with current password
        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: { hashedPassword: true }
        })

        if (!user?.hashedPassword) {
            return { success: false, error: "No password set. You may be using OAuth login." }
        }

        // Verify current password
        const isValid = await bcrypt.compare(data.currentPassword, user.hashedPassword)
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        // Update password
        await db.user.update({
            where: { email: session.user.email },
            data: { hashedPassword }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to change password:", error)
        return { success: false, error: "Failed to change password" }
    }
}

export async function updateProfile(data: { name?: string; image?: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    try {
        const user = await db.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                image: data.image,
            },
        })

        revalidatePath("/")
        return { success: true, user }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

export async function deleteAccount() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    try {
        await db.user.delete({
            where: { email: session.user.email },
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to delete account:", error)
        return { success: false, error: "Failed to delete account" }
    }
}

// Admin only search
export async function searchUsers(query: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return []

    if (!query || query.length < 2) return []

    try {
        const users = await db.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } }
                ]
            },
            take: 10,
            select: { id: true, name: true, email: true, image: true }
        })
        return users
    } catch (error) {
        return []
    }
}
