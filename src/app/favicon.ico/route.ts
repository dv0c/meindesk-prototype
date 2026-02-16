
import { type NextRequest, NextResponse } from "next/server";
import { getCachedSiteIdBySubdomain, getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant";

export const dynamic = 'force-dynamic'; // Ensure headers are read on every request

export async function GET(req: NextRequest) {
    try {
        // 1. Resolve Tenant from Host
        const host = req.headers.get("host") || "";
        // Handle localhost/port stripping if needed, though getCachedSiteIdBySubdomain usually expects subdomain
        // Assuming middleware rewriting logic matches: 
        // If we are at "tenant.meindesk.com", host is "tenant.meindesk.com"
        // We need to extract the subdomain or pass the host if that's what the helper expects.
        // getCachedSiteIdBySubdomain implementation takes "subdomain".

        // Simple subdomain extraction (adjust based on your actual domain logic)
        // If prod: tenant.domain.com -> tenant
        // If localhost: tenant.localhost:3000 -> tenant
        let subdomain = null;
        if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
            subdomain = host.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "");
        } else {
            // Fallback for dev/simple cases if env not set (or localhost handling)
            const parts = host.split(".");
            if (parts.length > 1) subdomain = parts[0];
        }

        // Edge case: if host IS the root domain, no subdomain
        if (host === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
            subdomain = null;
        }

        let siteId: string | null = null;
        if (subdomain) {
            const resolvedId = await getCachedSiteIdBySubdomain(subdomain);
            if (resolvedId) {
                siteId = resolvedId;
            }
        }

        if (!siteId) {
            siteId = await getCachedSiteIdBySubdomain("prototype");
        }

        if (!siteId) {
            return new NextResponse(null, { status: 404 });
        }

        // 2. Fetch Site Details (includes smart fallback logic we added)
        const site = await getCachedSiteDetails(siteId);

        // 3. Get Favicon URL
        const faviconUrl = (site?.settings as any)?.favicon;

        if (faviconUrl) {
            // 4. Fetch the image content
            const imageRes = await fetch(faviconUrl);
            if (imageRes.ok) {
                const contentType = imageRes.headers.get("content-type") || "image/x-icon";
                const arrayBuffer = await imageRes.arrayBuffer();

                return new NextResponse(arrayBuffer, {
                    headers: {
                        "Content-Type": contentType === 'image/svg+xml' ? 'image/svg+xml' : 'image/x-icon',
                        // Cache for performance
                        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error serving dynamic favicon:", error);
    }

    // 5. Fallback if everything fails (return 404 or a default 1x1 buffer)
    return new NextResponse(null, { status: 404 });
}
