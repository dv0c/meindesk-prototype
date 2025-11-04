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

    const rss = await db.rss.findMany({
      where: { siteId },
      include: {
        site: true,
      },
    });

    if (!rss || rss.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(rss);
  } catch (error) {
    console.error("Error fetching rss feed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
