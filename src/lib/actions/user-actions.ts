"use server";

import bcrypt from "bcrypt";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function completeProfile(formData: FormData) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const image = formData.get("image") as string | null;

    if (!name || name.trim().length < 2) {
        return { error: "Name must be at least 2 characters." };
    }

    if (!username || username.trim().length < 3) {
        return { error: "Username must be at least 3 characters." };
    }

    // Basic username validation (alphanumeric + dashes/underscores)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        return { error: "Username can only contain letters, numbers, underscores, and dashes." };
    }

    try {
        // Check uniqueness
        const existingUser = await db.user.findFirst({
            where: {
                username: { equals: username, mode: "insensitive" },
                id: { not: session.user.id }, // Exclude self
            },
        });

        if (existingUser) {
            return { error: "Username is already taken." };
        }

        // Update user
        await db.user.update({
            where: { id: session.user.id },
            data: {
                name,
                username,
                image: image || session.user.image, // Keep old image if not provided
            },
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Profile completion error:", error);
        return { error: "Failed to update profile. Please try again." };
    }
}

// ... existing code ...

export async function deleteAccount() {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.user.delete({
            where: { id: session.user.id },
        });
        return { success: true };
    } catch (error: any) {
        console.error("Delete account error:", error);
        return { error: "Failed to delete account" };
    }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
        return { error: "Missing fields" };
    }

    if (newPassword.length < 8) {
        return { error: "New password must be at least 8 characters" };
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.hashedPassword) {
            return { error: "User not found or no password set" };
        }

        const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);

        if (!isValid) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: session.user.id },
            data: { hashedPassword },
        });

        return { success: true };
    } catch (error: any) {
        console.error("Change password error:", error);
        return { error: "Failed to change password" };
    }
}

export async function updateProfile(data: { name: string; image?: string }) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                image: data.image,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Update profile error:", error);
        return { error: "Failed to update profile" };
    }
}
