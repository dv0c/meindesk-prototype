import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

/**
 * Single Template API
 * 
 * GET    - Get a specific template
 * PUT    - Update a template
 * DELETE - Delete a template
 */

// GET /api/team/[siteId]/rss/templates/[templateId]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; templateId: string }> }
) {
    const { siteId, templateId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const template = await db.customFeedTemplate.findFirst({
            where: { id: templateId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!template || template.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (err: any) {
        console.error("Error fetching template:", err.message);
        return NextResponse.json(
            { error: "Failed to fetch template" },
            { status: 500 }
        );
    }
}

// PUT /api/team/[siteId]/rss/templates/[templateId]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; templateId: string }> }
) {
    const { siteId, templateId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify ownership
        const existing = await db.customFeedTemplate.findFirst({
            where: { id: templateId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!existing || existing.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const body = await req.json();

        const template = await db.customFeedTemplate.update({
            where: { id: templateId },
            data: {
                name: body.name ?? existing.name,
                targetUrl: body.targetUrl ?? existing.targetUrl,
                containerSelector: body.containerSelector ?? existing.containerSelector,
                titleSelector: body.titleSelector !== undefined ? body.titleSelector : existing.titleSelector,
                linkSelector: body.linkSelector !== undefined ? body.linkSelector : existing.linkSelector,
                thumbnailSelector: body.thumbnailSelector !== undefined ? body.thumbnailSelector : existing.thumbnailSelector,
                descriptionSelector: body.descriptionSelector !== undefined ? body.descriptionSelector : existing.descriptionSelector,
                dateSelector: body.dateSelector !== undefined ? body.dateSelector : existing.dateSelector,
                authorSelector: body.authorSelector !== undefined ? body.authorSelector : existing.authorSelector,
                linkAttribute: body.linkAttribute ?? existing.linkAttribute,
                thumbnailAttribute: body.thumbnailAttribute ?? existing.thumbnailAttribute,
                maxItems: body.maxItems ?? existing.maxItems,
            },
        });

        return NextResponse.json(template);
    } catch (err: any) {
        console.error("Error updating template:", err.message);
        return NextResponse.json(
            { error: "Failed to update template" },
            { status: 500 }
        );
    }
}

// DELETE /api/team/[siteId]/rss/templates/[templateId]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; templateId: string }> }
) {
    const { siteId, templateId } = await params;
    const session = await getAuthSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify ownership
        const existing = await db.customFeedTemplate.findFirst({
            where: { id: templateId, siteId },
            include: { site: { select: { userId: true } } },
        });

        if (!existing || existing.site.userId !== session.user.id) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        await db.customFeedTemplate.delete({
            where: { id: templateId },
        });

        return NextResponse.json({ message: "Template deleted" });
    } catch (err: any) {
        console.error("Error deleting template:", err.message);
        return NextResponse.json(
            { error: "Failed to delete template" },
            { status: 500 }
        );
    }
}
