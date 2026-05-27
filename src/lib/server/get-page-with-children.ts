import { db } from "@/lib/db"
import { isValidObjectId } from "@/lib/actions/helpers/cached-tenant"

/** Headless static routes (Sophia frontend) — returned even when locked. */
const HEADLESS_SYSTEM_PAGE_SLUGS = ["home", "biography", "contact", "ypiresies"] as const

export type PageWithChildren = {
  id: string
  title: string
  slug: string
  excerpt?: string
  order?: number
  layout: unknown[]
  status: string
  parentId?: string | null
  authorId?: string | null
  siteId: string
  meta?: unknown
  createdAt: Date
  updatedAt: Date
  children: PageWithChildren[]
}

async function fetchChildren(parentId: string, tenantId: string): Promise<PageWithChildren[]> {
  const children = await db.page.findMany({
    where: { parentId, siteId: tenantId },
    orderBy: { order: "asc" },
  })

  return Promise.all(
    children.map(async (child) => ({
      ...child,
      excerpt: child.excerpt ?? undefined,
      order: child.order ?? undefined,
      parentId: child.parentId ?? undefined,
      authorId: child.authorId ?? undefined,
      layout: child.layout ?? [],
      children: await fetchChildren(child.id, tenantId),
    }))
  )
}

/**
 * Load a page by id or slug for a site, with nested children (same shape as GET /api/v1/:tenantId/pages/:id).
 * Returns JSON-serializable data (dates as ISO strings) for passing to Client Components.
 */
export async function getPageWithChildrenJson(
  tenantId: string,
  idOrSlug: string
): Promise<Record<string, unknown> | null> {
  const identityClause = isValidObjectId(idOrSlug)
    ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
    : { slug: idOrSlug }

  const page = await db.page.findFirst({
    where: {
      siteId: tenantId,
      status: "PUBLISHED",
      AND: [
        identityClause,
        {
          OR: [
            { locked: false },
            { slug: { in: [...HEADLESS_SYSTEM_PAGE_SLUGS] } },
          ],
        },
      ],
    },
  })

  if (!page) return null

  const children = await fetchChildren(page.id, tenantId)
  const payload = { ...page, children }
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>
}
