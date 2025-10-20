"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Fetches the "active team" for the currently logged-in user
 * by extracting siteId from the URL path.
 *
 * @param pathname The current URL pathname (e.g., /dashboard/68f4da67a116560fc8c2a2eb)
 */
export async function getActiveTeam(pathname: string, analytics?: string) {
  const user = await getAuthSession();
  if (!user?.user?.id) return null;

  // Extract siteId from pathname
  // Assumes URL structure: /dashboard/:siteId

  if (!pathname) return null;

  // Fetch the team
  const team = await db.site.findFirst({
    where: {
      id: pathname,
      userId: user.user.id, // ensures user owns this team
    },
    include: {
      subscription: true,
      features: true,
      Post: true,
      Category: true,
      AnalyticsEvent: analytics ? true : false,
    },
  });

  return team; // null if not found or user has no access
}
