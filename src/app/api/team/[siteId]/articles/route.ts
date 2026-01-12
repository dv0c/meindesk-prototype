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
// -------------------------------------------------------
// POST – Create a new article
// -------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    await requireSiteOwnership(siteId, session.user.id);

    const body = await req.json();

    // Basic validation
    if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const article = await db.article.create({
      data: {
        siteId,
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        content: body.content ? JSON.parse(JSON.stringify(body.content)) : {
          root: {
            children: [
              {
                children: [],
                direction: null,
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1
              }
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        },
        status: body.status || "DRAFT",
        authorId: session.user.id,
        excerpt: body.excerpt || "",
        cover: body.cover || "",
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    return createErrorResponse(error);
  }
}
