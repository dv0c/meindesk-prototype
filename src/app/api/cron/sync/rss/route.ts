import { db } from "@/lib/db";
import slugify from "slugify";
import pLimit from "p-limit";

const ONE_TO_ONE_KEY = "a15bdb70-675a-4772-96da-592eb7b03b15";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== ONE_TO_ONE_KEY) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sites = await db.site.findMany({
      include: { RSS: true },
    });

    let updatedFeeds = 0;
    const details: any[] = [];

    for (const site of sites) {
      for (const rss of site.RSS) {
        const feedDetail: any = {
          site: site.title,
          feed: rss.title,
          added: 0,
          imported: 0,
          autoImport: rss.autoImport,
        };

        // 1️⃣ Skip feeds without autoImport
        if (!rss.autoImport) {
          details.push(feedDetail);
          continue;
        }

        // 2️⃣ Fetch live RSS JSON
        const apiUrl = `http://localhost:3000/api/team/0/rss?url=${encodeURIComponent(
          rss.url!
        )}`;
        const response = await fetch(apiUrl, { cache: "no-store" });
        if (!response.ok) {
          details.push(feedDetail);
          continue;
        }

        const feedJson = await response.json();
        const items = feedJson.items || [];

        if (!items.length) {
          details.push(feedDetail);
          continue;
        }

        // 3️⃣ Save new RssItems (skip duplicates by link)
        for (const item of items) {
          const exists = await db.rssItem.findFirst({
            where: { link: item.link },
          });

          if (!exists) {
            await db.rssItem.create({
              data: {
                rssId: rss.id,
                title: item.title || "Untitled",
                site_name: item.site.title,
                link: item.link,
                description: item.description || "",
                thumbnail: item.thumbnail || null,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                content: item.content || item.description || "",
                author: item.author || item.site?.title || null,
                categories: item.categories || [],
                guid: item.guid || item.link,
              },
            });
            feedDetail.added++;
          }
        }

        updatedFeeds++;

        // 4️⃣ Auto-import to Articles
        const rssItems = await db.rssItem.findMany({
          where: { rssId: rss.id },
        });

        const limit = pLimit(5);
        let importedCount = 0;

        await Promise.all(
          rssItems.map((item) =>
            limit(async () => {
              const slug = slugify(item.title || "Untitled", {
                lower: true,
                strict: true,
              }).slice(0, 80);

              const duplicateArticle = await db.article.findFirst({
                where: {
                  siteId: site.id,
                  OR: [{ sourceId: item.id, sourceType: "RSS" }, { slug }],
                },
              });

              if (!duplicateArticle) {
                await db.article.create({
                  data: {
                    siteId: site.id,
                    title: item.title,
                    slug,
                    excerpt: item.description?.slice(0, 250) || null,
                    html: item.content || item.description || "",
                    cover: item.thumbnail || null,
                    status: "DRAFT",
                    content: JSON.parse(
                      `{"root":{"children":[{"children":[{"detail":0,"format":8,"mode":"normal","style":"font-size: 13px;","text":"Source provided by ","type":"text","version":1},{"children":[{"detail":0,"format":8,"mode":"normal","style":"font-size: 13px;","text":"${item.site_name}","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"link","version":1,"textFormat":8,"textStyle":"font-size: 13px;","rel":"noreferrer","target":null,"title":null,"url":"${item.link}"}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":8,"textStyle":"font-size: 13px;"}],"direction":null,"format":"","indent":0,"type":"root","version":1,"textFormat":8,"textStyle":"font-size: 13px;"}}`
                    ),
                    sourceType: "RSS",
                    categories: item.categories,
                    sourceId: item.id,
                    authorId: site.userId, // make sure this is valid
                    metadata: {
                      link: item.link,
                      rssId: rss.id,
                      importedAt: new Date().toISOString(),
                    },
                  },
                });
                importedCount++;
              }
            })
          )
        );

        feedDetail.imported = importedCount;
        details.push(feedDetail);
      }
    }

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
