import "./lib/bootstrap"
import { prismaClient } from "../src/lib/prisma-client"
import { disconnectScriptDb } from "./lib/prisma-script"

async function main() {
  const siteId = process.argv[2]
  if (!siteId) {
    console.error("Usage: npx tsx scripts/enable-site-analytics.ts <siteId>")
    process.exit(1)
  }

  const site = await prismaClient.site.findUnique({
    where: { id: siteId },
    select: { settings: true, url: true },
  })
  if (!site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  const settings = (site.settings ?? {}) as Record<string, unknown>
  const frontend =
    typeof settings.frontend === "object" && settings.frontend !== null
      ? (settings.frontend as Record<string, unknown>)
      : {}

  await prismaClient.site.update({
    where: { id: siteId },
    data: {
      settings: {
        ...settings,
        frontend: {
          ...frontend,
          publicUrl: frontend.publicUrl ?? "https://sophiaplatanisioti.gr",
        },
        analyticsConnected: true,
      },
    },
  })

  console.log(`analyticsConnected enabled for ${site.url ?? siteId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
