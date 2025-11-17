// app/[tenantId]/layout.tsx (or whichever path your middleware rewrites to)

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import { Theme } from '@/types/site-theme'; // Assuming you placed the Theme type here
import { TenantThemeProvider } from "@/components/TenantThemeProvider";

// Define the shape of the site data we need
type SiteData = {
  title: string;
  theme: any; // Use 'any' here as it's a raw JSON object/string from Prisma
  defaultThemePreference: string;
};

// --- Main Layout Component ---

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  // 1. Get Tenant ID from Middleware Header
  const requestHeaders = headers();
  const tenantHeader = requestHeaders.get("x-tenant");

  // Fallback Logic: Assuming 'prototype' is a special tenant handled directly
  const isDefaultTenant = tenantHeader === "prototype";
  const tenantLookupId = isDefaultTenant ? "prototype" : tenantHeader;

  let site: SiteData | null = null;

  // 2. Fetch Site Data
  try {
    if (tenantLookupId) {
      site = await db.site.findUnique({
        where: isDefaultTenant
          ? { subdomain: tenantLookupId }
          : { id: tenantLookupId },
        select: {
          title: true,
          theme: true,
          defaultThemePreference: true,
          // Include other layout-level fields (logo, etc.) here
        }
      });
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
    tenantTheme = JSON.parse(site.theme as string) as Theme;
  } catch (e) {
    console.error("Failed to parse tenant theme JSON:", e);
    // You might load a default theme if parsing fails
  }

  // Determine the mode (e.g., 'light' or 'dark'). 
  // In a real app, this would check the user's cookie/local storage, 
  // but for a Server Component, you can use the preference if no cookie is set.
  const initialMode = site.defaultThemePreference === 'dark' ? 'dark' : 'light';

  // 5. Render with Theme Provider
  return (
    <TenantThemeProvider themeData={tenantTheme} initialMode={initialMode}>
      {/* The TenantThemeProvider (Client Component) handles:
        1. Injecting the <style> tag with CSS variables into the DOM.
        2. Wrapping its children with the className (e.g., 'dark' or 'light').
      */}

      {/* You can optionally add 'suppressHydrationWarning' to the <html> tag 
          if you render theme classes there, but using the Provider wrapper is cleaner. */}
      <html>
        <body>
          <header className="p-4 border-b bg-card text-card-foreground">
            {/* Use Tailwind classes that rely on the injected CSS variables */}
            <h1>{site.title}</h1>
          </header>

          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </body>
      </html>
    </TenantThemeProvider>
  );
}