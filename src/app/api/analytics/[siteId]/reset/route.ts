import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { createErrorResponse, requireAdmin } from "@/lib/security/route-auth"

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ siteId: string }> }
) {
    try {
        await requireAdmin()

        const { siteId } = await params

        const site = await db.site.findUnique({
            where: { id: siteId },
            select: { id: true },
        })

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 })
        }

        await Promise.all([
            db.analyticsEvent.deleteMany({ where: { siteId } }),
            db.analyticsSession.deleteMany({ where: { siteId } }),
            db.analyticsDailyRollup.deleteMany({ where: { siteId } }),
        ])

        await db.site.update({
            where: { id: siteId },
            data: { views: 0 },
        })

        await db.article.updateMany({
            where: { siteId },
            data: { views: 0, uniqueViews: 0 },
        })

        return NextResponse.json({ message: "Analytics reset successfully" })
    } catch (error) {
        console.error("[ANALYTICS_RESET]", error)
        return createErrorResponse(error)
    }
}
