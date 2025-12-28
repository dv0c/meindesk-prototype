import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://meindesk.gr'

    // Static marketing routes
    const staticRoutes = [
        '',
        '/pricing',
        '/product/blog-builder',
        '/product/cms',
        '/product/rss',
        '/features/editor',
        '/features/seo',
        '/features/analytics',
        '/features/themes',
        '/resources/documentation',
        '/resources/api-reference',
        '/support/help-center',
        '/support/community',
    ]

    const marketingEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.8,
    }))

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
        priority: 0.7,
    }))

    return [
        ...marketingEntries,
        ...tenantEntries
    ]
}
