"use server"

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/[tenantId]/snippets/[snippetId] -> get a single snippet
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string; snippetId: string }> }
) {
    const { tenantId, snippetId } = await params;

    try {
        const snippet = await db.snippet.findFirst({
            where: { id: snippetId, siteId: tenantId },
        });

        if (!snippet) {
            return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
        }

        return NextResponse.json(snippet, { status: 200 });
    } catch (err) {
        console.error("Failed to fetch snippet:", err);
        return NextResponse.json({ error: "Failed to fetch snippet" }, { status: 500 });
    }
}

// PUT /api/v1/[tenantId]/snippets/[snippetId] -> update a snippet
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string; snippetId: string }> }
) {
    const { tenantId, snippetId } = await params;

    try {
        const body = await req.json();
        const { name, description, category, thumbnail, content } = body;

        // Check if snippet exists and belongs to this site
        const existing = await db.snippet.findFirst({
            where: { id: snippetId, siteId: tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
        }

        const updated = await db.snippet.update({
            where: { id: snippetId },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(content !== undefined && { content }),
            },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("Failed to update snippet:", err);
        return NextResponse.json({ error: "Failed to update snippet" }, { status: 500 });
    }
}

// DELETE /api/v1/[tenantId]/snippets/[snippetId] -> delete a snippet
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string; snippetId: string }> }
) {
    const { tenantId, snippetId } = await params;

    try {
        // Check if snippet exists and belongs to this site
        const existing = await db.snippet.findFirst({
            where: { id: snippetId, siteId: tenantId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
        }

        await db.snippet.delete({
            where: { id: snippetId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("Failed to delete snippet:", err);
        return NextResponse.json({ error: "Failed to delete snippet" }, { status: 500 });
    }
}
