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
async function fetchChildren(parentId: string): Promise<PageWithChildren[]> {
  const children = await db.page.findMany({
    where: { parentId },
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
      children: await fetchChildren(child.id),
    }))
  );
}

// ------------------------------------
// GET /pages/:id → fetch page + children
// ------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    // Try fetching by ID first
    let page = await db.page.findUnique({ where: { id } });

    // Fallback: if not found, search by slug
    if (!page) {
      page = await db.page.findUnique({ where: { slug: id } });
    }

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const children = await fetchChildren(page.id);
    return NextResponse.json({ ...page, children }, { status: 200 });
  } catch (err) {
    console.error("GET /pages/:id error:", err);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}
