import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export const runtime = "nodejs"

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
      where: { siteId:tenantId },
      include: {
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
      return NextResponse.json({ error: "No articles found" }, { status: 404 })
    }

    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
