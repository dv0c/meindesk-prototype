"use server"

import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
