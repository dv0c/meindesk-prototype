// app/[tenantId]/layout.tsx (or whichever path your middleware rewrites to)

import { getCachedSiteDetails, getCachedSiteIdBySubdomain } from "@/lib/actions/helpers/cached-tenant";
import { Theme } from '@/types/site-theme';
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { sanitizeCSS } from "@/lib/security/sanitize-css";
import { sanitizeColor, sanitizeFontFamily } from "@/lib/security/validate-inputs";

// Define the shape of the site data we need
type SiteData = {
  title: string;
  theme: any;
  defaultThemePreference: string;
  settings?: any;
};

// Define WebsiteSettings type
type WebsiteSettings = {
  title?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  globalCss?: string;
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
    return (
      <div>
        <h1>A database error occurred.</h1>
      </div>
    );
  }

  // 3. Handle Not Found
  if (!site) {
    return notFound();
  }

  // 5. Extract Global Settings
  const settings: WebsiteSettings = site.settings || {};
  const {
    theme: settingsTheme = {},
    globalCss = ''
  } = settings;

  // **SECURITY**: Re-sanitize for defense in depth
  const safeGlobalCss = sanitizeCSS(globalCss);
  const safePrimaryColor = settingsTheme.primaryColor ? sanitizeColor(settingsTheme.primaryColor) : undefined;
  const safeSecondaryColor = settingsTheme.secondaryColor ? sanitizeColor(settingsTheme.secondaryColor) : undefined;
  const safeBackgroundColor = settingsTheme.backgroundColor ? sanitizeColor(settingsTheme.backgroundColor) : undefined;
  const safeTextColor = settingsTheme.textColor ? sanitizeColor(settingsTheme.textColor) : undefined;
  const safeFontFamily = settingsTheme.fontFamily ? sanitizeFontFamily(settingsTheme.fontFamily) : undefined;

  // Build CSS variables for colors (using sanitized values)
  const cssVariables = [
    safePrimaryColor ? `--color-primary: ${safePrimaryColor};` : '',
    safeSecondaryColor ? `--color-secondary: ${safeSecondaryColor};` : '',
    safeBackgroundColor ? `--color-background: ${safeBackgroundColor};` : '',
    safeTextColor ? `--color-text: ${safeTextColor};` : '',
  ].filter(Boolean).join(' ');

  // Apply background color and text color as inline styles (using sanitized values)
  const wrapperStyle: React.CSSProperties = {};
  if (safeBackgroundColor) {
    wrapperStyle.backgroundColor = safeBackgroundColor;
  }
  if (safeTextColor) {
    wrapperStyle.color = safeTextColor;
  }
  if (safeFontFamily) {
    wrapperStyle.fontFamily = `'${safeFontFamily}', sans-serif`;
  }

  // 6. Render with Global Settings
  return (
    <>
      {/* Google Fonts */}
      {safeFontFamily && safeFontFamily !== 'Inter' && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${safeFontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* Global CSS Variables and Custom CSS (using sanitized CSS) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${cssVariables}
          }
          ${safeFontFamily ? `body { font-family: '${safeFontFamily}', sans-serif; }` : ''}
          ${safeGlobalCss}
        `
      }} />

      {/* Wrapper with background and text color */}
      <div style={wrapperStyle} className="min-h-screen">
        {children}
      </div>
    </>
  )
}

// Export metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const tenantHeader = requestHeaders.get("x-tenant");
  const isDefaultTenant = tenantHeader === "prototype";
  const tenantLookupId = isDefaultTenant ? "prototype" : tenantHeader;

  let site: SiteData | null = null;

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
    console.error("Failed to load metadata:", error);
  }

  const settings: WebsiteSettings = site?.settings || {};

  return {
    title: settings.title || site?.title || 'Website',
    description: settings.description || '',
  };
}