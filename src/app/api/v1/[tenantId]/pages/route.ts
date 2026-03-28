import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sites/:siteId/pages -> list all pages
// POST /api/sites/:siteId/pages -> create a new page
// ------------------------------------------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  try {
    const pages = await db.page.findMany({
      where: { siteId: tenantId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(pages, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

