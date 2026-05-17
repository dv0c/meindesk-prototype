import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ArticleStatus } from "@/generated/client";
import { v1PublicAuthorSelect } from "@/lib/api/v1-public-fields";

export const runtime = "nodejs";

// -------------------------------------------------------
// GET – Fetch a single article by slug or ID
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; articleId: string }> }
) {
  try {
    const { articleId, tenantId } = await params;
    // Assuming tenantId is the siteId (based on other v1 routes)
    // Check if articleId looks like a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(articleId);

    let article;

    if (isObjectId) {
      article = await db.article.findFirst({
        where: {
          id: articleId,
          siteId: tenantId,
          status: ArticleStatus.PUBLISHED,
        },
        include: {
          author: { select: { ...v1PublicAuthorSelect } },
          authors: { select: { ...v1PublicAuthorSelect } },
          site: {
            select: { id: true, title: true },
          },
        },
      });
    }

    if (!article) {
      article = await db.article.findFirst({
        where: {
          slug: articleId,
          siteId: tenantId,
          status: ArticleStatus.PUBLISHED,
        },
        include: {
          author: { select: { ...v1PublicAuthorSelect } },
          authors: { select: { ...v1PublicAuthorSelect } },
          site: {
            select: { id: true, title: true },
          },
        },
      });
    }

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Fetch full category objects if the article has category IDs
    let categoriesData: any[] = [];
    if (article.categories && article.categories.length > 0) {
      categoriesData = await db.category.findMany({
        where: {
          id: { in: article.categories }
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      });
    }

    return NextResponse.json({
      ...article,
      categories: categoriesData
    });
  } catch (error: any) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
