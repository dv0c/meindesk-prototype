import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireSiteOwnership, createErrorResponse } from "@/lib/security/route-auth"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID (with optional limit)
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    // Verify site ownership first
    await requireSiteOwnership(siteId, session.user.id);

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20;

    const articles = await db.article.findMany({
      where: { siteId },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cover: true,
        createdAt: true,
        updateAt: true,
        status: true,
        siteId: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(parsedLimit > 0 ? { take: parsedLimit } : {}), // no limit if 0
    })

    return NextResponse.json(articles);
  } catch (error) {
    return createErrorResponse(error);
  }
}
