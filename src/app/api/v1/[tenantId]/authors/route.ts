import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all authors (owner + members) for a specific site
// -------------------------------------------------------
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const { tenantId } = await params

    try {
        const site = await db.site.findUnique({
            where: { id: tenantId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    },
                },
                members: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    },
                },
            },
        })

        if (!site) {
            return NextResponse.json(
                { error: "Site not found" },
                { status: 404 }
            )
        }

        // Combine owner and members
        const allAuthors = []

        if (site.user) {
            allAuthors.push(site.user)
        }

        if (site.members && site.members.length > 0) {
            allAuthors.push(...site.members)
        }

        // Deduplicate just in case (though unlikely with proper schema constraints)
        const uniqueAuthors = Array.from(
            new Map(allAuthors.map((author) => [author.id, author])).values()
        )

        return NextResponse.json(uniqueAuthors)
    } catch (error) {
        console.error("Error fetching authors:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
