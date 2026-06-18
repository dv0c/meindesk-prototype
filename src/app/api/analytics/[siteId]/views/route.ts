import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const views = await db.analyticsSavedView.findMany({
      where: { siteId, userId: session.user.id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(views)
  } catch (err) {
    return createErrorResponse(err)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const body = await req.json()
    const { name, filters } = body

    if (!name || !filters) {
      return NextResponse.json({ error: "name and filters required" }, { status: 400 })
    }

    const view = await db.analyticsSavedView.create({
      data: {
        siteId,
        userId: session.user.id,
        name: String(name).slice(0, 100),
        filters,
      },
    })

    return NextResponse.json(view)
  } catch (err) {
    return createErrorResponse(err)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const viewId = req.nextUrl.searchParams.get("id")

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    if (!viewId) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    await db.analyticsSavedView.deleteMany({
      where: { id: viewId, siteId, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return createErrorResponse(err)
  }
}
