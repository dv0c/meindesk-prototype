"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getSite() {
  const user = await getAuthSession();
  if (!user) return null;

  const site = db.site.findFirst({
    where: {
      userId: user.user.id,
    },
    include: {
      subscription: true,
    },
  });

  // Explicit return type so TypeScript knows what this object looks like
  return site
}
