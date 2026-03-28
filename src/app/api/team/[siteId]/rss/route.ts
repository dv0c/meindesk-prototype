import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth";
import { verifyInternalCronRequest } from "@/lib/security/internal-cron";
import { fetchTeamRssFeedData } from "@/lib/rss/team-rss-feed-data";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  const cronOk = verifyInternalCronRequest(req);
  if (!cronOk) {
    try {
      const session = await getAuthSession();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      await requireSiteAccess(siteId, session.user.id);
    } catch (err) {
      return createErrorResponse(err);
    }
  } else {
    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
  }

  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const fetchContent = searchParams.get("content") === "true";
  const maxItems = Math.min(
    Math.max(parseInt(searchParams.get("maxItems") || "20", 10) || 20, 1),
    100
  );

  const result = await fetchTeamRssFeedData({
    rawUrl: rawUrl || "",
    fetchContent,
    maxItems,
  });

  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }

  return NextResponse.json(result.data);
}
