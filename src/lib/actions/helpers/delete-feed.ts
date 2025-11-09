'use server';
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Delete a feed and its items by feed URL or feed ID.
 */
export async function DeleteFeed({
  feedId,
  siteId,
}: {
  feedId: string; // or use feedUrl: string if you prefer
  siteId: string;
}) {
  const session = await getAuthSession();
  if (!session?.user.id) throw new Error("Not authorized");

  // 1. Find the feed to ensure it exists and belongs to this site
  const feed = await db.rss.findFirst({
    where: { id: feedId, siteId },
  });

  if (!feed) {
    throw new Error("Feed not found or you don't have permission to delete it.");
  }

  // 2. Delete all associated feed items
  await db.rssItem.deleteMany({
    where: { rssId: feed.id },
  });

  // 3. Delete the feed itself
  await db.rss.delete({
    where: { id: feed.id },
  });

  return {
    message: "Feed deleted successfully",
    feedId: feed.id,
    siteId,
  };
}
