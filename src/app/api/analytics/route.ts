import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// OPTIONS preflight ONLY
export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

// Helper: get region from IP via ip-api.com
async function getRegionFromIP(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown") return null;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Combine city and country if available
    return `${data.city || ""}${data.city ? ", " : ""}${data.country || ""}`.trim() || null;
  } catch {
    return null;
  }
}

// POST request
export async function POST(req: NextRequest) {
  try {
    const { siteId, path, referrer, userAgent, articleSlug } = await req.json();

    if (!siteId || !path) {
      const res = NextResponse.json({ error: "siteId and path required" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Get region from IP (ip-api.com)
    const region = await getRegionFromIP(ipAddress);

    // Verify the site exists
    const site = await db.site.findUnique({ where: { id: siteId } });
    if (!site) {
      const res = NextResponse.json({ error: "Site not found" }, { status: 404 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    // Check if this is a unique article view
    let isUniqueArticleView: boolean | undefined;

    if (articleSlug) {
      // Check if this IP has already viewed this article
      const existingView = await db.analyticsEvent.findFirst({
        where: {
          siteId: site.id,
          articleSlug,
          ipAddress,
        },
      });

      isUniqueArticleView = !existingView;

      // If unique, increment the article's uniqueViews count
      if (isUniqueArticleView) {
        await db.article.updateMany({
          where: { siteId: site.id, slug: articleSlug },
          data: { uniqueViews: { increment: 1 } },
        });
      }

      // Always increment total views
      await db.article.updateMany({
        where: { siteId: site.id, slug: articleSlug },
        data: { views: { increment: 1 } },
      });
    }

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        siteId: site.id,
        path,
        referrer,
        userAgent,
        region,
        ipAddress,
        articleSlug: articleSlug || undefined,
        isUniqueArticleView,
      },
    });

    // Increment site views
    await db.site.update({
      where: { id: site.id },
      data: { views: { increment: 1 } },
    });

    const res = NextResponse.json({ success: true });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
