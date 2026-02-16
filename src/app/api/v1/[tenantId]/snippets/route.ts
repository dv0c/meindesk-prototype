"use server"

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
    createErrorResponse,
    requireAuth,
    requireSiteAccess,
} from "@/lib/security/route-auth";

// GET /api/v1/[tenantId]/snippets -> list all snippets for a site
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const { tenantId } = await params;

    try {
        const snippets = await db.snippet.findMany({
            where: { siteId: tenantId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(snippets, { status: 200 });
    } catch (err) {
        return createErrorResponse(err);
    }
}

// POST /api/v1/[tenantId]/snippets -> create a new snippet
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const { tenantId } = await params;

    try {
        const session = await requireAuth();
        await requireSiteAccess(tenantId, session.user.id);

        const body = await req.json();
        const { name, description, category, thumbnail, content } = body;

        if (!name || !content) {
            return NextResponse.json(
                { error: "Name and content are required" },
                { status: 400 }
            );
        }

        const snippet = await db.snippet.create({
            data: {
                name,
                description: description || null,
                category: category || "custom",
                thumbnail: thumbnail || null,
                content, // LayoutNode[] as JSON
                siteId: tenantId,
            },
        });

        return NextResponse.json(snippet, { status: 201 });
    } catch (err) {
        return createErrorResponse(err);
    }
}
