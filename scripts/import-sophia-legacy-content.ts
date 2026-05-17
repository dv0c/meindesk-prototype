/**
 * Import legacy-export.json into Meindesk (collections, categories, articles, webhook settings).
 *
 * Usage:
 *   npx tsx scripts/import-sophia-legacy-content.ts <siteId> [path-to-legacy-export.json] [revalidateSecret]
 */
import "./lib/bootstrap"
import { readFileSync } from "fs"
import { resolve } from "path"
import { ArticleStatus } from "../src/generated/client"
import { mergeCategoryMetadata } from "../src/lib/category-metadata"
import {
  NAVIGATION_LINKS_SLUG,
  SITE_SECTIONS_SLUG,
} from "../src/lib/site-collections/schemas"
import { ensureSophiaFrontendCollections } from "../src/lib/site-collections/ensure"
import { disconnectScriptDb, getScriptDb } from "./lib/prisma-script"

type LegacyExport = {
  siteSections: Array<{
    slug: string
    title: string
    html: string
    heroImage: string | null
    published: boolean
  }>
  categoryMetadata: Array<{
    slug: string
    name: string
    metadata: { navPlacement: string; navOrder: number }
    description: string
    thumbnail: string | null
  }>
  articles: Array<{
    title: string
    slug: string
    excerpt: string
    html: string
    cover: string | null
    categoryName: string | null
    published: boolean
  }>
}

const EMPTY_CONTENT = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
}

async function main() {
  const siteId = process.argv[2]
  const exportPath =
    process.argv[3] ??
    resolve(__dirname, "../../sophiaplatanisioti.gr/legacy-export.json")
  const revalidateSecret = process.argv[4] ?? process.env.REVALIDATION_SECRET_TOKEN

  if (!siteId) {
    console.error(
      "Usage: npx tsx scripts/import-sophia-legacy-content.ts <siteId> [export.json] [revalidateSecret]",
    )
    process.exit(1)
  }

  const db = getScriptDb()
  const raw = readFileSync(exportPath, "utf8")
  const data = JSON.parse(raw) as LegacyExport

  const site = await db.site.findUnique({ where: { id: siteId } })
  if (!site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  const authorId = site.userId
  if (!authorId) {
    throw new Error(`Site ${siteId} has no userId (owner required for articles)`)
  }

  console.log("Seeding collections...")
  const { siteSections, navigationLinks } = await ensureSophiaFrontendCollections(siteId)

  let sectionsUpdated = 0
  for (const section of data.siteSections) {
    const item = await db.collectionItem.findUnique({
      where: {
        collectionId_slug: {
          collectionId: siteSections.id,
          slug: section.slug,
        },
      },
    })
    const published = section.published || Boolean(section.html?.trim())
    const payload = {
      title: section.title,
      slug: section.slug,
      html: section.html ?? "",
      heroImage: section.heroImage ?? null,
      published,
    }
    if (item) {
      await db.collectionItem.update({
        where: { id: item.id },
        data: { data: payload, status: "PUBLISHED" },
      })
    } else {
      await db.collectionItem.create({
        data: {
          collectionId: siteSections.id,
          slug: section.slug,
          status: "PUBLISHED",
          data: payload,
        },
      })
    }
    sectionsUpdated++
  }
  console.log(`  site-sections: ${sectionsUpdated} items`)

  const categories = await db.category.findMany({ where: { siteId } })
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]))

  let categoriesUpdated = 0
  for (const cat of data.categoryMetadata) {
    const existing = categoryBySlug.get(cat.slug)
    const navPlacement = cat.metadata.navPlacement as "header" | "hidden" | "none"
    if (existing) {
      await db.category.update({
        where: { id: existing.id },
        data: {
          description: cat.description || existing.description,
          thumbnail: cat.thumbnail ?? existing.thumbnail,
          published: true,
          metadata: mergeCategoryMetadata(existing.metadata, {
            navPlacement,
            navOrder: cat.metadata.navOrder ?? 0,
          }),
        },
      })
      categoriesUpdated++
    } else {
      const created = await db.category.create({
        data: {
          siteId,
          userId: authorId,
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? "",
          thumbnail: cat.thumbnail,
          published: true,
          metadata: mergeCategoryMetadata({}, {
            navPlacement,
            navOrder: cat.metadata.navOrder ?? 0,
          }),
        },
      })
      categoryBySlug.set(created.slug, created)
      categoryByName.set(created.name.toLowerCase(), created)
      categoriesUpdated++
    }
  }
  console.log(`  categories: ${categoriesUpdated} updated/created`)

  let articlesCreated = 0
  let articlesUpdated = 0
  for (const row of data.articles) {
    if (!row.slug || !row.title) continue

    const categoryIds: string[] = []
    if (row.categoryName) {
      const cat = categoryByName.get(row.categoryName.toLowerCase())
      if (cat) categoryIds.push(cat.id)
    }

    const existing = await db.article.findFirst({
      where: { siteId, slug: row.slug },
    })

    const articleData = {
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt ?? "",
      html: row.html ?? "",
      cover: row.cover ?? "",
      status: row.published ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
      categories: categoryIds,
      content: EMPTY_CONTENT,
    }

    if (existing) {
      await db.article.update({
        where: { id: existing.id },
        data: articleData,
      })
      articlesUpdated++
    } else {
      await db.article.create({
        data: {
          ...articleData,
          siteId,
          authorId,
          authorIds: [authorId],
        },
      })
      articlesCreated++
    }
  }
  console.log(`  articles: ${articlesCreated} created, ${articlesUpdated} updated`)

  if (revalidateSecret) {
    const currentSettings =
      typeof site.settings === "object" && site.settings !== null
        ? (site.settings as Record<string, unknown>)
        : {}
    const frontend = {
      revalidateUrl: "https://sophiaplatanisioti.gr/api/revalidate-all",
      revalidateSecret,
    }
    await db.site.update({
      where: { id: siteId },
      data: {
        settings: {
          ...currentSettings,
          frontend,
        },
      },
    })
    console.log("  site.settings.frontend webhook configured")
  } else {
    console.warn("  skipped webhook settings (no revalidateSecret provided)")
  }

  console.log("\nImport complete.")
  console.log(`  Collections: ${SITE_SECTIONS_SLUG} (${siteSections.id}), ${NAVIGATION_LINKS_SLUG} (${navigationLinks.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
