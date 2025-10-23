"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

// cached function — no dynamic calls allowed here
const _getActiveTeamCached = unstable_cache(
  async (userId: string, siteId: string, analytics?: string) => {
    if (!siteId || !userId) return null;

    return await db.site.findFirst({
      where: { id: siteId, userId },
      include: {
        subscription: true,
        features: true,
        Article: true,
        Category: true,
        AnalyticsEvent: analytics ? true : false,
      },
    });
  },
  ["get-active-team"],
  { tags: ["active-team"] }
);

// wrapper that handles session and passes userId into cached layer
export async function getActiveTeam(siteId: string, analytics?: string) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  return _getActiveTeamCached(userId, siteId, analytics);
}
