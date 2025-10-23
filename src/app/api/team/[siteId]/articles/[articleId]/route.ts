import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

// -------------------------------------------------------
// GET – Fetch a single article by ID
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { articleId } = await params;

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
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

    // Optional: restrict access if you only want authors to see their own stuff
    if (article.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  { params }: { params: { articleId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { articleId } = await params;
    const data = await req.json();

    const allowed = [
      "title",
      "excerpt",
      "content",
      "html",
      "cover",
      "status",
      "categoryId",
      "metadata",
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    const updated = await db.article.update({
      where: { id: articleId },
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
