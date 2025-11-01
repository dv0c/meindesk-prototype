import { db } from "@/lib/db";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { geolocation } from "@vercel/functions";

export const runtime = "nodejs";

// OPTIONS preflight ONLY
export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

// Helper: get device type from UA
function getDeviceType(uaString?: string) {
  if (!uaString) return "Unknown";
  const ua = uaString.toLowerCase();
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) return "Mobile";
  if (ua.includes("tablet") || ua.includes("ipad")) return "Tablet";
  return "Desktop";
}

// POST request
export async function POST(req: NextRequest) {
  try {
    const { url, path, referrer } = await req.json();

    if (!url || !path) {
      const res = NextResponse.json({ error: "url and path required" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const geo = geolocation(req); // Vercel geolocation
    const ua = userAgent(req);

    const region = geo.region || geo.country || "Unknown";
    const device = ua.isBot ? "BOT" : getDeviceType(ua.ua);

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
        userAgent: ua.ua || "Unknown",
        region,
        device,
        ipAddress,
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
