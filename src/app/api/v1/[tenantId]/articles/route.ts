import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ArticleStatus, Prisma } from "@/generated/client"
import { v1PublicAuthorSelect } from "@/lib/api/v1-public-fields"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID (with optional limit)
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params
  const { searchParams } = new URL(req.url)
  const limitParam = searchParams.get("limit")
  const categoriesParam = searchParams.get("categories")
  const statusParam = searchParams.get("status")?.trim().toLowerCase() ?? null
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : 10
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 10

  try {
    let whereClause: Prisma.ArticleWhereInput = { siteId: tenantId }

    if (statusParam === "published") {
      whereClause.status = ArticleStatus.PUBLISHED
    } else if (statusParam === "draft") {
      whereClause.status = ArticleStatus.DRAFT
    } else if (statusParam) {
      return NextResponse.json(
        { error: "Invalid status. Use published or draft." },
        { status: 400 }
      )
    }

    if (categoriesParam) {
      const categoryNames = categoriesParam.split(",").map((c) => c.trim())
      const foundCategories = await db.category.findMany({
        where: {
          siteId: tenantId,
          name: { in: categoryNames, mode: "insensitive" },
        },
        select: { id: true },
      })

      if (foundCategories.length > 0) {
        const categoryIds = foundCategories.map((c) => c.id)
        whereClause.categories = { hasSome: categoryIds }
      } else {
        // If specific categories were requested but none matched, return empty result
        return NextResponse.json([])
      }
    }

    const articles = await db.article.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cover: true,
        status: true,
        createdAt: true,
        categories: true,
        metadata: true,
        author: { select: { ...v1PublicAuthorSelect } },
        authors: { select: { ...v1PublicAuthorSelect } },
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
