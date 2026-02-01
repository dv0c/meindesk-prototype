import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/client"

const db = new PrismaClient()

async function main() {
    const siteId = "697285eada75672646ff8d55"
    console.log(`Updating site: ${siteId} to CMS mode...`)

    const site = await db.site.findUnique({
        where: { id: siteId }
    })

    if (!site) {
        console.error("Site not found!")
        process.exit(1)
    }

    const currentSettings = (site.settings as any) || {}
    const newSettings = { ...currentSettings, mode: "cms" }

    await db.site.update({
        where: { id: siteId },
        data: {
            settings: newSettings
        }
    })

    console.log("Success! Site mode set to 'cms'.")
    console.log("New Settings:", newSettings)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
