// app/[tenantId]/layout.tsx (or whichever path your middleware rewrites to)

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import { Theme } from '@/types/site-theme'; // Assuming you placed the Theme type here
import { TenantThemeProvider } from "@/components/TenantThemeProvider";
import { getCachedSiteDetails, getCachedSiteIdBySubdomain } from "@/lib/actions/helpers/cached-tenant";

// Define the shape of the site data we need
type SiteData = {
  title: string;
  theme: any; // Use 'any' here as it's a raw JSON object/string from Prisma
  defaultThemePreference: string;
};

// --- Main Layout Component ---

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  // 1. Get Tenant ID from Middleware Header
  const requestHeaders = await headers();
  const tenantHeader = requestHeaders.get("x-tenant");

  // Fallback Logic: Assuming 'prototype' is a special tenant handled directly
  const isDefaultTenant = tenantHeader === "prototype";
  const tenantLookupId = isDefaultTenant ? "prototype" : tenantHeader;

  let site: SiteData | null = null;

  // 2. Fetch Site Data
  try {
    let siteIdToFetch = null;

    if (tenantLookupId) {
      if (isDefaultTenant) {
        siteIdToFetch = await getCachedSiteIdBySubdomain(tenantLookupId);
      } else {
        siteIdToFetch = tenantLookupId;
      }
    }

    if (siteIdToFetch) {
      site = await getCachedSiteDetails(siteIdToFetch);
    }
  } catch (error) {
    console.error("Database query failed in TenantLayout:", error);
    // In a real app, you might render a specific error page here
    return (
      <html>
        <body>
          <h1>A database error occurred.</h1>
        </body>
      </html>
    );
  }

  // 3. Handle Not Found
  if (!site) {
    // Use Next.js built-in notFound function for better error handling
    return notFound();
  }

  // 4. Parse Theme Data (Crucial step from previous discussion)
  let tenantTheme: Theme | null = null;
  try {
    // Prisma returns a JSON string for MongoDB Json fields, so we parse it.
    tenantTheme = site.theme
  } catch (e) {
    console.error("Failed to parse tenant theme JSON:", e);
    // You might load a default theme if parsing fails
  }

  // Determine the mode (e.g., 'light' or 'dark'). 
  // In a real app, this would check the user's cookie/local storage, 
  // but for a Server Component, you can use the preference if no cookie is set.
  const initialMode = site.defaultThemePreference === 'dark' ? 'dark' : 'light';

  // 5. Render with Theme Provider
  return children
}