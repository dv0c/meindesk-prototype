import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function middleware(req: NextRequest) {

  // 1️⃣ Get JWT token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect("/login");
  }

  // 2️⃣ Extract siteId from URL: /dashboard/:siteId/projects/...
  const pathSegments = req.nextUrl.pathname.split("/");
  const siteId = pathSegments[2]; // '/dashboard/:siteId/...'
  if (!siteId) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL + "/dashboard/" + siteId);
  }

  // 3️⃣ Fetch site + features from DB
  const site = await db.site.findFirst({
    where: { id: siteId, userId: token.sub },
    include: { features: true },
  });

  if (!site || !site.features) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL + "/dashboard/" + siteId);
  }

  const features = site.features;

  // 4️⃣ Define feature rules
  const featureRules: Record<string, boolean> = {
    "/projects/website/articles": !!features.articles,
    "/projects/website/pages": !!features.pages,
    "/projects/website/categories": !!features.cateories, // note typo in your DB?
    "/projects/website/media-gallery": !!features.media,
    "/projects/website/analytics": !!features.analytics,
  };

  // 5️⃣ Check access
  for (const route in featureRules) {
    if (req.nextUrl.pathname.includes(route) && !featureRules[route]) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL + "/dashboard/" + siteId);
    }
  }

  // 6️⃣ All good
  return NextResponse.next();
}

// ⚡ Node runtime required for Prisma
export const config = {
  matcher: ["/dashboard/:siteId/projects/:path*"],
  runtime: "nodejs",
};
