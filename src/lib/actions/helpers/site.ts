"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getSite() {
  const user = await getAuthSession();
  if (!user) return null;

  const site = db.site.findFirst({
    where: {
      OR: [
        { userId: user.user.id },
        { members: { some: { id: user.user.id } } }
      ]
    },
    include: {
      subscription: true,
      features: true,
    },
  });

  // Explicit return type so TypeScript knows what this object looks like
  return site
}

export async function getSites() {
  const user = await getAuthSession();
  if (!user) return [];

  const sites = await db.site.findMany({
    where: {
      OR: [
        { userId: user.user.id },
        { members: { some: { id: user.user.id } } }
      ]
    },
    include: {
      subscription: true,
      features: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return sites
}
