import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = await params;

  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Fetch all RSS feeds (including merged feeds which now save here)
    const rssFeeds = await db.rss.findMany({
      where: { siteId },
      include: { site: true },
    });

    // Mark merged feeds for UI display (purple icon)
    const feedsWithMergedFlag = rssFeeds.map((feed) => ({
      ...feed,
      isMerged: feed.url?.includes("/api/rss/merged/") || false,
    }));

    return NextResponse.json(feedsWithMergedFlag);
  } catch (error) {
    console.error("Error fetching rss feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

