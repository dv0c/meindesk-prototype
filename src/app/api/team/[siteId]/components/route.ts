
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"

// GET: List all saved components for a site
export async function GET(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId } = await params

        if (!siteId) {
            return new NextResponse("Missing siteId", { status: 400 })
        }

        const components = await db.snippet.findMany({
            where: {
                siteId: siteId,
                category: "saved-component",
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(components)
    } catch (error) {
        console.error("[COMPONENTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// POST: Save a new component
export async function POST(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId } = await params
        const body = await req.json()
        const { name, content, description } = body

        if (!content || !name) {
            return new NextResponse("Missing content or name", { status: 400 })
        }

        const component = await db.snippet.create({
            data: {
                siteId: siteId,
                name: name,
                description: description || "AI Generated Component",
                category: "saved-component",
                content: content, // This is the JSON tree
            },
        })

        return NextResponse.json(component)
    } catch (error) {
        console.error("[COMPONENTS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
