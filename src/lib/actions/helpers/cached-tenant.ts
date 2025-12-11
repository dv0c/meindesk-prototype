import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Cached lookup for finding a site by its subdomain.
 * Used in middleware/proxy logic to resolve tenant ID.
 */
export const getCachedSiteIdBySubdomain = unstable_cache(
    async (subdomain: string) => {
        if (!subdomain) return null;
        const site = await db.site.findUnique({
            where: { subdomain },
            select: { id: true },
        });
        return site ? site.id : null;
    },
    ["site-id-by-subdomain"], // cache key parts
    {
        tags: ["site-subdomain-resolution"], // tags for revalidation
        revalidate: 3600, // revalidate every hour (users can manually revalidate on update)
    }
);

/**
 * Cached lookup for site details by ID.
 * Used in Tenant Layout to fetch theme, title, etc.
 */
export const getCachedSiteDetails = unstable_cache(
    async (siteId: string) => {
        if (!siteId) return null;
        return await db.site.findUnique({
            where: { id: siteId },
            select: {
                title: true,
                theme: true,
                defaultThemePreference: true,
                // Add other fields needed by layout
                logo: true,
                description: true,
            },
        });
    },
    ["site-details-by-id"],
    {
        tags: ["site-details"],
        revalidate: 3600,
    }
);
