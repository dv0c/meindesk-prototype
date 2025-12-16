import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; rssId: string }> }
) {
    const { siteId, rssId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site ownership
    const site = await db.site.findFirst({
        where: { id: siteId, userId: session.user.id },
    });

    if (!site) {
        return NextResponse.json(
            { error: "Site not found or not yours" },
            { status: 404 }
        );
    }

    // Get all RssItems for this RSS feed
    const rssItems = await db.rssItem.findMany({
        where: { rssId },
        select: { id: true, guid: true, link: true },
    });

    // Create a map of RssItem ID to its guid/link
    const rssItemMap = new Map<string, string>();
    rssItems.forEach((item) => {
        const key = item.guid || item.link;
        if (key) {
            rssItemMap.set(item.id, key);
        }
    });

    const rssItemIds = rssItems.map((item) => item.id);

    // Get all articles that were created from these RSS items
    const articles = await db.article.findMany({
        where: {
            siteId,
            sourceType: "RSS",
            sourceId: { in: rssItemIds },
        },
        select: {
            id: true,
            sourceId: true,
        },
    });

    // Map to guid/link -> articleId
    const result = articles
        .map((article) => {
            const key = article.sourceId ? rssItemMap.get(article.sourceId) : null;
            if (!key) return null;
            return {
                key, // guid or link
                articleId: article.id,
            };
        })
        .filter(Boolean);

    return NextResponse.json(result);
}
