"use server"

import { Role } from "@prisma/client"
import { db } from "../db"
import { getAuthSession } from "../auth"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const IMPERSONATION_COOKIE_NAME = "impersonation_token"

interface UpdateUserRoleResult {
  success?: boolean
  error?: string
  message?: string
}

export async function updateUserRole(formData: FormData): Promise<UpdateUserRoleResult> {
  const session = await getAuthSession()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Unauthorized: You must be an admin to perform this action." }
  }

  const userIdToUpdate = formData.get("userIdToUpdate") as string
  const newRole = formData.get("newRole") as Role

  if (!userIdToUpdate || !newRole) {
    return { error: "User ID and new role are required." }
  }

  if (!Object.values(Role).includes(newRole)) {
    return { error: "Invalid role specified." }
  }

  // Prevent admin from changing their own role through this specific action
  // They can't select themselves in the UI, but good to double check
  if (userIdToUpdate === session.user.id) {
    return { error: "Admins cannot change their own role using this form." }
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: userIdToUpdate },
      data: { role: newRole },
    })
    revalidatePath("/admin/user-management")
    return { success: true, message: `User ${updatedUser.name || updatedUser.email}'s role updated to ${newRole}.` }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { error: "Failed to update user role. Please check server logs." }
  }
}

export async function startImpersonation(targetUserId: string) {
  const session = await getAuthSession()

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Unauthorized: Only admins can impersonate users.")
  }

  if (session.user.id === targetUserId) {
    throw new Error("Admins cannot impersonate themselves.")
  }

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
  })

  if (!targetUser) {
    throw new Error("Target user not found.")
  }

  // Cannot impersonate another admin directly via this mechanism for safety.
  // If this is desired, this check can be removed, but be cautious.
  if (targetUser.role === Role.ADMIN) {
    throw new Error("Cannot impersonate another administrator.")
  }

  const impersonationData = {
    targetUserId: targetUser.id,
    originalAdminId: session.user.id,
  }

  cookies().set(IMPERSONATION_COOKIE_NAME, JSON.stringify(impersonationData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    // maxAge: 60 * 60 * 1, // 1 hour, optional
  })

  // Redirect to force session re-evaluation
  redirect("/")
}

export async function stopImpersonation() {
  const session = await getAuthSession()
  if (!session?.user.isImpersonating) {
    // No active impersonation, or not called by an impersonating user
    // This could happen if called directly, but UI should prevent it.
    // Silently redirect or throw a soft error.
    redirect("/")
    return
  }

  cookies().delete(IMPERSONATION_COOKIE_NAME)

  // Redirect to force session re-evaluation
  redirect("/")
}

// ... (keep existing actions if any, or add new ones below)
