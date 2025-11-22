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
    const { articleId } = await params;

    const article = await db.article.findUnique({
      where: { id: articleId, status: "PUBLISHED" },
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
