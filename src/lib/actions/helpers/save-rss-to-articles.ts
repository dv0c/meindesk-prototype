"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import pLimit from "p-limit";
import { createArticleFromRss } from "./create-article-from-rss";

export async function SaveRssToArticles({
  siteId,
  rssId,
  selectedIds,
}: {
  siteId: string;
  rssId: string;
  selectedIds?: string[];
}) {
  const session = await getAuthSession();
  if (!session?.user.id) throw new Error("Not authorized");

  // Verify site ownership
  const site = await db.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) throw new Error("Site not found or not yours");

  // Verify RSS belongs to this site
  const rss = await db.rss.findFirst({
    where: { id: rssId, siteId },
  });
  if (!rss) throw new Error("RSS feed not found for this site");

  // Fetch items
  const rssItems = await db.rssItem.findMany({
    where: {
      rssId,
      ...(selectedIds?.length ? { id: { in: selectedIds } } : {}),
    },
  });

  if (!rssItems.length) return { message: "No feed items found", created: 0 };

  // Batch: Fetch all existing articles for this site to check duplicates
  const existingArticles = await db.article.findMany({
    where: {
      siteId,
      OR: [
        { sourceType: "RSS", sourceId: { in: rssItems.map((i) => i.id) } },
      ],
    },
    select: { sourceId: true, slug: true },
  });

  const existingSourceIds = new Set(
    existingArticles.map((a) => a.sourceId).filter(Boolean)
  );
  const existingSlugs = existingArticles.map((a) => a.slug);

  const limit = pLimit(10); // concurrency limit
  let created = 0;
  let skipped = 0;

  await Promise.all(
    rssItems.map((item) =>
      limit(async () => {
        // Check if already imported by sourceId
        if (existingSourceIds.has(item.id)) {
          skipped++;
          return;
        }

        try {
          await createArticleFromRss({
            siteId,
            authorId: session.user.id,
            rssId,
            rssItem: item,
            existingSlugs,
          });
          created++;
        } catch (err: any) {
          console.error(`Failed to create article from RSS item ${item.id}:`, err.message);
          skipped++;
        }
      })
    )
  );

  return {
    message: `Imported ${created} article(s), skipped ${skipped} duplicate(s).`,
    created,
    skipped,
  };
}
