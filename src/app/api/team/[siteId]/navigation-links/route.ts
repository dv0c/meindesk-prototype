import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { triggerFrontendRevalidate } from "@/lib/frontend-revalidate"
import {
  hrefToItemSlug,
  navigationLinkDataSchema,
  parseNavigationLinkData,
} from "@/lib/navigation-link-data"
import { requireSiteAccess } from "@/lib/security/route-auth"
import { NAVIGATION_LINKS_SLUG } from "@/lib/site-collections/schemas"
import { NextRequest, NextResponse } from "next/server"

async function getNavigationCollection(siteId: string) {
  return db.collection.findFirst({
    where: { siteId, slug: NAVIGATION_LINKS_SLUG },
  })
}

function sortByOrder(items: { data: unknown }[]) {
  return [...items].sort((a, b) => {
    const ao = parseNavigationLinkData(a.data).order
    const bo = parseNavigationLinkData(b.data).order
    return ao - bo
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  await requireSiteAccess(siteId, session.user.id)

  const collection = await getNavigationCollection(siteId)
  if (!collection) {
    return NextResponse.json({ links: [] })
  }

  const items = await db.collectionItem.findMany({
    where: { collectionId: collection.id },
    orderBy: { updatedAt: "desc" },
  })

  const links = sortByOrder(items).map((item) => ({
    id: item.id,
    slug: item.slug,
    status: item.status,
    ...parseNavigationLinkData(item.data),
  }))

  return NextResponse.json({ links, collectionId: collection.id })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  await requireSiteAccess(siteId, session.user.id)

  const collection = await getNavigationCollection(siteId)
  if (!collection) {
    return NextResponse.json(
      { error: "Navigation links collection not found. Run site collection seed." },
      { status: 404 },
    )
  }

  const body = await req.json()
  const parsed = navigationLinkDataSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  let slug = hrefToItemSlug(data.href)
  const existing = await db.collectionItem.findUnique({
    where: { collectionId_slug: { collectionId: collection.id, slug } },
  })
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`

  const item = await db.collectionItem.create({
    data: {
      collectionId: collection.id,
      slug,
      status: "PUBLISHED",
      data,
    },
  })

  void triggerFrontendRevalidate(siteId)

  return NextResponse.json({
    link: { id: item.id, slug: item.slug, ...parseNavigationLinkData(item.data) },
  })
}
