/**
 * @deprecated Use scripts/seed-sophia-static-pages.ts
 */
import { spawnSync } from "child_process"
import { resolve } from "path"

const siteId = process.argv[2]
const exportPath = process.argv[3]

if (!siteId) {
  console.error(
    "Usage: npx tsx scripts/seed-sophia-ypiresies-page.ts <siteId> [legacy-export.json]",
  )
  process.exit(1)
}

const script = resolve(__dirname, "seed-sophia-static-pages.ts")
const args = [script, siteId, exportPath].filter(Boolean) as string[]

const result = spawnSync("npx", ["tsx", ...args], { stdio: "inherit" })
process.exit(result.status ?? 1)
