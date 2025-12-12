import { db } from "@/lib/db";
import pLimit from "p-limit";
import { createArticleFromRss } from "@/lib/actions/helpers/create-article-from-rss";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // Security: Use environment variable instead of hardcoded key
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sites = await db.site.findMany({
      include: { RSS: { where: { autoImport: true } } },
    });

    let updatedFeeds = 0;
    const details: any[] = [];

    // Get the base URL dynamically (not hardcoded localhost)
    const baseUrl = request.url.includes("localhost")
      ? "http://localhost:3000"
      : `https://${new URL(request.url).hostname}`;

    // Process feeds in parallel with concurrency limit
    const siteLimit = pLimit(5);

    await Promise.all(
      sites.map((site) =>
        siteLimit(async () => {
          // Process all RSS feeds for this site in parallel
          const feedLimit = pLimit(3);

          await Promise.all(
            site.RSS.map((rss) =>
              feedLimit(async () => {
                const feedDetail: any = {
                  site: site.title,
                  feed: rss.title,
                  added: 0,
                  imported: 0,
                  autoImport: rss.autoImport,
                };

                // Skip feeds without autoImport (already filtered in query)
                if (!rss.autoImport) {
                  details.push(feedDetail);
                  return;
                }

                try {
                  // Fetch live RSS JSON
                  const apiUrl = `${baseUrl}/api/team/${site.id}/rss?url=${encodeURIComponent(
                    rss.url!
                  )}`;

                  const response = await fetch(apiUrl, {
                    cache: "no-store",
                    headers: { "User-Agent": "RSS-Sync-Bot/1.0" }
                  });

                  if (!response.ok) {
                    console.error(`Failed to fetch feed ${rss.title}: HTTP ${response.status}`);
                    details.push(feedDetail);
                    return;
                  }

                  const feedJson = await response.json();
                  const items = feedJson.items || [];

                  if (!items.length) {
                    details.push(feedDetail);
                    return;
                  }

                  // Batch: Get all existing RSS item links to check duplicates
                  const existingItems = await db.rssItem.findMany({
                    where: { rssId: rss.id },
                    select: { link: true },
                  });
                  const existingLinks = new Set(existingItems.map((i) => i.link));

                  // Filter out items that already exist
                  const newItems = items.filter((item: any) => !existingLinks.has(item.link));

                  // Batch insert new RSS items if any
                  if (newItems.length > 0) {
                    await db.rssItem.createMany({
                      data: newItems.map((item: any) => ({
                        rssId: rss.id,
                        title: item.title || "Untitled",
                        site_name: item.site?.title || rss.title || "Unknown",
                        link: item.link,
                        description: item.description || "",
                        thumbnail: item.thumbnail || null,
                        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                        content: item.content || item.description || "",
                        author: item.author || item.site?.title || null,
                        categories: item.categories || [],
                        guid: item.guid || item.link,
                      })),
                    });
                    feedDetail.added = newItems.length;
                  }

                  updatedFeeds++;

                  // Auto-import to Articles
                  const rssItems = await db.rssItem.findMany({
                    where: { rssId: rss.id },
                  });

                  // Batch: Fetch all existing articles for this site
                  const existingArticles = await db.article.findMany({
                    where: {
                      siteId: site.id,
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

                  const limit = pLimit(5);
                  let importedCount = 0;

                  await Promise.all(
                    rssItems.map((item) =>
                      limit(async () => {
                        // Check if already imported
                        if (existingSourceIds.has(item.id)) {
                          return;
                        }

                        // Skip if site has no userId
                        if (!site.userId) {
                          return;
                        }

                        try {
                          await createArticleFromRss({
                            siteId: site.id,
                            authorId: site.userId,
                            rssId: rss.id,
                            rssItem: item,
                            existingSlugs,
                          });
                          importedCount++;
                        } catch (err: any) {
                          console.error(
                            `Failed to import RSS item ${item.id} to article:`,
                            err.message
                          );
                        }
                      })
                    )
                  );

                  feedDetail.imported = importedCount;
                  details.push(feedDetail);
                } catch (err: any) {
                  console.error(`Error processing feed ${rss.title}:`, err.message);
                  details.push({ ...feedDetail, error: err.message });
                }
              })
            )
          );
        })
      )
    );

    return new Response(
      JSON.stringify({ status: "ok", updatedFeeds, details }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Auto-import error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
