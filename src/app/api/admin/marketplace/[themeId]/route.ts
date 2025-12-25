import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
    params: Promise<{ themeId: string }>
}

// GET /api/admin/marketplace/[themeId] - Get a single theme
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { themeId } = await params

        const theme = await db.theme.findUnique({
            where: { id: themeId },
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
            }
        })

        if (!theme) {
            return new NextResponse("Theme not found", { status: 404 })
        }

        return NextResponse.json(theme)
    } catch (error) {
        console.error("[ADMIN_MARKETPLACE_GET_ONE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// PUT /api/admin/marketplace/[themeId] - Update a theme
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { themeId } = await params
        const body = await request.json()
        const { name, description, thumbnail, price, isPremium, blocks } = body

        if (!name) {
            return new NextResponse("Theme name is required", { status: 400 })
        }

        // Delete existing blocks and recreate them
        await db.themeBlock.deleteMany({
            where: { themeId }
        })

        const theme = await db.theme.update({
            where: { id: themeId },
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
        console.error("[ADMIN_MARKETPLACE_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// DELETE /api/admin/marketplace/[themeId] - Delete a theme
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { themeId } = await params

        // Check if it's the Core theme
        const theme = await db.theme.findUnique({
            where: { id: themeId }
        })

        if (!theme) {
            return new NextResponse("Theme not found", { status: 404 })
        }

        if (theme.name === "Core") {
            return new NextResponse("Cannot delete the Core theme", { status: 400 })
        }

        // Delete the theme (cascade will delete blocks and site associations)
        await db.theme.delete({
            where: { id: themeId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[ADMIN_MARKETPLACE_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
