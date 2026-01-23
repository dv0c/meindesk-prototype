import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { requireSiteAccess } from "@/lib/security/route-auth";

export const runtime = "nodejs";

// -------------------------------------------------------
// GET – Fetch a single article by ID
// -------------------------------------------------------
// -------------------------------------------------------
// GET – Fetch a single article by ID
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string; siteId: string }> } // Added siteId to params type if available, or fetch from DB? Next.js params usually has upstream params if not consumed? Actually siteId is in the path.
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { articleId, siteId } = await params; // siteId is available from parent route

    // Verify site access FIRST
    await requireSiteAccess(siteId, session.user.id);

    const article = await db.article.findFirst({
      where: {
        id: articleId,
        siteId: siteId // Ensure article belongs to this site
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        site: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------
// PATCH – Update article by ID
// -------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string; siteId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { articleId, siteId } = await params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const data = await req.json();

    const allowed = [
      "title",
      "slug",
      "excerpt",
      "content",
      "html",
      "cover",
      "status",
      "categoryId",
      "categories",
      "metadata",
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    // -------------------------------
    // SLUG uniqueness check
    // -------------------------------
    if (updateData.slug) {
      const existing = await db.article.findFirst({
        where: {
          slug: updateData.slug,
          siteId: siteId,
          NOT: { id: articleId }, // exclude current article
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug already exists. Choose a different one." },
          { status: 400 }
        );
      }
    }

    // Update if siteId matches
    const updated = await db.article.update({
      where: { id: articleId, siteId: siteId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string; siteId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { articleId, siteId } = await params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const updated = await db.article.delete({
      where: { id: articleId, siteId: siteId },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
