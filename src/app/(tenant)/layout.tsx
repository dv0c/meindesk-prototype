// app/[tenantId]/layout.tsx (or whichever path your middleware rewrites to)

import { getCachedSiteDetails, getCachedSiteIdBySubdomain } from "@/lib/actions/helpers/cached-tenant";
import { Theme } from '@/types/site-theme';
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { sanitizeCSS } from "@/lib/security/sanitize-css";
import { sanitizeColor, sanitizeFontFamily } from "@/lib/security/validate-inputs";
import type { WebsiteSettings } from "@/lib/types";

// Define the shape of the site data we need (matching Prisma's return type)
type SiteData = {
  title: string;
  description: string | null;
  logo: string | null;
  theme: any;
  defaultThemePreference: string;
  settings: any; // JsonValue from Prisma, will be converted to WebsiteSettings
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Database Connection Error
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're having trouble connecting to the database. This is usually temporary.
              Please try again in a moment.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go Home
              </a>
            </div>

            {/* Support */}
            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Handle Not Found
  if (!site) {
    return notFound();
  }

  // 5. Extract Global Settings
  // Convert JsonValue from Prisma to WebsiteSettings (null becomes empty object)
  const settings: WebsiteSettings = (site.settings && typeof site.settings === 'object' ? site.settings : {}) as WebsiteSettings;
  const {
    theme: settingsTheme = {} as WebsiteSettings['theme'],
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

  // Apply theme mode class
  const themeMode = settingsTheme.mode || 'light';
  const themeClassName = themeMode === 'dark' ? 'dark' : '';

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

      {/* Load Heading Font from theme */}
      {settingsTheme.headingFont && settingsTheme.headingFont !== 'System Default' && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${settingsTheme.headingFont.replace(/\s+/g, '+')}:wght@400;500;600;700;800;900&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* Load Body Font from theme */}
      {settingsTheme.bodyFont && settingsTheme.bodyFont !== 'System Default' && settingsTheme.bodyFont !== settingsTheme.headingFont && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${settingsTheme.bodyFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* Global CSS Variables and Custom CSS (using sanitized CSS) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${cssVariables}
            ${settingsTheme.headingFont && settingsTheme.headingFont !== 'System Default' ? `--font-heading: '${settingsTheme.headingFont}', sans-serif;` : ''}
            ${settingsTheme.bodyFont && settingsTheme.bodyFont !== 'System Default' ? `--font-body: '${settingsTheme.bodyFont}', sans-serif;` : ''}
          }
          ${safeFontFamily ? `body { font-family: '${safeFontFamily}', sans-serif; }` : ''}
          ${settingsTheme.headingFont && settingsTheme.headingFont !== 'System Default' ? `h1, h2, h3, h4, h5, h6 { font-family: '${settingsTheme.headingFont}', sans-serif; }` : ''}
          ${settingsTheme.bodyFont && settingsTheme.bodyFont !== 'System Default' ? `body, p, span, div { font-family: '${settingsTheme.bodyFont}', sans-serif; }` : ''}
          ${safeGlobalCss}
        `
      }} />

      {/* Wrapper with background and text color */}
      <div style={wrapperStyle} className={`min-h-screen ${themeClassName}`}>
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

  const settings: WebsiteSettings = site?.settings as WebsiteSettings || {} as WebsiteSettings;
  const seo = settings.seo || {};




  // Build metadata object
  const metadata: Metadata = {
    title: seo.metaTitle || settings.title || site?.title || 'Website',
    description: seo.metaDescription || settings.description || '',
    keywords: seo.keywords?.split(',').map(k => k.trim()),
    authors: seo.author ? [{ name: seo.author }] : undefined,
    robots: seo.robots || 'index, follow',
    alternates: seo.canonical ? {
      canonical: seo.canonical,
    } : undefined,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || settings.title || site?.title || 'Website',
      description: seo.ogDescription || seo.metaDescription || settings.description || '',
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      type: (seo.ogType as any) || 'website',
    },
    twitter: {
      card: seo.twitterCard || 'summary',
      site: seo.twitterSite,
      creator: seo.twitterCreator,
      title: seo.ogTitle || seo.metaTitle || settings.title || site?.title,
      description: seo.ogDescription || seo.metaDescription || settings.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    icons: {
      icon: settings.favicon || '/favicon.ico'
    },
  };

  return metadata;
}