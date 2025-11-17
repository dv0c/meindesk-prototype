import { NextRequest, NextResponse } from "next/server";
import { db } from "./lib/db";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const domainParts = host.split(".");
  const subdomain = domainParts.length > 1 ? domainParts[0].toLowerCase() : null;
  // Default tenant logic
  const isDefault = !subdomain || ["prototype", "www"].includes(subdomain);
  if (isDefault) {
    const res = NextResponse.next();
    res.headers.set("x-tenant", "prototype");
    return res;
  }

  try {
    const site = await db.site.findUnique({
      where: { subdomain },
      select: { id: true },
    });

    if (!site) {
      return new NextResponse("Tenant not found", { status: 404 });
    }

    // ✅ Correct way: set the header on the response
    const res = NextResponse.next();
    res.headers.set("x-tenant", site.id);
    return res;
  } catch (err) {
    console.error("Tenant resolution failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
  runtime: "nodejs"
};
