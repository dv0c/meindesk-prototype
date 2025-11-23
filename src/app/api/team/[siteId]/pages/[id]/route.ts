import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import slugify from "slugify";
import generateSlug from "@/lib/generateSlug";

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
    const page = await db.page.findUnique({ where: { id } });
    if (!page)
      return NextResponse.json({ error: "Page not found" }, { status: 404 });

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

// ------------------------------------
// PUT /pages/:id → update page
// ------------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; siteId: string } }
) {
  const { id, siteId } = await params;
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const page = await db.page.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!siteId) {
      return NextResponse.json(
        { error: "Forbidden, undefined_s3301" },
        { status: 403 }
      );
    }

    const site = await db.site.findUnique({
      where: { id: siteId },
      include: {
        user: true,
      },
    });

    // Ownership check: block if site.user is null or doesn't match current user
    if (!site?.user || site.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden, s3302" }, { status: 403 });
    }

    const updatedPage = await db.page.update({
      where: { id },
      data: {
        title: body.name,
        slug: body.slug ? body.slug : await generateSlug(body.name, "page"),
        excerpt: body.excerpt,
        layout: body.layout ?? [],
        status: body.status,
        order: body.order,
        meta: body.meta,
        parentId: body.parentId,
        authorId: body.authorId,
      },
    });

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (err) {
    console.error("PUT /pages/:id error:", err);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// ------------------------------------
// DELETE /pages/:id → remove page (with ownership check)
// ------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = await db.page.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Ownership check
    if (page.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.page.delete({ where: { id } });
    return NextResponse.json({ message: "Page deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /pages/:id error:", err);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
