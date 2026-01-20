
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    console.log('--- Checking Sites ---')
    const sites = await db.site.findMany({
        select: { id: true, subdomain: true, title: true }
    })
    console.log(`Found ${sites.length} sites.`)

    for (const site of sites) {
        console.log(`\nSite: ${site.title} (ID: ${site.id}, Subdomain: ${site.subdomain})`)

        // Check snippets for this site
        const snippets = await db.snippet.findMany({
            where: { siteId: site.id },
            select: { id: true, name: true, category: true }
        })

        if (snippets.length === 0) {
            console.log('  No snippets found.')
        } else {
            snippets.forEach(s => {
                console.log(`  - Snippet [${s.category}]: ${s.name} (ID: ${s.id})`)
            })
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
