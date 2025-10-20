import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import geoip from "geoip-lite"; // optional if you want country/city from IP

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
    const payload = await req.json();

    const {
      url,
      path,
      referrer,
      userAgent,
      sessionId,
      landingPage,
      eventType,
      eventName,
      eventProps,
      deviceType,
      browser,
      os,
      timezone,
      utmSource,
      utmMedium,
      utmCampaign,
      scrollDepth,
      pageLoadMs,
      timeOnPage,
    } = payload;

    if (!url || !path) {
      const res = NextResponse.json({ error: "url and path required" }, { status: 400 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    // Determine IP and geo
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const geo = geoip.lookup(ipAddress)
    const country = geo?.country || null;
    const city = geo?.city || null;

    // Find the site
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
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipAddress,
        sessionId: sessionId || ipAddress,
        landingPage: landingPage || path,
        eventType: eventType || "PAGEVIEW",
        eventName: eventName || null,
        eventProps: eventProps || null,
        deviceType: deviceType || null,
        browser: browser || null,
        os: os || null,
        timezone: timezone || null,
        country,
        city,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        scrollDepth: scrollDepth || null,
        pageLoadMs: pageLoadMs || null,
        timeOnPage: timeOnPage || null,
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
