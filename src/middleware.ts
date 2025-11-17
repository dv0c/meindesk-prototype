import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostnameRaw = req.headers.get("host") || "";

  // Normalize hostname for localhost and dev
  const hostname = hostnameRaw.replace(
    ".localhost:3000",
    `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  );

  const path = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""}`;

  // ----------------------------
  // 1️⃣ Dashboard auth
  // ----------------------------
  if (hostname.startsWith(`prototype.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) || hostname.startsWith("localhost:3000")) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Rewrite to /app pages
    return NextResponse.rewrite(
      new URL(`/prototype${path === "/" ? "" : path}`, req.url)
    );
  }

  // ----------------------------
  // 2️⃣ Root domain → homepage
  // ----------------------------
  if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === "localhost:3000" || hostname.endsWith("lvh.me")) {
    // rewrite to /home folder
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url)
    );
  }

  // ----------------------------
  // 3️⃣ All other subdomains → tenant
  // ----------------------------
  // example: prototype.meindesk.gr -> rewrites to /[subdomain]/[slug]
  return NextResponse.rewrite(
    new URL(`/${hostname}${path}`, req.url)
  );
}
