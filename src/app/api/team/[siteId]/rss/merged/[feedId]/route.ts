import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

/**
 * Single Merged Feed API
 * 
 * GET    - Get a specific merged feed
 * PUT    - Update a merged feed
 * DELETE - Delete a merged feed
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; feedId: string }> }
) {
    const { siteId, feedId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const feed = await db.mergedFeed.findFirst({
            where: { id: feedId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!feed || feed.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Feed not found" }, { status: 404 });
        }

        return NextResponse.json(feed);
    } catch (err: any) {
        console.error("Error fetching merged feed:", err.message);
        return NextResponse.json(
            { error: "Failed to fetch merged feed" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; feedId: string }> }
) {
    const { siteId, feedId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const existing = await db.mergedFeed.findFirst({
            where: { id: feedId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!existing || existing.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Feed not found" }, { status: 404 });
        }

        const body = await req.json();

        const feed = await db.mergedFeed.update({
            where: { id: feedId },
            data: {
                name: body.name ?? existing.name,
                description: body.description !== undefined ? body.description : existing.description,
                sources: body.sources ?? existing.sources,
                filters: body.filters !== undefined ? body.filters : existing.filters,
                maxItems: body.maxItems ?? existing.maxItems,
            },
        });

        return NextResponse.json(feed);
    } catch (err: any) {
        console.error("Error updating merged feed:", err.message);
        return NextResponse.json(
            { error: "Failed to update merged feed" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; feedId: string }> }
) {
    const { siteId, feedId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const existing = await db.mergedFeed.findFirst({
            where: { id: feedId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!existing || existing.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Feed not found" }, { status: 404 });
        }

        await db.mergedFeed.delete({
            where: { id: feedId },
        });

        return NextResponse.json({ message: "Feed deleted" });
    } catch (err: any) {
        console.error("Error deleting merged feed:", err.message);
        return NextResponse.json(
            { error: "Failed to delete merged feed" },
            { status: 500 }
        );
    }
}
