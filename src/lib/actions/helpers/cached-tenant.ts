import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Validates if a string is a valid MongoDB ObjectID
 * MongoDB ObjectIDs are 24-character hex strings
 */
export function isValidObjectId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    // MongoDB ObjectIDs are exactly 24 characters and contain only hex digits
    return /^[0-9a-fA-F]{24}$/.test(id);
}

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

    // Validate that siteId is a valid MongoDB ObjectID
    if (!isValidObjectId(siteId)) {
        console.error(`Invalid MongoDB ObjectID: "${siteId}". ObjectIDs must be 24-character hex strings.`);
        return null;
    }

    try {
        // Try to use cache if available
        const cachedFn = unstable_cache(
            async (id: string) => {
                // 1. Fetch Site Details
                const site = await db.site.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        title: true,
                        theme: true,
                        defaultThemePreference: true,
                        logo: true,
                        description: true,
                        settings: true,
                        home_Id: true, // Need this to find home page
                        url: true, // For analytics tracking
                    },
                });

                if (!site) return null;

                // 2. Smart Fallback for Favicon
                // If settings.favicon is missing, try to get it from the Home Page
                const settings = (site.settings && typeof site.settings === 'object' ? site.settings : {}) as any;



                if (!settings.favicon && site.home_Id) {
                    try {
                        const homePage = await db.page.findUnique({
                            where: {
                                slug_siteId: {
                                    slug: site.home_Id,
                                    siteId: site.id
                                }
                            },
                            select: { meta: true }
                        });

                        const pageMeta = homePage?.meta as any;


                        if (pageMeta?.seo?.favicon) {
                            settings.favicon = pageMeta.seo.favicon;
                        }
                    } catch (e) {
                        console.warn("Failed to fetch home page favicon fallback", e);
                    }
                }


                return {
                    ...site,
                    settings
                };
            },
            ["site-details-by-id-v2", siteId],
            {
                tags: ["site-details-v2"],
                revalidate: 3600,
            }
        );

        return await cachedFn(siteId);
    } catch (err) {
        // Fallback to direct query if cache is unavailable
        console.warn("Cache unavailable, using direct query for site details");
        const site = await db.site.findUnique({
            where: { id: siteId },
            select: {
                id: true,
                title: true,
                theme: true,
                defaultThemePreference: true,
                logo: true,
                description: true,
                settings: true,
                home_Id: true,
                url: true,
            },
        });

        if (site) {
            // Direct query fallback logic (duplicate of above for safety)
            const settings = (site.settings && typeof site.settings === 'object' ? site.settings : {}) as any;
            if (!settings.favicon && site.home_Id) {
                try {
                    const homePage = await db.page.findUnique({
                        where: {
                            slug_siteId: {
                                slug: site.home_Id,
                                siteId: site.id
                            }
                        },
                        select: { meta: true }
                    });
                    const pageMeta = homePage?.meta as any;
                    if (pageMeta?.seo?.favicon) {
                        settings.favicon = pageMeta.seo.favicon;
                    }
                } catch (e) { /* ignore */ }
            }
            return { ...site, settings };
        }
        return null;
    }

}
