import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { siteId, path, referrer, userAgent } = await req.json();

    if (!siteId || !path) {
      return NextResponse.json(
        { error: "siteId and path are required" },
        { status: 400 }
      );
    }

    // Get client IP from headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    await db.analyticsEvent.create({
      data: {
        siteId,
        path,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipAddress,
      },
    });

    // Increment site view count
    await db.site.update({
      where: { id: siteId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
