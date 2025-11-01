import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// ------------------------------------------------------
// GET /api/sites/:siteId/pages -> list all pages
// POST /api/sites/:siteId/pages -> create a new page
// ------------------------------------------------------
export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
  const { siteId } = await params;

  try {
    const pages = await db.page.findMany({
      where: { siteId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(pages, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { siteId: string } }) {
  const { siteId } = params;
  const body = await req.json();

  try {
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
        userId: body.userId || null,
        parentId: body.parentId || null,
        meta: body.meta || {},
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}

// ------------------------------------------------------
// GET / PUT / DELETE single page by id
// Route: /api/sites/:siteId/pages/:id
// ------------------------------------------------------
export async function GETSingle(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  const { siteId, id } = params;

  try {
    const page = await db.page.findFirst({
      where: { id, siteId },
    });

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    return NextResponse.json(page);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  const { siteId, id } = params;
  const body = await req.json();

  try {
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
    console.error(err);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { siteId: string; id: string } }) {
  const { siteId, id } = params;

  try {
    await db.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Page deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
