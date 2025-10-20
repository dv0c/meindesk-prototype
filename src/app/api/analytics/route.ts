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

// POST request
export async function POST(req: NextRequest) {
  try {
    const { url, path, referrer, userAgent, sessionId, timeOnPage } = await req.json();

    if (!url || !path) {
      const res = NextResponse.json({ error: "url and path required" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Find the site by URL
    const site = await db.site.findUnique({ where: { url } });
    if (!site) {
      const res = NextResponse.json({ error: "Site not found" }, { status: 404 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    // Create analytics event
    await db.analyticsEvent.create({
      data: {
        siteId: site.id,
        path,
        referrer,
        userAgent,
        ipAddress,
        sessionId: sessionId || ipAddress, // fallback to IP if no sessionId
        timeOnPage: timeOnPage || null,   // optional, in seconds
      },
    });

    // Increment site views
    await db.site.update({
      where: { url },
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
