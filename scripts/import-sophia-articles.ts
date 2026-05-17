/**
 * Import Sophia legacy articles with full HTML (per-slug legacy API fetch + sanitize).
 *
 * Usage:
 *   LEGACY_MEINDESK_API_KEY=... npx tsx scripts/import-sophia-articles.ts <siteId> [legacy-export.json]
 */
import "./lib/bootstrap"
import { readFileSync } from "fs"
import { resolve } from "path"
import { ArticleStatus } from "../src/generated/client"
import {
  cleanLegacyArticleHtml,
  fetchLegacyArticleBySlug,
  normalizeCategoryName,
  requireLegacyApiKey,
} from "./lib/sophia-legacy-articles"
import { disconnectScriptDb, getScriptDb } from "./lib/prisma-script"

const SITE_ID_DEFAULT = "6a099338b4f6f3ac6e2dc60a"

type ExportArticle = {
  title: string
  slug: string
  excerpt: string
  html: string
  cover: string | null
  categoryName: string | null
  published: boolean
}

type LegacyExport = {
  articles: ExportArticle[]
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
  const siteId = process.argv[2] ?? SITE_ID_DEFAULT
  const exportPath =
    process.argv[3] ??
    resolve(__dirname, "../../sophiaplatanisioti.gr/legacy-export.json")

  requireLegacyApiKey()

  const db = getScriptDb()
  const raw = readFileSync(exportPath, "utf8")
  const data = JSON.parse(raw) as LegacyExport
  const rows = data.articles ?? []

  const site = await db.site.findUnique({ where: { id: siteId } })
  if (!site) {
    throw new Error(`Site not found: ${siteId}`)
  }
  const authorId = site.userId
  if (!authorId) {
    throw new Error(`Site ${siteId} has no userId (owner required for articles)`)
  }

  const categories = await db.category.findMany({ where: { siteId } })
  const categoryByName = new Map(
    categories.map((c) => [normalizeCategoryName(c.name), c]),
  )

  let imported = 0
  let updated = 0
  let skipped = 0
  let emptyHtml = 0
  const stillEmpty: string[] = []
  const unmappedCategories = new Set<string>()

  console.log(`Importing ${rows.length} articles into site ${siteId}...`)

  for (const row of rows) {
    if (!row.slug || !row.title) {
      skipped++
      continue
    }

    let html = cleanLegacyArticleHtml(row.html)
    let excerpt = row.excerpt?.trim() ?? ""
    let cover = row.cover ?? ""
    let categoryName = row.categoryName
    const published = row.published !== false

    if (!html) {
      const legacy = await fetchLegacyArticleBySlug(row.slug)
      if (legacy) {
        html = cleanLegacyArticleHtml(legacy.html)
        if (!excerpt) excerpt = legacy.description?.trim() ?? ""
        if (!cover) cover = legacy.thumbnail ?? ""
        if (!categoryName) categoryName = legacy.Category?.name ?? null
      }
    }

    if (!html) {
      emptyHtml++
      stillEmpty.push(`${row.slug} (${row.title})`)
    }

    const categoryIds: string[] = []
    if (categoryName) {
      const cat = categoryByName.get(normalizeCategoryName(categoryName))
      if (cat) {
        categoryIds.push(cat.id)
      } else {
        unmappedCategories.add(categoryName)
      }
    }

    const articleData = {
      title: row.title,
      slug: row.slug,
      excerpt,
      html,
      cover,
      status: published ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
      categories: categoryIds,
      content: EMPTY_CONTENT,
    }

    const existing = await db.article.findFirst({
      where: { siteId, slug: row.slug },
    })

    if (existing) {
      await db.article.update({
        where: { id: existing.id },
        data: articleData,
      })
      updated++
    } else {
      await db.article.create({
        data: {
          ...articleData,
          siteId,
          authorId,
          authorIds: [authorId],
        },
      })
      imported++
    }
  }

  console.log("\n--- Import summary ---")
  console.log(`  imported (new):     ${imported}`)
  console.log(`  updated:            ${updated}`)
  console.log(`  skipped:            ${skipped}`)
  console.log(`  empty html:         ${emptyHtml}`)
  if (unmappedCategories.size) {
    console.log(`  unmapped categories: ${[...unmappedCategories].join(", ")}`)
  }
  if (stillEmpty.length) {
    console.log("\nArticles still missing HTML (fix in dashboard):")
    for (const line of stillEmpty) {
      console.log(`  - ${line}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
