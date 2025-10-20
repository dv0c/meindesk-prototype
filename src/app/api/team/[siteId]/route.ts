// app/api/team/[siteId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db" // Prisma client
import { getAuthSession } from "@/lib/auth" // your auth helper

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: { siteId: string } }) {
  const { siteId } = await params
  console.log(siteId)
  try {
    // 1. Get logged in user
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Find the site
    const site = await db.site.findUnique({
      where: { id: siteId },
      include: {
        User: true, // optional: to return owner info
        subscription: true,
        features: true,
      },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // 3. Check if user owns it
    if (site.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // 4. Return site as the team
    return NextResponse.json({ site })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong " + siteId }, { status: 500 })
  }
}
