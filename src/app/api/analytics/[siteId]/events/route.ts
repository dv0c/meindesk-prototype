import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { db } from "@/lib/db";
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth";
import { anonymizeIpForDisplay } from "@/lib/analytics/privacy";

// --- helper: determine date range
function getDateRange(range: string): { since: Date } {
    const now = new Date();
    switch (range) {
        case "today":
        case "yesterday":
            return { since: subDays(now, 1) };
        case "last7Days":
        case "lastWeek":
            return { since: subDays(now, 7) };
        case "last14Days":
            return { since: subDays(now, 14) };
        case "last30Days":
        case "lastMonth":
            return { since: subDays(now, 30) };
        case "last60Days":
            return { since: subDays(now, 60) };
        case "last90Days":
        case "last3Months":
            return { since: subDays(now, 90) };
        default:
            return { since: subDays(now, 30) };
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params;
    const range = req.nextUrl.searchParams.get("range") || req.nextUrl.searchParams.get("preset") || "last30Days";
    const eventType = req.nextUrl.searchParams.get("eventType");
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(10, parseInt(req.nextUrl.searchParams.get("pageSize") || "50", 10)));

    try {
        const session = await requireAuth();
        if (!session.user) throw new Error("Unauthorized");
        await requireSiteAccess(siteId, session.user.id);

        const { since } = getDateRange(range);

        // Fetch events ordered by most recent first
        const events = await db.analyticsEvent.findMany({
            where: {
                siteId,
                isBot: false,
                createdAt: { gte: since },
                ...(eventType ? { eventType } : {}),
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        const total = await db.analyticsEvent.count({
            where: {
                siteId,
                isBot: false,
                createdAt: { gte: since },
                ...(eventType ? { eventType } : {}),
            },
        });

        const res = NextResponse.json({
            events: events.map(e => ({
                id: e.id,
                path: e.path,
                referrer: e.referrer,
                userAgent: e.userAgent,
                region: e.region || e.country,
                device: e.device,
                source: e.source,
                eventType: e.eventType,
                ipAddress: anonymizeIpForDisplay(e.ipAddress),
                createdAt: e.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
        });

        res.headers.set("Access-Control-Allow-Origin", "*");
        return res;
    } catch (err) {
        const res = createErrorResponse(err);
        res.headers.set("Access-Control-Allow-Origin", "*");
        return res;
    }
}
