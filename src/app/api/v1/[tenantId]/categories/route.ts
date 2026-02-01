
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all categories for a specific site
// -------------------------------------------------------
export async function GET(
    req: NextRequest,
    { params }: { params: { tenantId: string } }
) {
    const { tenantId } = await params

    const { searchParams } = new URL(req.url)
    const hasArticlesParam = searchParams.get("has_articles")

    try {
        let whereClause: any = { siteId: tenantId }

        if (hasArticlesParam === "true") {
            // Since `categories` is a scalar list in Article (MongoDB), there is no back-relation on Category.
            // We must fetch all articles for this site to find which categories are used.
            const articles = await db.article.findMany({
                where: { siteId: tenantId },
                select: { categories: true },
            })

            const usedCategoryIds = Array.from(
                new Set(articles.flatMap((a) => a.categories))
            )

            whereClause.id = { in: usedCategoryIds }
        }

        const categories = await db.category.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
