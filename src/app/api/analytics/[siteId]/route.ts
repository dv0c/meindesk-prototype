import { NextRequest, NextResponse } from "next/server";
import { subDays, format } from "date-fns";
import { db } from "@/lib/db";

// --- helper: detect device type
function getDeviceType(uaString?: string) {
  if (!uaString) return "Unknown";
  const ua = uaString.toLowerCase();
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) return "Mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "Tablet";
  return "Desktop";
}

// --- helper: determine date range
function getDateRange(range: string): { since: Date; previousSince?: Date } {
  const now = new Date();
  switch (range) {
    case "yesterday":
      return { since: subDays(now, 1), previousSince: subDays(now, 2) };
    case "lastWeek":
      return { since: subDays(now, 7), previousSince: subDays(now, 14) };
    case "lastMonth":
      return { since: subDays(now, 30), previousSince: subDays(now, 60) };
    case "last3Months":
      return { since: subDays(now, 90), previousSince: subDays(now, 180) };
    default:
      return { since: subDays(now, 60), previousSince: subDays(now, 120) };
  }
}

export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
  const { siteId } = await params;
  const range = req.nextUrl.searchParams.get("range") || "last60Days";

  try {
    const { since, previousSince } = getDateRange(range);

    // Fetch current and previous events
    const events = await db.analyticsEvent.findMany({
      where: { siteId, createdAt: { gte: since } },
    });
    const prevEvents = previousSince
      ? await db.analyticsEvent.findMany({
          where: { siteId, createdAt: { gte: previousSince, lt: since } },
        })
      : [];

    // --- VIEWS OVER TIME ---
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

    // --- TOP PAGES ---
    const pageViews: Record<string, number> = {};
    for (const e of events) pageViews[e.path] = (pageViews[e.path] || 0) + 1;
    const topPages = Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // --- TRAFFIC SOURCES ---
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

    // --- CARD METRICS ---
    const totalViews = events.length;
    const uniqueVisitors = new Set(events.map((e) => e.ipAddress || "unknown")).size;
    const totalPageViews = Object.values(pageViews).reduce((acc, v) => acc + v, 0);

    const prevTotalViews = prevEvents.length;
    const prevUniqueVisitors = new Set(prevEvents.map((e) => e.ipAddress || "unknown")).size;
    const prevPageViews = prevEvents.length;

    const viewsChange = prevTotalViews ? ((totalViews - prevTotalViews) / prevTotalViews) * 100 : 0;
    const visitorsChange = prevUniqueVisitors ? ((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100 : 0;
    const pageViewsChange = prevPageViews ? ((totalPageViews - prevPageViews) / prevPageViews) * 100 : 0;

    // --- AVG SESSION DURATION ---
    function calculateAvgSession(eventsList: typeof events) {
      const sessionsByIP: Record<string, Date[]> = {};
      for (const e of eventsList) {
        const ip = e.ipAddress || "unknown";
        if (!sessionsByIP[ip]) sessionsByIP[ip] = [];
        sessionsByIP[ip].push(e.createdAt);
      }
      const sessionDurations: number[] = [];
      const SESSION_GAP = 30 * 60 * 1000; // 30 min
      for (const times of Object.values(sessionsByIP)) {
        times.sort((a, b) => a.getTime() - b.getTime());
        let sessionStart = times[0].getTime();
        for (let i = 1; i < times.length; i++) {
          const diff = times[i].getTime() - times[i - 1].getTime();
          if (diff > SESSION_GAP) {
            sessionDurations.push(times[i - 1].getTime() - sessionStart);
            sessionStart = times[i].getTime();
          }
        }
        sessionDurations.push(times[times.length - 1].getTime() - sessionStart);
      }
      if (!sessionDurations.length) return { avg: "0m 0s", seconds: 0 };
      const avgSeconds = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length / 1000;
      const minutes = Math.floor(avgSeconds / 60);
      const seconds = Math.round(avgSeconds % 60);
      return { avg: `${minutes}m ${seconds}s`, seconds: avgSeconds };
    }

    const currentSession = calculateAvgSession(events);
    const previousSession = calculateAvgSession(prevEvents);
    const avgSessionDuration = currentSession.avg;
    const durationChange = previousSession.seconds
      ? ((currentSession.seconds - previousSession.seconds) / previousSession.seconds) * 100
      : 0;

    // --- REGIONS & DEVICES (from stored events)
    const regionCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    for (const e of events) {
      const region = e.region || "Unknown"; // stored at POST using ip.com
      const device = e.userAgent ? getDeviceType(e.userAgent) : "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    }

    const regions = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const devices = Object.entries(deviceCounts).map(([device, count], i) => ({
      device,
      count,
      color: colors[i % colors.length],
    }));

    const res = NextResponse.json({
      viewsOverTime,
      topPages,
      trafficSources,
      regions,
      devices,
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
