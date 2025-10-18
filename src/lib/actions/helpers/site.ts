"use server"

import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getSite() {
  const user = await getAuthSession()
  if (!user) return null

  const [site, subscription] = await Promise.all([
    db.site.findFirst({
      where: {
        userId: user.user.id,
      },
    }),
    db.subscription.findFirst({
      where: {
        userId: user.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ])

  // Explicit return type so TypeScript knows what this object looks like
  return {
    site: site ?? null,
    subscription: subscription ?? null,
  } as const
}
