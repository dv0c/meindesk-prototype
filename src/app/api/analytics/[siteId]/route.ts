import { NextRequest, NextResponse } from "next/server";
import { subDays, format } from "date-fns";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = await params;

  try {
    // Fetch analytics events for last 60 days
    const since = subDays(new Date(), 60);
    const events = await db.analyticsEvent.findMany({
      where: { siteId, createdAt: { gte: since } },
    });

    // ===== VIEWS OVER TIME =====
    const dailyStats: Record<string, { views: number; visitors: Set<string> }> = {};
    for (const e of events) {
      const day = format(e.createdAt, "MMM d");
      if (!dailyStats[day]) dailyStats[day] = { views: 0, visitors: new Set() };
      dailyStats[day].views++;
      dailyStats[day].visitors.add(e.ipAddress || "unknown");
    }
    const viewsOverTime = Object.entries(dailyStats).map(([date, data]) => ({
      date,
      views: data.views,
      visitors: data.visitors.size,
    }));

    // ===== TOP PAGES =====
    const pageViews: Record<string, number> = {};
    for (const e of events) pageViews[e.path] = (pageViews[e.path] || 0) + 1;
    const topPages = Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // ===== TRAFFIC SOURCES =====
    const refSources: Record<string, number> = {};
    for (const e of events) {
      const ref = e.referrer
        ? e.referrer.includes("google")
          ? "Google"
          : e.referrer.includes("facebook") || e.referrer.includes("instagram")
          ? "Social Media"
          : "Referral"
        : "Direct";

      refSources[ref] = (refSources[ref] || 0) + 1;
    }
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];
    const trafficSources = Object.entries(refSources).map(([source, value], i) => ({
      source,
      value,
      color: colors[i % colors.length],
    }));

    // ===== CARD METRICS =====
    const totalViews = events.length;
    const uniqueVisitors = new Set(events.map((e) => e.ipAddress || "unknown")).size;
    const totalPageViews = Object.values(pageViews).reduce((acc, v) => acc + v, 0);

    // Example: calculate changes compared to previous 30 days
    const previousSince = subDays(new Date(), 90);
    const prevEvents = await db.analyticsEvent.findMany({
      where: { siteId, createdAt: { gte: previousSince, lt: since } },
    });
    const prevTotalViews = prevEvents.length;
    const prevUniqueVisitors = new Set(prevEvents.map((e) => e.ipAddress || "unknown")).size;
    const prevPageViews = prevEvents.length;

    const viewsChange = prevTotalViews ? ((totalViews - prevTotalViews) / prevTotalViews) * 100 : 0;
    const visitorsChange = prevUniqueVisitors ? ((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100 : 0;
    const pageViewsChange = prevPageViews ? ((totalPageViews - prevPageViews) / prevPageViews) * 100 : 0;

    // Dummy avg session duration example
    const avgSessionDuration = "3m 42s"; // you can calculate from your events if you track session times
    const durationChange = 5.7; // dummy example

    const res = NextResponse.json({
      viewsOverTime,
      topPages,
      trafficSources,
      cardMetrics: {
        totalViews,
        viewsChange,
        uniqueVisitors,
        visitorsChange,
        pageViews: totalPageViews,
        pageViewsChange,
        avgSessionDuration,
        durationChange,
      },
    });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
