import { NextRequest, NextResponse } from "next/server";
import { db } from "./lib/db";
import { getCachedSiteIdBySubdomain } from "./lib/actions/helpers/cached-tenant";

// Define your application's base domain here
const APP_BASE_DOMAIN = process.env.NODE_ENV === "development" ? "localhost:3000" : "meindesk.gr";
const DEFAULT_TENANT_SUBDOMAIN = "prototype"; // The slug for the default tenant app

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // 1. Identify Subdomain
  const isLocalhost = host.includes("localhost");
  const hostParts = host.split(".");
  let subdomain: string | null = null;
  let isNakedDomain = false;

  // Logic to determine if a subdomain exists
  if (isLocalhost) {
    if (hostParts.length > 1 && !hostParts[0].includes(':')) {
      subdomain = hostParts[0];
    } else {
      isNakedDomain = true;
    }
  } else if (hostParts.length > 2) {
    subdomain = hostParts[0];
  } else {
    isNakedDomain = true;
  }

  // Normalize and exclude 'www'
  const normalizedSubdomain = subdomain ? subdomain.toLowerCase() : null;
  const isWWW = normalizedSubdomain === "www";

  // 2. Handle Naked Domain (Main/Marketing Site)
  if (isNakedDomain || isWWW) {
    // Allows the request to proceed to /page.tsx or other main app routes.
    const res = NextResponse.next();
    res.headers.set("x-tenant", "default-site");
    return res;
  }

  // 3. Handle Tenant (Prototype or Custom)
  let tenantId: string | null = null;
  const isPrototypeTenant = normalizedSubdomain === DEFAULT_TENANT_SUBDOMAIN;

  // normalizedSubdomain is guaranteed non-null here
  try {
    const id = await getCachedSiteIdBySubdomain(normalizedSubdomain!);

    if (id) {
      tenantId = id;
    }
  } catch (err) {
    console.error("Tenant database resolution failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  // 4. Perform Rewriting or 404
  if (!tenantId) {
    // Tenant (Prototype or Custom) not found in DB
    console.log(`Tenant '${normalizedSubdomain}' not found. Showing 404.`);

    // Return a 404 for any subdomain that doesn't exist in the DB.
    return new NextResponse("Tenant Not Found", { status: 404 });
  }

  // ✅ Rewrite the URL to the tenant route.
  // This now covers both 'prototype' and custom tenants dynamically.
  url.pathname = `/${tenantId}${url.pathname}`;

  const res = NextResponse.rewrite(url);
  res.headers.set("x-tenant", tenantId);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|assets|images).*)",
  ],
};