import { db } from "@/lib/db"
import {
  NAVIGATION_LINKS_FIELDS,
  NAVIGATION_LINKS_SEED,
  NAVIGATION_LINKS_SLUG,
  SITE_SECTIONS_FIELDS,
  SITE_SECTIONS_SEED,
  SITE_SECTIONS_SLUG,
} from "./schemas"

export async function ensureSiteSectionsCollection(siteId: string) {
  let collection = await db.collection.findFirst({
    where: { siteId, slug: SITE_SECTIONS_SLUG },
  })

  if (!collection) {
    collection = await db.collection.create({
      data: {
        siteId,
        name: "Site sections",
        slug: SITE_SECTIONS_SLUG,
        description: "Hybrid static page content for headless frontends",
        fields: SITE_SECTIONS_FIELDS as object[],
      },
    })
  }

  for (const section of SITE_SECTIONS_SEED) {
    const existing = await db.collectionItem.findUnique({
      where: {
        collectionId_slug: {
          collectionId: collection.id,
          slug: section.slug,
        },
      },
    })
    if (!existing) {
      await db.collectionItem.create({
        data: {
          collectionId: collection.id,
          slug: section.slug,
          status: "PUBLISHED",
          data: {
            title: section.title,
            html: "",
            published: section.published,
          },
        },
      })
    }
  }

  return collection
}

export async function ensureNavigationLinksCollection(siteId: string) {
  let collection = await db.collection.findFirst({
    where: { siteId, slug: NAVIGATION_LINKS_SLUG },
  })

  if (!collection) {
    collection = await db.collection.create({
      data: {
        siteId,
        name: "Navigation links",
        slug: NAVIGATION_LINKS_SLUG,
        description: "Custom header, mobile, and footer navigation",
        fields: NAVIGATION_LINKS_FIELDS as object[],
      },
    })
  }

  for (const link of NAVIGATION_LINKS_SEED) {
    const slug = link.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || `link-${link.order}`
    const existing = await db.collectionItem.findFirst({
      where: {
        collectionId: collection.id,
        slug,
      },
    })
    if (!existing) {
      await db.collectionItem.create({
        data: {
          collectionId: collection.id,
          slug,
          status: "PUBLISHED",
          data: {
            label: link.label,
            href: link.href,
            placement: link.placement,
            order: link.order,
            visible: link.visible,
            openInNewTab: false,
          },
        },
      })
    }
  }

  return collection
}

export async function ensureSophiaFrontendCollections(siteId: string) {
  const siteSections = await ensureSiteSectionsCollection(siteId)
  const navigationLinks = await ensureNavigationLinksCollection(siteId)
  return { siteSections, navigationLinks }
}
