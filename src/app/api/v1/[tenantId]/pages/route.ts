import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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