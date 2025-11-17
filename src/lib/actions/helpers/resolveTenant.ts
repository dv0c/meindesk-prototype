// lib/actions/helpers/resolveTenant.ts
import { db } from "@/lib/db";

export interface TenantResult {
  tenant: any; // replace with your Tenant type
  pagePath: string;
  page?: any; // optional page content
}

/**
 * Resolves tenant from slug array and fetches page content optionally.
 * Ignores default subdomain/main app.
 */
export async function resolveTenant(slug: string[], hostname?: string): Promise<TenantResult | null> {
  if (!slug || slug.length === 0) return null;

  const DEFAULT_SUBDOMAIN = "prototype"; // main app subdomain
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

  let subdomain = slug[0];

  // Normalize if full domain is passed
  if (subdomain.includes(".")) {
    subdomain = subdomain.split(".")[0].toLowerCase();
  }

  // Ignore default/main app subdomain
  if (subdomain === DEFAULT_SUBDOMAIN || hostname === ROOT_DOMAIN) {
    return null; // not a tenant
  }

  // Lookup tenant in DB
  const tenant = await db.site.findUnique({
    where: { subdomain },
    include: { features: true },
  });

  if (!tenant) return null;

  // Remaining slug as page path
  const pagePath = slug.slice(1).join("/") || "home";

  // Optional: fetch page content
  const page = await db.page.findFirst({
    where: { siteId: tenant.id, slug: pagePath },
  });

  return { tenant, pagePath, page };
}
