"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Rss } from "@prisma/client";

export async function SaveFeed({
  data,
  siteId,
  feedItems,
}: {
  data: Omit<Rss, "id" | "createdAt" | "updatedAt">;
  feedItems: any[];
  siteId: string;
}) {
  const session = await getAuthSession();

  if (!session?.user.id) {
    return "Not authorized";
  }

  // 1. Create the feed
  const feed = await db.rss.create({
    data: { ...data },
  });

  if (!feed) {
    return "An error has occurred";
  }

  // 2. Insert feed items concurrently with duplicate check
  if (feedItems?.length) {
    try {
      await Promise.all(
        feedItems.map(async (item) => {
          // Step 1: Normalize identifying fields
          const guid = item.guid || item.link || null;
          if (!guid) return; // skip broken items with no identity

          // Step 2: Check if this item already exists for this feed
          const existing = await db.rssItem.findFirst({
            where: {
              OR: [
                { guid },
                { link: item.link || "" },
              ],
              rssId: feed.id,
            },
            select: { id: true },
          });

          if (existing) return; // skip duplicates

          // Step 3: Create the new item
          await db.rssItem.create({
            data: {
              guid,
              title: item.title || "Untitled",
              link: item.link || "",
              description: item.description || "",
              thumbnail: item.thumbnail || null,
              site_name: item.site.title,
              publishedAt: item.publishedAt
                ? new Date(item.publishedAt)
                : new Date(),
              content: item.content || item.description || "",
              author: item.author || item.site?.title || null,
              categories: item.categories || [],
              rssId: feed.id,
            },
          });
        })
      );
    } catch (err) {
      console.error("Error creating feed items:", err);
      // rollback feed if necessary
      await db.rss.delete({ where: { id: feed.id } });
      throw new Error("Failed to save feed items");
    }
  }

  // 3. Return response
  return {
    url: `/dashboard/${siteId}/projects/website/rss/feed/${feed.url}`,
    rss: feed,
  };
}
