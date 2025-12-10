import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// -------------------------------------------------------
// GET – Fetch a single article by slug or ID
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string; articleId: string } }
) {
  try {
    const { articleId, tenantId } = await params;
    // Assuming tenantId is the siteId (based on other v1 routes)
    const article = await db.article.findFirst({
      where: { 
        slug: articleId, 
        siteId: tenantId,
        status: "PUBLISHED" 
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        site: {
          select: { id: true, title: true },
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
