import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

const tenantCache = new Map<string, any>();

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.nextUrl.hostname; // e.g., tenant1.example.com

  // 1️⃣ Dashboard routes: only check auth
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.redirect("/login");

    // Optional: siteId check if needed
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean); // ["dashboard", ":siteId", ...]
    const siteId = pathSegments[1];
    if (!siteId) return NextResponse.redirect("/dashboard");

    const site = await db.site.findFirst({
      where: { id: siteId, userId: token.sub },
      include: { features: true },
    });

    if (!site) return NextResponse.redirect("/dashboard");

    return NextResponse.next();
  }

  // 2️⃣ Tenant handling
  let subdomain = "";
  let tenant: any = null;

  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost");

  if (isLocalhost) {
    // ✅ Local dev fallback: tenant via path /:tenant/...
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    subdomain = pathSegments[0]; // /meindesk/page → "meindesk"
    if (!subdomain) return NextResponse.next(); // main site
  } else {
    // ✅ Production: tenant via subdomain
    const domainParts = hostname.split(".");
    if (domainParts.length < 3) return NextResponse.next(); // main domain
    subdomain = domainParts[0];
  }

  // 3️⃣ Fetch tenant info (DB + cache)
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

  // 4️⃣ Attach tenant info to headers for pages/API
  const res = NextResponse.next();
  res.headers.set("x-tenant-id", tenant.id);
  res.headers.set("x-tenant-subdomain", subdomain);

  return res;
}

// Middleware applies to dashboard and public routes
export const config = {
  matcher: ["/dashboard/:path*", "/:path*"],
  runtime: "nodejs",
};
