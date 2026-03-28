"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

const _getActiveTeamCached = unstable_cache(
  async (userId: string, siteId: string) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!siteId || !userId || !objectIdRegex.test(siteId)) return null;

    return await db.site.findFirst({
      where: {
        id: siteId,
        OR: [{ userId }, { members: { some: { id: userId } } }],
      },
      include: {
        features: true,
      },
    });
  },
  ["get-active-team-v3"],
  { tags: ["active-team"] }
);

export async function getActiveTeam(siteId: string) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  return _getActiveTeamCached(userId, siteId);
}
