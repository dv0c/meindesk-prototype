import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type PageWithChildren = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  order?: number;
  layout: any[];
  status: string;
  parentId?: string | null;
  authorId?: string | null;
  siteId: string;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
  children: PageWithChildren[];
};

// ------------------------------------
// Recursive fetch for nested pages
// ------------------------------------
async function fetchChildren(parentId: string, tenantId: string): Promise<PageWithChildren[]> {
  const children = await db.page.findMany({
    where: { parentId, siteId: tenantId },
    orderBy: { order: "asc" },
  });

  return Promise.all(
    children.map(async (child) => ({
      ...child,
      excerpt: child.excerpt ?? undefined,
      order: child.order ?? undefined,
      parentId: child.parentId ?? undefined,
      authorId: child.authorId ?? undefined,
      layout: child.layout ?? [],
      children: await fetchChildren(child.id, tenantId),
    }))
  );
}

// ------------------------------------
// GET /pages/:id → fetch page + children
// ------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  const { tenantId, id } = await params;

  try {
    const page = await db.page.findFirst({
      where: {
        siteId: tenantId,
        OR: [{ id }, { slug: id }],
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const children = await fetchChildren(page.id, tenantId);

    // ✅ Add aggressive cache headers for CDN caching
    return NextResponse.json(
      { ...page, children },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("GET /pages/:id error:", err);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
