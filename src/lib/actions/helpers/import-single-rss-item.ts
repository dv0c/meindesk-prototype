"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createArticleFromRss } from "./create-article-from-rss";

export async function ImportSingleRssItem({
    siteId,
    rssId,
    feedItem,
}: {
    siteId: string;
    rssId: string;
    feedItem: {
        title?: string;
        link?: string;
        description?: string;
        thumbnail?: string;
        publishedAt?: string;
        content?: string;
        author?: string;
        categories?: string[];
        guid?: string;
        site?: {
            title?: string;
        };
    };
}) {
    const session = await getAuthSession();
    if (!session?.user.id) throw new Error("Not authorized");

    // Verify site access (Owner or Member)
    const site = await db.site.findFirst({
        where: {
            id: siteId,
            OR: [
                { userId: session.user.id },
                { members: { some: { id: session.user.id } } }
            ]
        },
    });
    if (!site) throw new Error("Site not found or not yours");

    // Verify RSS belongs to this site
    const rss = await db.rss.findFirst({
        where: { id: rssId, siteId },
    });
    if (!rss) throw new Error("RSS feed not found for this site");

    // Check if this item already exists as an RssItem (by guid or link)
    const existingRssItem = await db.rssItem.findFirst({
        where: {
            rssId,
            OR: [
                { guid: feedItem.guid || undefined },
                { link: feedItem.link || "" },
            ],
        },
    });

    let rssItemId: string;

    if (existingRssItem) {
        rssItemId = existingRssItem.id;
    } else {
        // Create new RssItem
        const newRssItem = await db.rssItem.create({
            data: {
                rssId,
                title: feedItem.title || "Untitled",
                site_name: feedItem.site?.title || rss.title || "Unknown",
                link: feedItem.link || "",
                description: feedItem.description || null,
                thumbnail: feedItem.thumbnail || null,
                publishedAt: feedItem.publishedAt ? new Date(feedItem.publishedAt) : null,
                content: feedItem.content || null,
                author: feedItem.author || null,
                categories: feedItem.categories || [],
                guid: feedItem.guid || null,
            },
        });
        rssItemId = newRssItem.id;
    }

    // Check if article already exists
    const existingArticle = await db.article.findFirst({
        where: {
            siteId,
            sourceType: "RSS",
            sourceId: rssItemId,
        },
    });

    if (existingArticle) {
        throw new Error("This item has already been imported as an article");
    }

    // Get all existing slugs to avoid duplicates
    const existingArticles = await db.article.findMany({
        where: { siteId },
        select: { slug: true },
    });
    const existingSlugs = existingArticles.map((a) => a.slug);

    // Get the RssItem to create article
    const rssItem = await db.rssItem.findUnique({
        where: { id: rssItemId },
    });

    if (!rssItem) throw new Error("RSS item not found");

    // Create article
    await createArticleFromRss({
        siteId,
        authorId: session.user.id,
        rssId,
        rssItem,
        existingSlugs,
    });

    return {
        message: "Article imported successfully!",
        success: true,
    };
}
