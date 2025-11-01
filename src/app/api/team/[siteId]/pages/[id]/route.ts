import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Type-safe page with nested children
type PageWithChildren = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  template: string;
  status: string;
  order?: number;
  parentId?: string | null;
  userId?: string | null;
  siteId: string;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
  children: PageWithChildren[];
};

// -----------------------------
// Helper: recursively fetch children
// -----------------------------
async function fetchChildren(parentId: string): Promise<PageWithChildren[]> {
  const children = await db.page.findMany({
    where: { parentId },
    orderBy: { order: "asc" },
  });

  return Promise.all(
    children.map(async (child) => ({
      ...child,
      content: child.content ?? undefined,
      excerpt: child.excerpt ?? undefined,
      order: child.order ?? undefined,
      parentId: child.parentId ?? undefined,
      userId: child.userId ?? undefined,
      children: await fetchChildren(child.id),
    }))
  );
}


// -----------------------------
// GET /pages/:id -> fetch page + children
// -----------------------------
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const page = await db.page.findUnique({ where: { id } });

    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const children: PageWithChildren[] = await fetchChildren(page.id);

    return NextResponse.json({ ...page, children }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// -----------------------------
// PUT /pages/:id -> update a page
// -----------------------------
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
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

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

// -----------------------------
// DELETE /pages/:id -> remove a page
// -----------------------------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await db.page.delete({ where: { id } });
    return NextResponse.json({ message: "Page deleted" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
