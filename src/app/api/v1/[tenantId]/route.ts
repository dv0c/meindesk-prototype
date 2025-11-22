// app/api/team/[siteId]/route.ts
import { getAuthSession } from "@/lib/auth"; // your auth helper
import { db } from "@/lib/db"; // Prisma client
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = await params;
  try {
    // 2. Find the site
    const site = await db.site.findUnique({
      where: { id: tenantId },
      select: {
        title: true,
        id: true,
        description: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 4. Return site as the team
    return NextResponse.json({ site });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong " },
      { status: 500 }
    );
  }
}
