import { NextRequest, NextResponse } from "next/server";
import { scrapeWithTemplate } from "@/lib/rss/scraper";

/**
 * Preview endpoint for RSS Builder
 * Scrapes a page with the provided selectors without saving
 * 
 * POST /api/team/[siteId]/rss/templates/preview
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    try {
        const body = await req.json();

        if (!body.targetUrl || !body.containerSelector) {
            return NextResponse.json(
                { error: "Missing required fields: targetUrl, containerSelector" },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(body.targetUrl);
        } catch {
            return NextResponse.json({ error: "Invalid targetUrl" }, { status: 400 });
        }

        console.log("[Preview] Received selectors:", {
            targetUrl: body.targetUrl,
            containerSelector: body.containerSelector,
            titleSelector: body.titleSelector,
            linkSelector: body.linkSelector,
        });

        const items = await scrapeWithTemplate({
            targetUrl: body.targetUrl,
            containerSelector: body.containerSelector,
            titleSelector: body.titleSelector || null,
            linkSelector: body.linkSelector || null,
            thumbnailSelector: body.thumbnailSelector || null,
            descriptionSelector: body.descriptionSelector || null,
            dateSelector: body.dateSelector || null,
            authorSelector: body.authorSelector || null,
            linkAttribute: body.linkAttribute || "href",
            thumbnailAttribute: body.thumbnailAttribute || "src",
            maxItems: body.maxItems || 10, // Limit preview to 10 items
        });

        console.log("[Preview] Scraped items count:", items.length);
        if (items.length > 0) {
            console.log("[Preview] First item:", items[0]);
        }

        return NextResponse.json({ items });
    } catch (err: any) {
        console.error("Preview error:", err.message);
        return NextResponse.json(
            { error: err.message || "Preview failed" },
            { status: 500 }
        );
    }
}
