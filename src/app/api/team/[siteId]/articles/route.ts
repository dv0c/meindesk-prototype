import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth"
import { triggerFrontendRevalidate } from "@/lib/frontend-revalidate"

export const runtime = "nodejs"

/** Dashboard list uses limit=0; cap fetch size to keep DB and payloads bounded. */
const DASHBOARD_LIST_MAX = 2000

// -------------------------------------------------------
// GET – Fetch articles for a site (optional limit; limit=0 = recent up to DASHBOARD_LIST_MAX)
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20;

    const [totalCount, articles] = await Promise.all([
      db.article.count({ where: { siteId } }),
      db.article.findMany({
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
          authorIds: true,
          categories: true,
          metadata: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          authors: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(parsedLimit > 0
          ? { take: parsedLimit }
          : { take: DASHBOARD_LIST_MAX }),
      }),
    ])

    // NEW: Fetch all categories referenced by these articles
    // 1. Collect all unique category IDs
    // @ts-ignore
    const allCategoryIds = Array.from(new Set(articles.flatMap((a) => a.categories)))

    // 2. Fetch the actual Category objects
    const categoriesList = await db.category.findMany({
      where: {
        id: { in: allCategoryIds as string[] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      }
    })

    // 3. Create a lookup map for faster access
    const categoryMap = new Map(categoriesList.map((c) => [c.id, c]))

    // 4. Attach the full category objects to each article
    const enrichedArticles = articles.map((article) => {
      // @ts-ignore
      const fullCategories = article.categories
        // @ts-ignore
        .map((catId) => categoryMap.get(catId))
        .filter(Boolean) // Filter out any undefineds if a category was deleted

      return {
        ...article,
        categories: fullCategories,
      }
    })

    const truncated = parsedLimit === 0 && totalCount > articles.length

    return NextResponse.json(enrichedArticles, {
      headers: {
        "X-Total-Count": String(totalCount),
        "X-Articles-Truncated": truncated ? "1" : "0",
      },
    })
  } catch (error) {
    return createErrorResponse(error);
  }
}
// -------------------------------------------------------
// POST – Create a new article
// -------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth();
    const { siteId } = await params;

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

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
        authorIds: body.authorIds
          ? Array.from(new Set([...body.authorIds, session.user.id]))
          : [session.user.id],
        excerpt: body.excerpt || "",
        cover: body.cover || "",
      }
    });

    void triggerFrontendRevalidate(siteId);

    return NextResponse.json(article);
  } catch (error) {
    return createErrorResponse(error);
  }
}
