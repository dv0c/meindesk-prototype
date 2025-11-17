import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const tenantCache = new Map<string, any>();

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.nextUrl.hostname;

  // Ignore main domain and dashboard
  if (
    hostname === "example.com" || 
    req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.next();
  }

  const domainParts = hostname.split(".");
  if (domainParts.length < 3) {
    return NextResponse.next();
  }

  const subdomain = domainParts[0];

  // Fetch tenant info
  let tenant = tenantCache.get(subdomain);
  if (!tenant) {
    tenant = await db.site.findFirst({
      where: { subdomain },
      include: { features: true }, // fetch enabled features
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
  matcher: ["/((?!dashboard).*)"], // everything except /dashboard
  runtime: "nodejs",
};
