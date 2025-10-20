// app/api/teams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await db.site.findMany({
      where: {
        userId: session.user.id, // only teams owned by this user
      },
      include: {
        subscription: true,
        features: true,
      },
      orderBy: {
        createdAt: "desc", // newest teams first
      },
    });

    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
