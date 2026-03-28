// app/api/team/[siteId]/route.ts
import { db } from "@/lib/db"; // Prisma client
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  try {
    // 2. Find the site
    // Check if tenantId looks like a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(tenantId);
    
    let site;
    
    if (isObjectId) {
      site = await db.site.findUnique({
        where: { id: tenantId },
        select: {
          title: true,
          id: true,
          description: true,
          subdomain: true,
        },
      });
    }

    // Fallback or primary search by subdomain if not an ID or not found
    if (!site) {
      site = await db.site.findUnique({
        where: { subdomain: tenantId },
        select: {
          title: true,
          id: true,
          description: true,
          subdomain: true,
        },
      });
    }

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
