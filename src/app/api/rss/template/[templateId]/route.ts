import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeWithTemplate } from "@/lib/rss/scraper";

export const runtime = "nodejs";

/**
 * Public RSS Feed Endpoint
 * 
 * GET /api/rss/template/[templateId]
 * 
 * Returns RSS 2.0 XML for a saved template
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ templateId: string }> }
) {
    const { templateId } = await params;

    try {
        // Fetch the template
        const template = await db.customFeedTemplate.findUnique({
            where: { id: templateId },
        });

        if (!template) {
            return NextResponse.json(
                { error: "Feed not found" },
                { status: 404 }
            );
        }

        // Scrape items using the template
        const items = await scrapeWithTemplate({
            targetUrl: template.targetUrl,
            containerSelector: template.containerSelector,
            titleSelector: template.titleSelector,
            linkSelector: template.linkSelector,
            thumbnailSelector: template.thumbnailSelector,
            descriptionSelector: template.descriptionSelector,
            dateSelector: template.dateSelector,
            authorSelector: template.authorSelector,
            linkAttribute: template.linkAttribute || "href",
            thumbnailAttribute: template.thumbnailAttribute || "src",
            maxItems: template.maxItems || 20,
        });

        // Build RSS 2.0 XML
        const rssXml = buildRssXml({
            title: template.name,
            link: template.targetUrl,
            description: `Custom RSS feed from ${new URL(template.targetUrl).hostname}`,
            items,
        });

        return new NextResponse(rssXml, {
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "public, max-age=300", // Cache for 5 minutes
            },
        });
    } catch (err: any) {
        console.error("RSS feed error:", err.message);
        return NextResponse.json(
            { error: "Failed to generate feed" },
            { status: 500 }
        );
    }
}

interface RssFeedItem {
    title: string;
    link: string;
    description?: string | null;
    thumbnail?: string | null;
    pubDate?: string | null;
    author?: string | null;
}

interface RssFeedConfig {
    title: string;
    link: string;
    description: string;
    items: RssFeedItem[];
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

function buildRssXml(config: RssFeedConfig): string {
    const itemsXml = config.items
        .map((item) => {
            let itemXml = `    <item>\n`;
            itemXml += `      <title>${escapeXml(item.title)}</title>\n`;
            itemXml += `      <link>${escapeXml(item.link)}</link>\n`;
            itemXml += `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n`;

            if (item.description) {
                itemXml += `      <description><![CDATA[${item.description}]]></description>\n`;
            }

            if (item.pubDate) {
                try {
                    const date = new Date(item.pubDate);
                    itemXml += `      <pubDate>${date.toUTCString()}</pubDate>\n`;
                } catch { }
            }

            if (item.author) {
                itemXml += `      <author>${escapeXml(item.author)}</author>\n`;
            }

            if (item.thumbnail) {
                itemXml += `      <enclosure url="${escapeXml(item.thumbnail)}" type="image/jpeg" />\n`;
            }

            itemXml += `    </item>`;
            return itemXml;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.link)}</link>
    <description>${escapeXml(config.description)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;
}
