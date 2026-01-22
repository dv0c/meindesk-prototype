"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const IMPERSONATION_COOKIE_NAME = "impersonation_token"

export async function impersonateUser(targetUserId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const cookieStore = await cookies()

  // Store the original admin ID and the target user ID
  const payload = JSON.stringify({
    targetUserId,
    originalAdminId: session.user.id
  })

  cookieStore.set(IMPERSONATION_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  redirect("/dashboard")
}

export async function stopImpersonating() {
  const cookieStore = await cookies()
  cookieStore.delete(IMPERSONATION_COOKIE_NAME)
  redirect("/admin")
}

export async function getAdminUsers(query: string = "") {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true
    }
  })

  return users
}
