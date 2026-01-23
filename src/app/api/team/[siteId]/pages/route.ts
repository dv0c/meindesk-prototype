import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth";

// ------------------------------------------------------
// GET /api/team/:siteId/pages -> list all pages
// POST /api/team/:siteId/pages -> create a new page
// ------------------------------------------------------
export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
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

export async function POST(req: NextRequest, { params }: { params: { siteId: string } }) {
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

// ------------------------------------------------------
// GET / PUT / DELETE single page by id
// Route: /api/team/:siteId/pages/:id
// ------------------------------------------------------
export async function GETSingle(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  try {
    const session = await requireAuth();
    const { siteId, id } = params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const page = await db.page.findFirst({
      where: { id, siteId },
    });

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    return NextResponse.json(page);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  try {
    const session = await requireAuth();
    const { siteId, id } = params;
    const body = await req.json();

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const updatedPage = await db.page.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        template: body.template,
        status: body.status,
        order: body.order,
        meta: body.meta,
        parentId: body.parentId,
      },
    });

    return NextResponse.json(updatedPage);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  try {
    const session = await requireAuth();
    const { siteId, id } = params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    await db.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Page deleted" });
  } catch (err) {
    return createErrorResponse(err);
  }
}
