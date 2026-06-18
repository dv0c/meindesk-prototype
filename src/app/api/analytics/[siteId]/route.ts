import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth";
import { parseFiltersFromSearchParams, runAnalyticsQuery } from "@/lib/analytics/query-service";

/** Legacy analytics endpoint — delegates to unified query engine */
export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const range = req.nextUrl.searchParams.get("range") || "lastMonth";

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const filters = parseFiltersFromSearchParams(
      new URLSearchParams({ preset: range, compareMode: "previous_period" })
    );
    const { result, legacy } = await runAnalyticsQuery(siteId, filters);

    const res = NextResponse.json({
      viewsOverTime: result.viewsOverTime,
      topPages: result.topPages,
      trafficSources: result.trafficSources,
      regions: result.regions,
      devices: result.devices,
      cardMetrics: legacy,
    });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Cache-Control", "private, max-age=60");
    return res;
  } catch (err) {
    const res = createErrorResponse(err);
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
