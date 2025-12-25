import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
    params: Promise<{ siteId: string }>
}

// GET /api/sites/[siteId]/themes - Get installed themes for a site
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { siteId } = await params

        const installedThemes = await db.siteTheme.findMany({
            where: { siteId },
            include: {
                theme: {
                    include: {
                        blocks: {
                            select: {
                                id: true,
                                componentName: true,
                                componentDefinition: true,
                            }
                        }
                    }
                }
            },
            orderBy: { installedAt: "asc" }
        })

        return NextResponse.json(installedThemes.map(st => st.theme))
    } catch (error) {
        console.error("[SITE_THEMES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// POST /api/sites/[siteId]/themes - Install a theme for a site
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId } = await params
        const body = await request.json()
        const { themeId } = body

        if (!themeId) {
            return new NextResponse("Theme ID is required", { status: 400 })
        }

        // Check if site exists and user has access
        const site = await db.site.findFirst({
            where: {
                id: siteId,
                userId: session.user.id,
            }
        })

        if (!site) {
            return new NextResponse("Site not found", { status: 404 })
        }

        // Check if theme exists
        const theme = await db.theme.findUnique({
            where: { id: themeId }
        })

        if (!theme) {
            return new NextResponse("Theme not found", { status: 404 })
        }

        // Check if already installed
        const existing = await db.siteTheme.findUnique({
            where: {
                siteId_themeId: { siteId, themeId }
            }
        })

        if (existing) {
            return new NextResponse("Theme already installed", { status: 400 })
        }

        // Install the theme
        const siteTheme = await db.siteTheme.create({
            data: {
                siteId,
                themeId,
            },
            include: {
                theme: {
                    include: { blocks: true }
                }
            }
        })

        return NextResponse.json(siteTheme.theme)
    } catch (error) {
        console.error("[SITE_THEMES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

// DELETE /api/sites/[siteId]/themes - Uninstall a theme
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId } = await params
        const { searchParams } = new URL(request.url)
        const themeId = searchParams.get("themeId")

        if (!themeId) {
            return new NextResponse("Theme ID is required", { status: 400 })
        }

        // Check if site exists and user has access
        const site = await db.site.findFirst({
            where: {
                id: siteId,
                userId: session.user.id,
            }
        })

        if (!site) {
            return new NextResponse("Site not found", { status: 404 })
        }

        // Check if theme is the Core theme (can't uninstall)
        const theme = await db.theme.findUnique({
            where: { id: themeId }
        })

        if (theme?.name === "Core") {
            return new NextResponse("Cannot uninstall Core theme", { status: 400 })
        }

        // Uninstall the theme
        await db.siteTheme.delete({
            where: {
                siteId_themeId: { siteId, themeId }
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[SITE_THEMES_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
