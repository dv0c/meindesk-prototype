import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth";

// --- helper: determine date range
function getDateRange(range: string): { since: Date } {
    const now = new Date();
    switch (range) {
        case "yesterday":
            return { since: subDays(now, 1) };
        case "lastWeek":
            return { since: subDays(now, 7) };
        case "lastMonth":
            return { since: subDays(now, 30) };
        case "last3Months":
            return { since: subDays(now, 90) };
        default:
            return { since: subDays(now, 60) };
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params;
    const range = req.nextUrl.searchParams.get("range") || "last60Days";

    try {
        const session = await requireAuth();
        await requireSiteAccess(siteId, session.user.id);

        const { since } = getDateRange(range);

        // Fetch events ordered by most recent first
        const events = await db.analyticsEvent.findMany({
            where: {
                siteId,
                createdAt: { gte: since }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 1000, // Limit to last 1000 events for performance
        });

        const res = NextResponse.json({
            events: events.map(e => ({
                id: e.id,
                path: e.path,
                referrer: e.referrer,
                userAgent: e.userAgent,
                region: e.region,
                device: e.device,
                ipAddress: e.ipAddress,
                createdAt: e.createdAt.toISOString(),
            })),
            total: events.length,
        });

        res.headers.set("Access-Control-Allow-Origin", "*");
        return res;
    } catch (err) {
        const res = createErrorResponse(err);
        res.headers.set("Access-Control-Allow-Origin", "*");
        return res;
    }
}
