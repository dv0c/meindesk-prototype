
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

    try {
        const categories = await db.category.findMany({
            where: { siteId: tenantId },
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
