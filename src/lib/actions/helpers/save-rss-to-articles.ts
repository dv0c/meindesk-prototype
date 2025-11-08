"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import slugify from "slugify";
import pLimit from "p-limit";

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

  const limit = pLimit(10); // concurrency limit
  let created = 0;
  let skipped = 0;

  await Promise.all(
    rssItems.map((item) =>
      limit(async () => {
        const title = item.title?.trim() || "Untitled Article";
        const slug = slugify(title, { lower: true, strict: true }).slice(0, 80);

        // Check for duplicates
        const existing = await db.article.findFirst({
          where: {
            siteId,
            OR: [{ sourceId: item.id, sourceType: "RSS" }, { slug }],
          },
        });

        if (existing) {
          skipped++;
          return;
        }

        await db.article.create({
          data: {
            siteId,
            title,
            slug,
            excerpt: item.description?.slice(0, 250) || null,
            html: item.content || item.description || "",
            cover: item.thumbnail || null,
            status: "DRAFT",
            content: JSON.parse(
              `{"root":{"children":[{"children":[{"detail":0,"format":8,"mode":"normal","style":"font-size: 13px;","text":"Source provided by ","type":"text","version":1},{"children":[{"detail":0,"format":8,"mode":"normal","style":"font-size: 13px;","text":"${item.site_name}","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"link","version":1,"textFormat":8,"textStyle":"font-size: 13px;","rel":"noreferrer","target":null,"title":null,"url":"${item.link}"}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":8,"textStyle":"font-size: 13px;"}],"direction":null,"format":"","indent":0,"type":"root","version":1,"textFormat":8,"textStyle":"font-size: 13px;"}}`
            ),
            sourceType: "RSS",
            sourceId: item.id,
            authorId: session.user.id,
            metadata: {
              link: item.link,
              rssId,
              importedAt: new Date().toISOString(),
            },
          },
        });
        created++;
      })
    )
  );

  return {
    message: `Imported ${created} article(s), skipped ${skipped} duplicate(s).`,
    created,
    skipped,
  };
}
