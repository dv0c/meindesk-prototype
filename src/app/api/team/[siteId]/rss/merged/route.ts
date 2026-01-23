import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { requireSiteAccess } from "@/lib/security/route-auth";

/**
 * Merged Feeds API
 * 
 * GET  - List all merged feeds for a site
 * POST - Create a new merged feed
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const site = await db.site.findFirst({
            where: { id: siteId, userId: session.user.id },
        });

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 });
        }

        const feeds = await db.mergedFeed.findMany({
            where: { siteId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(feeds);
    } catch (err: any) {
        console.error("Error fetching merged feeds:", err.message);
        return NextResponse.json(
            { error: "Failed to fetch merged feeds" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const site = await db.site.findFirst({
            where: { id: siteId, userId: session.user.id },
        });

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 });
        }

        const body = await req.json();

        if (!body.name || !body.sources || !Array.isArray(body.sources)) {
            return NextResponse.json(
                { error: "Missing required fields: name, sources" },
                { status: 400 }
            );
        }

        // Create merged feed config
        const mergedFeed = await db.mergedFeed.create({
            data: {
                siteId,
                name: body.name,
                description: body.description || null,
                sources: body.sources,
                filters: body.filters || null,
                maxItems: body.maxItems || 50,
            },
        });

        // Also create an Rss entry so import functionality works
        const mergedFeedUrl = `/api/rss/merged/${mergedFeed.id}`;
        const sourceCount = body.sources.length;

        await db.rss.create({
            data: {
                siteId,
                title: body.name,
                url: mergedFeedUrl,
                description: body.description || `Merged feed with ${sourceCount} sources`,
                icon: null,
                autoImport: false,
            },
        });

        return NextResponse.json(mergedFeed, { status: 201 });
    } catch (err: any) {
        console.error("Error creating merged feed:", err.message);
        return NextResponse.json(
            { error: "Failed to create merged feed" },
            { status: 500 }
        );
    }
}
