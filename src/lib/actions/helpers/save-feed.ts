"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Rss } from "@prisma/client";

export async function SaveFeed({
  data,
  siteId,
  feedItems,
}: {
  data: Omit<Rss, "id" | "createdAt" | "updatedAt"> & { site_name: any };
  feedItems: any[];
  siteId: string;
}) {
  const session = await getAuthSession();
  if (!session?.user.id) throw new Error("Not authorized");

  // 1. Check if feed already exists by URL & siteId
  let feed = await db.rss.findFirst({
    where: { url: data.url, siteId },
  });

  if (feed) {
    // 2. Update existing feed
    feed = await db.rss.update({
      where: { id: feed.id },
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        autoImport: data.autoImport ?? feed.autoImport,
      },
    });
  } else {
    // 3. Create new feed (exclude site_name as it's only for RssItem)
    const { site_name, ...rssData } = data;
    feed = await db.rss.create({
      data: { ...rssData, siteId },
    });
  }

  // 4. Insert/update feed items concurrently
  if (feedItems?.length) {
    await Promise.all(
      feedItems.map(async (item) => {
        const guid = item.guid || item.link || null;
        if (!guid) return;

        const existingItem = await db.rssItem.findFirst({
          where: {
            OR: [{ guid }, { link: item.link || "" }],
            rssId: feed.id,
          },
          select: { id: true },
        });

        if (!existingItem) {
          await db.rssItem.create({
            data: {
              guid,
              title: item.title || "Untitled",
              link: item.link || "",
              description: item.description || "",
              thumbnail: item.thumbnail || null,
              site_name: item.site?.title || feed.title,
              publishedAt: item.publishedAt
                ? new Date(item.publishedAt)
                : new Date(),
              content: item.content || item.description || "",
              author: item.author || item.site?.title || null,
              categories: item.categories || [],
              rssId: feed.id,
            },
          });
        }
      })
    );
  }

  return {
    url: `/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(
      feed.url as string
    )}`,
    rss: feed,
  };
}
