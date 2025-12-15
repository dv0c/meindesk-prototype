"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function UpdateFeed({
    feedId,
    siteId,
    data,
}: {
    feedId: string;
    siteId: string;
    data: {
        title?: string;
        description?: string;
        icon?: string;
        autoImport?: boolean;
    };
}) {
    const session = await getAuthSession();
    if (!session?.user.id) throw new Error("Not authorized");

    // Verify feed exists and belongs to this site
    const feed = await db.rss.findFirst({
        where: { id: feedId, siteId },
    });

    if (!feed) throw new Error("Feed not found or not yours");

    // Update the feed
    const updatedFeed = await db.rss.update({
        where: { id: feedId },
        data: {
            title: data.title !== undefined ? data.title : feed.title,
            description: data.description !== undefined ? data.description : feed.description,
            icon: data.icon !== undefined ? data.icon : feed.icon,
            autoImport: data.autoImport !== undefined ? data.autoImport : feed.autoImport,
        },
    });

    return {
        success: true,
        feed: updatedFeed,
    };
}
