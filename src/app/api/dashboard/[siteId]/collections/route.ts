import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all collections for a site (for editor settings)
// -------------------------------------------------------
export async function GET(
    req: NextRequest,
    { params }: { params: { siteId: string } }
) {
    const session = await getAuthSession()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { siteId } = await params

    try {
        const collections = await db.collection.findMany({
            where: { siteId },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                fields: true,
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ collections })
    } catch (error) {
        console.error("Error fetching collections:", error)
        return NextResponse.json(
            { error: "Failed to fetch collections" },
            { status: 500 }
        )
    }
}
