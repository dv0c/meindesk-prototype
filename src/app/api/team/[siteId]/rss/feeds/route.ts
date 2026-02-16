import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, requireSiteAccess } from "@/lib/security/route-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;

  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await requireSiteAccess(siteId, session.user.id);

    const rss = await db.rss.findMany({
      where: { siteId },
    });

    if (!rss || rss.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(rss);
  } catch (error) {
    return createErrorResponse(error);
  }
}
