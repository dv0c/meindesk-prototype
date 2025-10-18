import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(req: NextRequest) {
  // Preflight response for CORS
  const res = NextResponse.json({}, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { siteId, path, referrer, userAgent } = await req.json();

    if (!siteId || !path) {
      const res = NextResponse.json({ error: "siteId and path required" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    await db.analyticsEvent.create({
      data: { siteId, path, referrer, userAgent, ipAddress },
    });

    await db.site.update({
      where: { id: siteId },
      data: { views: { increment: 1 } },
    });

    const res = NextResponse.json({ success: true });
    res.headers.set("Access-Control-Allow-Origin", "*"); // allow cross-domain
    return res;
  } catch (err) {
    console.error(err);
    const res = NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
