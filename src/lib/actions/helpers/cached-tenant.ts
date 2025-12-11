import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Cached lookup for finding a site by its subdomain.
 * Used in middleware/proxy logic to resolve tenant ID.
 * Falls back to direct query if cache is unavailable (e.g., in edge runtime)
 */
export async function getCachedSiteIdBySubdomain(subdomain: string) {
    if (!subdomain) return null;

    try {
        // Try to use cache if available
        const cachedFn = unstable_cache(
            async (sub: string) => {
                const site = await db.site.findUnique({
                    where: { subdomain: sub },
                    select: { id: true },
                });
                return site ? site.id : null;
            },
            ["site-id-by-subdomain", subdomain],
            {
                tags: ["site-subdomain-resolution"],
                revalidate: 3600,
            }
        );

        return await cachedFn(subdomain);
    } catch (err) {
        // Fallback to direct query if cache is unavailable
        console.warn("Cache unavailable, using direct query for tenant lookup");
        const site = await db.site.findUnique({
            where: { subdomain },
            select: { id: true },
        });
        return site ? site.id : null;
    }
}

/**
 * Cached lookup for site details by ID.
 * Used in Tenant Layout to fetch theme, title, etc.
 * Falls back to direct query if cache is unavailable
 */
export async function getCachedSiteDetails(siteId: string) {
    if (!siteId) return null;

    try {
        // Try to use cache if available
        const cachedFn = unstable_cache(
            async (id: string) => {
                return await db.site.findUnique({
                    where: { id },
                    select: {
                        title: true,
                        theme: true,
                        defaultThemePreference: true,
                        logo: true,
                        description: true,
                    },
                });
            },
            ["site-details-by-id", siteId],
            {
                tags: ["site-details"],
                revalidate: 3600,
            }
        );

        return await cachedFn(siteId);
    } catch (err) {
        // Fallback to direct query if cache is unavailable
        console.warn("Cache unavailable, using direct query for site details");
        return await db.site.findUnique({
            where: { id: siteId },
            select: {
                title: true,
                theme: true,
                defaultThemePreference: true,
                logo: true,
                description: true,
            },
        });
    }
}
