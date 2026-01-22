import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID (with optional limit)
// -------------------------------------------------------
// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID (with optional limit)
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = await params
  const { searchParams } = new URL(req.url)
  const limitParam = searchParams.get("limit")
  const limit = limitParam ? parseInt(limitParam, 10) : 10 // default to 10 results
  try {
    const articles = await db.article.findMany({
      where: { siteId: tenantId },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cover: true,
        createdAt: true,
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit, // here's your limit
    })

    if (!articles.length) {
      return NextResponse.json([])
    }

    // NEW: Fetch all categories referenced by these articles
    // 1. Collect all unique category IDs
    const allCategoryIds = Array.from(new Set(articles.flatMap((a) => a.categories)))

    // 2. Fetch the actual Category objects
    const categoriesList = await db.category.findMany({
      where: {
        id: { in: allCategoryIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    // 3. Create a lookup map for faster access
    const categoryMap = new Map(categoriesList.map((c) => [c.id, c]))

    // 4. Attach the full category objects to each article
    const enrichedArticles = articles.map((article) => {
      const fullCategories = article.categories
        .map((catId) => categoryMap.get(catId))
        .filter(Boolean) // Filter out any undefineds if a category was deleted

      return {
        ...article,
        categories: fullCategories,
      }
    })

    return NextResponse.json(enrichedArticles)
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
