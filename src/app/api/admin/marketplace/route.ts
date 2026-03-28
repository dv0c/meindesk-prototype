import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { unauthorizedUnlessAdminSession } from "@/lib/security/route-auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/marketplace - List all themes (admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        const denied = unauthorizedUnlessAdminSession(session)
        if (denied) return denied

        const themes = await db.theme.findMany({
            include: {
                blocks: {
                    select: {
                        id: true,
                        componentName: true,
                        componentDefinition: true,
                    }
                },
                _count: {
                    select: { installedIn: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(themes)
    } catch (error) {
        console.error("[ADMIN_MARKETPLACE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// POST /api/admin/marketplace - Create a new theme
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const denied = unauthorizedUnlessAdminSession(session)
        if (denied) return denied

        const body = await request.json()
        const { name, description, thumbnail, price, isPremium, blocks } = body

        if (!name) {
            return new NextResponse("Theme name is required", { status: 400 })
        }

        const theme = await db.theme.create({
            data: {
                name,
                description: description || "",
                thumbnail: thumbnail || null,
                price: price || 0,
                isPremium: isPremium || false,
                blocks: {
                    create: (blocks || []).map((block: any) => ({
                        componentName: block.componentName,
                        componentDefinition: block.componentDefinition || {},
                    }))
                }
            },
            include: {
                blocks: true
            }
        })

        return NextResponse.json(theme)
    } catch (error) {
        console.error("[ADMIN_MARKETPLACE_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
