import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

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
  // 0.5️⃣ Skip public pages
  // -----------------------------
  const PUBLIC_PATHS = ["/login", "/register", "/api", "/about"];
  if (PUBLIC_PATHS.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // -----------------------------
  // 1️⃣ Dashboard routes: auth + feature checks
  // -----------------------------
  if (url.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect("/login");

    const match = url.pathname.match(/^\/dashboard\/([^/]+)/);
    if (!match) return NextResponse.next(); // Not a site route
    const siteId = match[1];

    const site = await db.site.findFirst({
      where: { id: siteId, userId: token.sub },
      include: { features: true },
    });

    if (!site) return NextResponse.redirect("/dashboard");

    const features = site.features || {};
    const pathFeatureMap: Record<string, keyof typeof features> = {
      "/projects/website/articles": "articles",
      "/projects/website/pages": "pages",
      "/projects/website/categories": "categories",
      "/projects/website/media-gallery": "media",
      "/projects/website/analytics": "analytics",
    } as any;

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
  // 2️⃣ Tenant pages
  // -----------------------------
  let subdomain = "";
  let tenant: any = null;
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost");

  if (isLocalhost) {
    // DEV: first path segment as tenant
    const pathSegments = url.pathname.split("/").filter(Boolean);
    subdomain = pathSegments[0] || "";
    if (!subdomain) return NextResponse.next(); // main site in dev
  } else {
    // PROD: any subdomain other than root domain is tenant
    if (hostname === "meindesk.gr") return NextResponse.next(); // root domain → homepage
    const domainParts = hostname.split(".");
    subdomain = domainParts[0].toLowerCase(); // normalize
  }

  // -----------------------------
  // Lookup tenant in DB
  // -----------------------------
  tenant = await db.site.findFirst({
    where: { subdomain },
    include: { features: true },
  });

  if (!tenant) {
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  // -----------------------------
  // Attach tenant headers
  // -----------------------------
  const res = NextResponse.next();
  res.headers.set("x-tenant-id", tenant.id);
  res.headers.set("x-tenant-subdomain", subdomain);
  return res;
}

// -----------------------------
// Middleware matcher
// -----------------------------
export const config = {
  matcher: ["/dashboard/:siteId/projects/:path*", "/:path*"],
  runtime: "nodejs",
};
