import { NextRequest, NextResponse } from "next/server";
import { db } from "./lib/db";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = new URL(req.url);
  const pathname = url.pathname;

  const domainParts = host.split(".");
  const subdomain = domainParts.length > 2 ? domainParts[0].toLowerCase() : null;

  // Routes that always belong to the base (prototype) app
  const baseRoutes = ["/dashboard", "/login", "/api/auth"];

  // Check if request path starts with one of the base routes
  const isBaseRoute = baseRoutes.some((r) => pathname.startsWith(r));

  // meindesk.gr or prototype.meindesk.gr => base app
  const isDefaultDomain =
    !subdomain || subdomain === "prototype" || subdomain === "www";

  // If it’s a base route or main domain → prototype tenant
  if (isBaseRoute || isDefaultDomain) {
    req.headers.set("x-tenant", "prototype");
    return NextResponse.next();
  }

  // Otherwise, tenant mode
  try {
    const site = await db.site.findUnique({
      where: { subdomain },
      select: { id: true },
    });

    if (!site) {
      return new NextResponse("Tenant not found", { status: 404 });
    }

    req.headers.set("x-tenant", site.id);
    return NextResponse.next();
  } catch (err) {
    console.error("Tenant resolution failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Avoid running on static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
  runtime: "nodejs"
};
