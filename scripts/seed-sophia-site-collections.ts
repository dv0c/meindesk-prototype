/**
 * Seed site-sections + navigation-links collections for a site.
 *
 * Usage: npx tsx scripts/seed-sophia-site-collections.ts <siteId>
 */
import "./lib/bootstrap"
import { ensureSophiaFrontendCollections } from "../src/lib/site-collections/ensure"
import { disconnectScriptDb } from "./lib/prisma-script"

async function main() {
  const siteId = process.argv[2]
  if (!siteId) {
    console.error("Usage: npx tsx scripts/seed-sophia-site-collections.ts <siteId>")
    process.exit(1)
  }

  const { siteSections, navigationLinks } = await ensureSophiaFrontendCollections(siteId)
  console.log("Created/verified collections:")
  console.log("  site-sections:", siteSections.id, siteSections.slug)
  console.log("  navigation-links:", navigationLinks.id, navigationLinks.slug)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
