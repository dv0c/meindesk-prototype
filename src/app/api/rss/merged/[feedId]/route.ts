import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeWithTemplate } from "@/lib/rss/scraper";
import { safeFetch } from "@/lib/rss/fetch-utils";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

interface FeedSource {
    type: "url" | "template";
    value: string;
}

interface FilterRules {
    include?: string[];
    exclude?: string[];
}

interface FeedItem {
    title: string;
    link: string;
    description?: string | null;
    thumbnail?: string | null;
    pubDate?: string | null;
    author?: string | null;
    source?: string;
}

/**
 * Public Merged Feed Endpoint
 * 
 * GET /api/rss/merged/[feedId]
 * 
 * Returns RSS 2.0 XML with merged and filtered items
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ feedId: string }> }
) {
    const { feedId } = await params;

    try {
        const feed = await db.mergedFeed.findUnique({
            where: { id: feedId },
        });

        if (!feed) {
            return NextResponse.json({ error: "Feed not found" }, { status: 404 });
        }

        const sources = feed.sources as FeedSource[];
        const filters = (feed.filters as FilterRules) || {};

        // Fetch all sources in parallel
        const allItems: FeedItem[] = [];

        console.log(`[MergedFeed] Fetching ${sources.length} sources...`);

        await Promise.all(
            sources.map(async (source) => {
                try {
                    console.log(`[MergedFeed] Fetching: ${source.value}`);
                    const items = await fetchSource(source);
                    console.log(`[MergedFeed] Got ${items.length} items from ${source.value}`);
                    allItems.push(...items);
                } catch (err: any) {
                    console.error(`[MergedFeed] Failed to fetch source ${source.value}:`, err?.message || err);
                }
            })
        );

        console.log(`[MergedFeed] Total items before filtering: ${allItems.length}`);

        // Apply filters
        let filteredItems = allItems;

        if (filters.include && filters.include.length > 0) {
            const includePatterns = filters.include.map(p => p.toLowerCase());
            filteredItems = filteredItems.filter(item => {
                const text = `${item.title} ${item.description || ""}`.toLowerCase();
                return includePatterns.some(pattern => text.includes(pattern));
            });
        }

        if (filters.exclude && filters.exclude.length > 0) {
            const excludePatterns = filters.exclude.map(p => p.toLowerCase());
            filteredItems = filteredItems.filter(item => {
                const text = `${item.title} ${item.description || ""}`.toLowerCase();
                return !excludePatterns.some(pattern => text.includes(pattern));
            });
        }

        // Sort by date (newest first)
        filteredItems.sort((a, b) => {
            if (!a.pubDate) return 1;
            if (!b.pubDate) return -1;
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });

        // Limit items
        filteredItems = filteredItems.slice(0, feed.maxItems || 50);

        // Build RSS XML
        const rssXml = buildRssXml({
            title: feed.name,
            description: feed.description || `Merged feed: ${feed.name}`,
            items: filteredItems,
        });

        return new NextResponse(rssXml, {
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "public, max-age=300",
            },
        });
    } catch (err: any) {
        console.error("Merged feed error:", err.message);
        return NextResponse.json(
            { error: "Failed to generate feed" },
            { status: 500 }
        );
    }
}

async function fetchSource(source: FeedSource): Promise<FeedItem[]> {
    if (source.type === "template") {
        // Fetch from saved template
        const template = await db.customFeedTemplate.findUnique({
            where: { id: source.value },
        });

        if (!template) return [];

        const items = await scrapeWithTemplate({
            targetUrl: template.targetUrl,
            containerSelector: template.containerSelector,
            titleSelector: template.titleSelector,
            linkSelector: template.linkSelector,
            thumbnailSelector: template.thumbnailSelector,
            descriptionSelector: template.descriptionSelector,
            dateSelector: template.dateSelector,
            authorSelector: template.authorSelector,
            maxItems: 20,
        });

        return items.map(item => ({
            ...item,
            source: new URL(template.targetUrl).hostname,
        }));
    } else {
        // Fetch from RSS URL
        return await fetchRssUrl(source.value);
    }
}

async function fetchRssUrl(url: string): Promise<FeedItem[]> {
    const res = await safeFetch(url);
    if (!res || !res.ok) return [];

    const text = await res.text();
    const $ = cheerio.load(text, { xmlMode: true });

    const items: FeedItem[] = [];
    let hostname = "";

    try {
        hostname = new URL(url).hostname;
    } catch { }

    // Parse RSS 2.0 items
    $("item").each((_, el) => {
        const item = $(el);
        const title = item.find("title").text().trim();
        const link = item.find("link").text().trim();

        if (!title || !link) return;

        items.push({
            title,
            link,
            description: item.find("description").text().trim() || null,
            pubDate: item.find("pubDate").text().trim() || null,
            author: item.find("author, dc\\:creator").text().trim() || null,
            thumbnail: item.find("enclosure[type^='image']").attr("url") ||
                item.find("media\\:thumbnail, media\\:content").attr("url") || null,
            source: hostname,
        });
    });

    // Parse Atom entries
    $("entry").each((_, el) => {
        const entry = $(el);
        const title = entry.find("title").text().trim();
        const link = entry.find("link[rel='alternate']").attr("href") ||
            entry.find("link").attr("href") || "";

        if (!title || !link) return;

        items.push({
            title,
            link,
            description: entry.find("summary, content").text().trim() || null,
            pubDate: entry.find("published, updated").text().trim() || null,
            author: entry.find("author name").text().trim() || null,
            source: hostname,
        });
    });

    return items;
}

function escapeXml(str: string | null | undefined): string {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function buildRssXml(config: { title: string; description: string; items: FeedItem[] }): string {
    const itemsXml = config.items
        .map((item) => {
            let xml = `    <item>\n`;
            xml += `      <title>${escapeXml(item.title)}</title>\n`;
            xml += `      <link>${escapeXml(item.link)}</link>\n`;
            xml += `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n`;

            if (item.description) {
                xml += `      <description><![CDATA[${item.description}]]></description>\n`;
            }
            if (item.pubDate) {
                try {
                    xml += `      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>\n`;
                } catch { }
            }
            if (item.author) {
                xml += `      <author>${escapeXml(item.author)}</author>\n`;
            }
            if (item.thumbnail) {
                xml += `      <enclosure url="${escapeXml(item.thumbnail)}" type="image/jpeg" />\n`;
            }
            if (item.source) {
                xml += `      <source>${escapeXml(item.source)}</source>\n`;
            }

            xml += `    </item>`;
            return xml;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <description>${escapeXml(config.description)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;
}
