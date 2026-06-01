import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { triggerFrontendRevalidate } from "@/lib/frontend-revalidate"
import { navigationLinkDataSchema, parseNavigationLinkData } from "@/lib/navigation-link-data"
import { requireSiteAccess } from "@/lib/security/route-auth"
import { NAVIGATION_LINKS_SLUG } from "@/lib/site-collections/schemas"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; itemId: string }> },
) {
  const { siteId, itemId } = await params
  const session = await getAuthSession()
  if (!session?.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  await requireSiteAccess(siteId, session.user.id)

  const item = await db.collectionItem.findFirst({
    where: {
      id: itemId,
      collection: { siteId, slug: NAVIGATION_LINKS_SLUG },
    },
  })

  if (!item) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = navigationLinkDataSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await db.collectionItem.update({
    where: { id: itemId },
    data: { data: parsed.data, status: "PUBLISHED" },
  })

  void triggerFrontendRevalidate(siteId)

  return NextResponse.json({
    link: { id: updated.id, slug: updated.slug, ...parseNavigationLinkData(updated.data) },
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string; itemId: string }> },
) {
  const { siteId, itemId } = await params
  const session = await getAuthSession()
  if (!session?.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  await requireSiteAccess(siteId, session.user.id)

  const item = await db.collectionItem.findFirst({
    where: {
      id: itemId,
      collection: { siteId, slug: NAVIGATION_LINKS_SLUG },
    },
  })

  if (!item) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 })
  }

  await db.collectionItem.delete({ where: { id: itemId } })
  void triggerFrontendRevalidate(siteId)

  return NextResponse.json({ success: true })
}
