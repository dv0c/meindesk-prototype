import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

const siteCache = new Map<string, any>();
const tenantCache = new Map<string, any>();

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.nextUrl.hostname;

  // -----------------------------
  // 0️⃣ Skip static assets
  // -----------------------------
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.startsWith("/robots.txt") ||
    url.pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // -----------------------------
  // 0.5️⃣ Skip public non-tenant pages
  // -----------------------------
  const PUBLIC_PATHS = ["/login", "/register", "/api", "/about"];
  if (PUBLIC_PATHS.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // -----------------------------
  // 1️⃣ Dashboard routes
  // -----------------------------
  if (url.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect("/login");

    const match = url.pathname.match(/^\/dashboard\/([^/]+)/);
    if (!match) return NextResponse.next();
    const siteId = match[1];

    let site = siteCache.get(siteId);
    if (!site) {
      site = await db.site.findFirst({
        where: { id: siteId, userId: token.sub },
        include: { features: true },
      });
      if (!site) return NextResponse.redirect("/dashboard");
      siteCache.set(siteId, site);
    }

    const features = site.features || {};
    const pathFeatureMap: Record<string, keyof typeof features> = {
      "/projects/website/articles": "articles",
      "/projects/website/pages": "pages",
      "/projects/website/categories": "categories",
      "/projects/website/media-gallery": "media",
      "/projects/website/analytics": "analytics",
    };

    for (const route in pathFeatureMap) {
      if (url.pathname.startsWith(route) && !features[pathFeatureMap[route]]) {
        return NextResponse.redirect(`/dashboard/${siteId}`);
      }
    }

    const res = NextResponse.next();
    res.headers.set("x-site-id", siteId);
    res.headers.set("x-user-id", token.sub || "");
    return res;
  }

  // -----------------------------
  // 2️⃣ Tenant public pages
  // -----------------------------
  let subdomain = "";
  let tenant: any = null;
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost");

  if (isLocalhost) {
    // Local dev: first path segment as tenant
    const pathSegments = url.pathname.split("/").filter(Boolean);
    subdomain = pathSegments[0];
    if (!subdomain) return NextResponse.next(); // main site or public page
  } else {
    // Production: subdomain.meindesk.gr
    const domainParts = hostname.split(".");
    if (domainParts.length < 3) return NextResponse.next(); // main domain: meindesk.gr
    subdomain = domainParts[0];
  }

  // Fetch tenant from cache or DB
  tenant = tenantCache.get(subdomain);
  if (!tenant) {
    tenant = await db.site.findFirst({
      where: { subdomain },
      include: { features: true },
    });

    if (!tenant) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    tenantCache.set(subdomain, tenant);
  }

  const res = NextResponse.next();
  res.headers.set("x-tenant-id", tenant.id);
  res.headers.set("x-tenant-subdomain", subdomain);

  return res;
}

export const config = {
  matcher: ["/dashboard/:siteId/projects/:path*", "/:path*"],
  runtime: "nodejs",
};
