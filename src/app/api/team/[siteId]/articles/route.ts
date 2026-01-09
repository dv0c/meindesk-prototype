import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all articles for a specific site by ID (with optional limit)
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = await params
  const { searchParams } = new URL(req.url)
  const limitParam = searchParams.get("limit")
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20

  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const articles = await db.article.findMany({
      where: { siteId, authorId: session.user.id },
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

    if (!articles.length) {
      return NextResponse.json([])
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
