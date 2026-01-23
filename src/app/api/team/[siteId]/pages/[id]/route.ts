import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";
import { requireSiteAccess } from "@/lib/security/route-auth";
import { NextRequest, NextResponse } from "next/server";

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
    if (!page)
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    if (!siteId)
      return NextResponse.json(
        { error: "Forbidden, undefined_s3301" },
        { status: 403 }
      );

    // Verify site access (Owner or Member)
    await requireSiteAccess(siteId, session.user.id);

    /* 
    const site = await db.site.findUnique({
      where: { id: siteId },
      include: { user: true },
    });

    if (!site?.user || site.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden, s3302" }, { status: 403 });
    }
    */

    // ------------------------
    // Determine final slug
    // ------------------------
    // Determine final slug
    let finalSlug = page.slug;

    // If a new slug is explicitly provided and not "untitled", use it
    if (body.slug && !/^untitled/i.test(body.slug)) {
      finalSlug = body.slug;
    }
    // Otherwise, if the CURRENT page slug is "untitled" (and no new valid slug provided), 
    // try to generate a real one from the name.
    // Otherwise, try to generate a real one from the name, BUT ONLY if:
    // 1. The current slug is missing/untitled AND
    // 2. The new name is meaningful (not just "Untitled Page" again)
    // Actually, if the user SAVES with "Untitled Page", we should probably just keep the current slug constant (e.g. "untitled" or "untitled-1")
    // instead of generating a new unique one every time (untitled-2, untitled-3).

    else if ((!page.slug || /^untitled/i.test(page.slug)) && body.name && !/^untitled/i.test(body.name)) {
      // Only auto-generate from name if the NAME is no longer "Untitled..."
      finalSlug = await generateSlug(body.name, "page", siteId);
    }
    // If name is STILL "Untitled...", keep the existing slug (e.g. "untitled-5") to avoids loops.
    // If page.slug was null/empty and name is "Untitled", generateSlug might default to "untitled-N" once, but we need to fetch it.
    else if (!page.slug) {
      finalSlug = await generateSlug(body.name || "page", "page", siteId);
    }
    // Else: Keep existing page.slug
    // This prevents "home" -> "home-1" when body.slug is missing in generic updates



    // WE DONT NEED TO LOCK THE PUT METHOD AT LEAST FOR THIS USE CASE (prevent it from deleted to use it in static pages  / , /article /articles)
    // const isPageLocked = await db.page.findUnique({ where: { id } });
    // if (isPageLocked?.locked) {
    //   return NextResponse.json({ error: "Page is locked" }, { status: 403 });
    // }

    // ------------------------
    // Update page
    // ------------------------
    const updatedPage = await db.page.update({
      where: { id },
      data: {
        title: body.name,
        slug: finalSlug,
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
  { params }: { params: { id: string; siteId: string } }
) {
  const { id, siteId } = await params;
  const session = await getAuthSession();
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = await db.page.findUnique({ where: { id } });
    if (!page)
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    if (!siteId)
      return NextResponse.json(
        { error: "Forbidden, undefined_s3301" },
        { status: 403 }
      );

    const isPageLocked = await db.page.findUnique({ where: { id } });
    if (isPageLocked?.locked) {
      return NextResponse.json({ error: "Page is locked" }, { status: 403 });
    }

    // Verify site access (Owner or Member)
    await requireSiteAccess(siteId, session.user.id);

    /*
    const site = await db.site.findUnique({
      where: { id: siteId },
      include: { user: true },
    });

    if (!site?.user || site.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden, s3302" }, { status: 403 });
    }
    */


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
