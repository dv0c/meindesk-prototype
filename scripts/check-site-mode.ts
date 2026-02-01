import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "../src/generated/client"

const db = new PrismaClient()

async function main() {
    console.log("Searching for site 'Greece Athens Transfers'...")
    const site = await db.site.findFirst({
        where: { title: "Greece Athens Transfers" }
    })

    if (site) {
        console.log(`Found Site: ${site.title}`)
        console.log(`ID: ${site.id}`)
        console.log(`Settings:`, site.settings)
    } else {
        console.log("Site not found with that title.")
        // List all sites to help debug
        const allSites = await db.site.findMany({ select: { id: true, title: true } })
        console.log("Available Sites:", allSites)
    }
}

main()
    .catch(e => console.error(e))
