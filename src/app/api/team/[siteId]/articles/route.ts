import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;

  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const articles = await db.article.findMany({
      where: { siteId, authorId: session.user.id },
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

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: "No articles found" }, { status: 404 });
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
