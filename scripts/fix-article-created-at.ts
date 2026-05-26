/**
 * Backfill Article.createdAt from the legacy dashboard Post collection.
 *
 * Matches Post → Article by slug (within the same MongoDB database).
 * Only updates articles whose createdAt differs from the matching Post.
 *
 * Usage:
 *   DATABASE_URL="mongodb+srv://..." npx tsx scripts/fix-article-created-at.ts [siteId]
 */
import "./lib/bootstrap"
import { getScriptDb, disconnectScriptDb } from "./lib/prisma-script"

const SITE_ID_DEFAULT = "6a099338b4f6f3ac6e2dc60a"

async function main() {
  const siteId = process.argv[2] ?? SITE_ID_DEFAULT
  const db = getScriptDb()

  // Read all Posts from the legacy dashboard collection using $runCommandRaw
  const result = (await db.$runCommandRaw({
    find: "Post",
    filter: {},
    projection: { slug: 1, createdAt: 1, title: 1 },
  })) as any

  const posts: Array<{ slug: string; title: string; createdAt: Date }> =
    result?.cursor?.firstBatch ?? []

  if (posts.length === 0) {
    console.log("No posts found in the Post collection.")
    return
  }

  console.log(`Found ${posts.length} posts in the dashboard Post collection.`)

  const postBySlug = new Map(
    posts.map((p) => [p.slug, { createdAt: new Date(p.createdAt.$date ?? p.createdAt), title: p.title }]),
  )

  // Get all articles for the site
  const articles = await db.article.findMany({
    where: { siteId },
    select: { id: true, slug: true, title: true, createdAt: true },
  })

  console.log(`Found ${articles.length} articles in site ${siteId}.\n`)

  let updated = 0
  let matched = 0
  let skipped = 0

  for (const article of articles) {
    const post = postBySlug.get(article.slug)

    if (!post) {
      skipped++
      continue
    }

    matched++
    const postDate = post.createdAt
    const articleDate = new Date(article.createdAt)

    // Skip if dates already match (within 1 second tolerance)
    if (Math.abs(postDate.getTime() - articleDate.getTime()) < 1000) {
      console.log(`  ✓ "${article.title}" — already correct`)
      continue
    }

    await db.article.update({
      where: { id: article.id },
      data: { createdAt: postDate },
    })

    console.log(
      `  ✏ "${article.title}"\n` +
        `      ${articleDate.toISOString()} → ${postDate.toISOString()}`,
    )
    updated++
  }

  console.log("\n--- Summary ---")
  console.log(`  matched:  ${matched}`)
  console.log(`  updated:  ${updated}`)
  console.log(`  skipped (no matching post): ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
