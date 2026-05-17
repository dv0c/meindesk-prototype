import { db } from "@/lib/db"

export type FetchCollectionItemsOptions = {
  limit?: number
  status?: string
  orderBy?: string
  orderDir?: "asc" | "desc"
}

export async function fetchCollectionItemsForTenant(
  tenantId: string,
  collectionId: string,
  options: FetchCollectionItemsOptions = {},
) {
  const limit = options.limit ?? 50
  const status = options.status ?? "PUBLISHED"
  const orderBy = options.orderBy ?? "createdAt"
  const orderDir = options.orderDir ?? "desc"

  const collection = await db.collection.findFirst({
    where: { id: collectionId, siteId: tenantId },
    select: { id: true, name: true, slug: true, fields: true },
  })

  if (!collection) {
    return null
  }

  const items = await db.collectionItem.findMany({
    where: { collectionId, status: status as "PUBLISHED" | "DRAFT" | "ARCHIVED" },
    orderBy: { [orderBy]: orderDir },
    take: limit,
  })

  return {
    collection,
    items,
    total: items.length,
  }
}

export async function fetchCollectionItemsBySlug(
  tenantId: string,
  collectionSlug: string,
  options: FetchCollectionItemsOptions = {},
) {
  const collection = await db.collection.findFirst({
    where: { siteId: tenantId, slug: collectionSlug },
    select: { id: true },
  })

  if (!collection) {
    return null
  }

  return fetchCollectionItemsForTenant(tenantId, collection.id, options)
}
