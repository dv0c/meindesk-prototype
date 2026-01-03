import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

/**
 * Custom Feed Templates API
 * 
 * GET  - List all templates for a site
 * POST - Create a new template
 */

// GET /api/team/[siteId]/rss/templates
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
        // Verify site ownership
        const site = await db.site.findFirst({
            where: { id: siteId, userId: session.user.id },
        });

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 });
        }

        const templates = await db.customFeedTemplate.findMany({
            where: { siteId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(templates);
    } catch (err: any) {
        console.error("Error fetching templates:", err.message);
        return NextResponse.json(
            { error: "Failed to fetch templates" },
            { status: 500 }
        );
    }
}

// POST /api/team/[siteId]/rss/templates
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
        // Verify site ownership
        const site = await db.site.findFirst({
            where: { id: siteId, userId: session.user.id },
        });

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 });
        }

        const body = await req.json();

        // Validate required fields
        if (!body.name || !body.targetUrl || !body.containerSelector) {
            return NextResponse.json(
                { error: "Missing required fields: name, targetUrl, containerSelector" },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(body.targetUrl);
        } catch {
            return NextResponse.json({ error: "Invalid targetUrl" }, { status: 400 });
        }

        const template = await db.customFeedTemplate.create({
            data: {
                siteId,
                name: body.name,
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
                maxItems: body.maxItems || 20,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (err: any) {
        console.error("Error creating template:", err.message);
        return NextResponse.json(
            { error: "Failed to create template" },
            { status: 500 }
        );
    }
}
