import { NextRequest, NextResponse } from "next/server";
// Assuming './lib/db' and 'db' are correct for your setup
import { db } from "./lib/db";

// Define your application's base domain here
const APP_BASE_DOMAIN = "yourdomain.com"; // e.g., "mytenantapp.com"

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // 1. Identify Subdomain
  // This logic works for standard domains (e.g., test.yourdomain.com)
  // and local development (e.g., test.localhost:3000)
  const isLocalhost = host.includes("localhost");
  const hostParts = host.split(".");

  let subdomain: string | null = null;

  if (isLocalhost) {
    // For localhost: subdomain is the first part, e.g., 'test' from 'test.localhost:3000'
    subdomain = hostParts[0];
  } else if (hostParts.length > 2) {
    // For production: subdomain is the first part, e.g., 'test' from 'test.yourdomain.com'
    subdomain = hostParts[0];
  } else if (
    (hostParts.length === 2 && hostParts[1] === "com") ||
    hostParts[1] === "co" ||
    hostParts[1] === "net"
  ) {
    // Handle domains like yourdomain.com, where there is no subdomain (subdomain remains null)
    // You might need more robust logic for TLDs
  }

  // Normalize and exclude common prefixes
  const normalizedSubdomain = subdomain ? subdomain.toLowerCase() : null;
  const isDefault =
    !normalizedSubdomain || ["www", "prototype"].includes(normalizedSubdomain);

  // 2. Handle Default Tenant (e.g., prototype.yourdomain.com or www.yourdomain.com)
  if (isDefault) {
    // ⚠️ IMPORTANT: If you want to serve the main site,
    // you should rewrite to your main app path (e.g., /app/home).
    // The current URL is fine if the Next.js routing handles the root.
    const res = NextResponse.next();
    // Still useful to set the header for backend logic
    res.headers.set("x-tenant", "prototype");
    return res;
  }

  // 3. Handle Custom Tenant (Subdomain present)
  let tenantId: string | null = null;

  try {
    const site = await db.site.findUnique({
      where: { subdomain: normalizedSubdomain! }, // normalizedSubdomain is guaranteed non-null here
      select: { id: true },
    });

    if (site) {
      tenantId = site.id;
    }
  } catch (err) {
    console.error("Tenant database resolution failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  // 4. Perform Rewriting or Redirect/404
  if (!tenantId) {
    // Tenant not found in DB
    // You can redirect to the main app or show a 404
    console.log(`Tenant '${normalizedSubdomain}' not found.`);
    // For a smoother experience, you might redirect to a 'tenant not found' page on your main domain.
    // e.g., return NextResponse.redirect(new URL('/tenant-not-found', `https://${APP_BASE_DOMAIN}`));
    return NextResponse.redirect(new URL('/', `https://www.meindesk.gr/`))
  }

  // ✅ Rewrite the URL to a dynamic route like '/app/[tenantId]' or '/[tenantId]'
  // The original URL path (e.g., /settings) is preserved.
  // Example: req.url = 'http://test.yourdomain.com/settings'
  // rewrites to: 'http://test.yourdomain.com/app/test-id/settings'

  // Set the tenant ID for server-side access
  url.pathname = `/${tenantId}${url.pathname}`;

  const res = NextResponse.rewrite(url);
  // Optional: Set header for additional server-side context (recommended)
  res.headers.set("x-tenant", tenantId);

  return res;
}

export const config = {
  // Use a restrictive matcher to apply the middleware only where needed
  // This is a common pattern to exclude static files and API routes you don't want to tenant-scope
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|assets|images).*)",
  ],
  runtime: "nodejs",
};
  