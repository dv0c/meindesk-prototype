import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://meindesk.gr'

    // Fetch all active sites to include their subdomains
    const sites = await db.site.findMany({
        where: {
            status: 'active'
        },
        select: {
            subdomain: true,
            updatedAt: true
        }
    })

    const tenantEntries: MetadataRoute.Sitemap = sites.map((site) => ({
        url: `https://${site.subdomain}.meindesk.gr`,
        lastModified: site.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...tenantEntries
    ]
}
