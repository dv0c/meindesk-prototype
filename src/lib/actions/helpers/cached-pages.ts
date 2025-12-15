import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Cached page lookup with proper revalidation tags
 * Enables on-demand cache invalidation when pages are updated
 */
export const getCachedPage = unstable_cache(
    async (pageId: string) => {
        return await db.page.findUnique({
            where: { id: pageId },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                layout: true,
                status: true,
                siteId: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    },
    ['page-data'],
    {
        tags: ['pages'],
        revalidate: 3600, // 1 hour
    }
);

/**
 * Cached page lookup by slug and tenant ID
 * For dynamic route resolution
 */
export const getCachedPageBySlug = unstable_cache(
    async (slug: string, tenantId: string) => {
        return await db.page.findFirst({
            where: {
                slug,
                siteId: tenantId
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                layout: true,
                status: true,
                siteId: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    },
    ['page-by-slug'],
    {
        tags: ['pages'],
        revalidate: 3600,
    }
);

/**
 * Cached tenant pages list
 * For generating static params
 */
export const getCachedTenantPages = unstable_cache(
    async (tenantId: string, limit: number = 50) => {
        return await db.page.findMany({
            where: {
                siteId: tenantId,
                status: 'published',
            },
            select: {
                id: true,
                slug: true,
                title: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
    },
    ['tenant-pages'],
    {
        tags: ['pages'],
        revalidate: 3600,
    }
);
