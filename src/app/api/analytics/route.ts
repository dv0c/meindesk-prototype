import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    const res = NextResponse.json({}, { status: 204 });
    res.headers.set("Access-Control-Allow-Origin", "*"); // allow all domains
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*"); // allow cross-domain

  try {
    const { siteId, path, referrer, userAgent } = await req.json();

    if (!siteId || !path) {
      return NextResponse.json({ error: "siteId and path required" }, { status: 400 });
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    await prisma.analyticsEvent.create({
      data: { siteId, path, referrer, userAgent, ipAddress },
    });

    await prisma.site.update({
      where: { id: siteId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
