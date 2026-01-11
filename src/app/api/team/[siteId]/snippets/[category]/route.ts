
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { siteId: string; category: string } }
) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId, category } = await params

        if (!siteId || !category) {
            return new NextResponse("Missing params", { status: 400 })
        }

        // Find the snippet for this site and category
        // We assume one snippet per category per site for now (Global Header/Footer)
        const snippet = await db.snippet.findFirst({
            where: {
                siteId: siteId,
                category: category.toLowerCase(),
            },
        })

        if (!snippet) {
            // Return empty layout if not found, client will handle initial state
            return NextResponse.json({
                content: [],
                name: category.charAt(0).toUpperCase() + category.slice(1),
            })
        }

        return NextResponse.json(snippet)
    } catch (error) {
        console.error(`[SNIPPET_GET_${params.category}]`, error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { siteId: string; category: string } }
) {
    try {

        const session = await getAuthSession()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId, category } = await params
        const body = await req.json()
        const { content } = body

        if (!content) {
            return new NextResponse("Missing content", { status: 400 })
        }

        // Upsert the snippet
        // We first try to find it to get the ID, or create new
        const existing = await db.snippet.findFirst({
            where: {
                siteId: siteId,
                category: category.toLowerCase(),
            },
        })

        let snippet
        if (existing) {
            snippet = await db.snippet.update({
                where: { id: existing.id },
                data: {
                    content: content,
                    updatedAt: new Date(),
                },
            })
        } else {
            snippet = await db.snippet.create({
                data: {
                    siteId: siteId,
                    name: category.charAt(0).toUpperCase() + category.slice(1),
                    category: category.toLowerCase(),
                    content: content,
                },
            })
        }

        return NextResponse.json(snippet)
    } catch (error) {
        console.error(`[SNIPPET_PUT_${params.category}]`, error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
