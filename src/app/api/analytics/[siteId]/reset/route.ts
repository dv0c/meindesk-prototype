import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ siteId: string }> }
) {
    try {
        const session = await getAuthSession()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { siteId } = await params

        // Verify ownership/admin status
        const site = await db.site.findFirst({
            where: {
                id: siteId,
                OR: [
                    { userId: session.user.id },
                    { members: { some: { id: session.user.id } } } // Assuming members can reset? Probably only owner/admin
                ]
            }
        })

        if (!site) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        // Delete all analytics events for this site
        await db.analyticsEvent.deleteMany({
            where: {
                siteId: siteId
            }
        })

        // Reset views count
        await db.site.update({
            where: { id: siteId },
            data: { views: 0 }
        })

        return new NextResponse("Analytics reset successfully", { status: 200 })

    } catch (error) {
        console.error("[ANALYTICS_RESET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
