import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth";

// ------------------------------------------------------
// GET /api/team/:siteId/pages -> list all pages
// POST /api/team/:siteId/pages -> create a new page
// ------------------------------------------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    // Verify site ownership
    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const pages = await db.page.findMany({
      where: { siteId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(pages, { status: 200 });
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;
    const body = await req.json();

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const newPage = await db.page.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content || "",
        excerpt: body.excerpt || "",
        template: body.template || "default",
        status: body.status || "DRAFT",
        order: body.order || 0,
        siteId,
        userId: session.user.id, // Use authenticated user ID
        parentId: body.parentId || null,
        meta: body.meta || {},
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (err) {
    return createErrorResponse(err);
  }
}

