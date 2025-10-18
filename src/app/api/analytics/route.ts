import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  // Preflight for CORS
  const res = NextResponse.json({}, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*"); // allow cross-domain

  try {
    const { siteId, path, referrer, userAgent } = await req.json();

    if (!siteId || !path) {
      return NextResponse.json({ error: "siteId and path required" }, { status: 400 });
    }

    // Get IP from headers (works behind proxies)
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Save the analytics event
    await db.analyticsEvent.create({
      data: { siteId, path, referrer, userAgent, ipAddress },
    });

    // Increment site view counter
    await db.site.update({
      where: { id: siteId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
