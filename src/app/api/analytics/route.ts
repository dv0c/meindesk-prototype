import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAnalyticsIngestToken } from "@/lib/security/analytics-ingest-token";
import { rateLimit, getClientIdentifier } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

function corsHeaders(origin: string | null): HeadersInit {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Vary"] = "Origin";
  }
  return h;
}

function hostnameFromUrlOrHost(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  try {
    if (v.includes("://")) {
      return new URL(v).hostname.toLowerCase();
    }
    return v.split("/")[0].split(":")[0].toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Allow request Origin if it matches the site's public URL or subdomain pattern.
 */
function isOriginAllowedForSite(
  origin: string | null,
  site: { url: string | null; subdomain: string }
): boolean {
  if (!origin) return true;
  let requestHost: string;
  try {
    requestHost = new URL(origin).hostname.toLowerCase();
  } catch {
    return false;
  }

  const siteHost = hostnameFromUrlOrHost(site.url);
  if (siteHost && (requestHost === siteHost || requestHost.endsWith(`.${siteHost}`))) {
    return true;
  }

  if (site.subdomain) {
    if (requestHost === `${site.subdomain.toLowerCase()}.localhost`) return true;
    if (requestHost.startsWith(`${site.subdomain.toLowerCase()}.`) && requestHost.endsWith(".localhost")) {
      return true;
    }
    if (requestHost === `${site.subdomain.toLowerCase()}.meindesk.gr`) return true;
  }

  if (process.env.NODE_ENV === "development" && (requestHost === "localhost" || requestHost.endsWith(".localhost"))) {
    return true;
  }

  return false;
}

// Region lookup via ipapi.co (not ip-api.com)
async function getRegionFromIP(ip: string): Promise<string | null> {
  if (!ip || ip === "unknown") return null;
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    return `${data.city || ""}${data.city ? ", " : ""}${data.country_name || ""}`.trim() || null;
  } catch {
    return null;
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const { siteId, path, referrer, userAgent, articleSlug, ingestToken } = body;

    if (!siteId || !path) {
      return NextResponse.json(
        { error: "siteId and path required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    if (process.env.ANALYTICS_INGEST_SECRET && !verifyAnalyticsIngestToken(siteId, ingestToken)) {
      return NextResponse.json(
        { error: "Invalid or missing ingest token" },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateKey = `analytics:${siteId}:${getClientIdentifier(req, undefined)}`;
    if (!rateLimit(rateKey, 120, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: corsHeaders(origin) }
      );
    }

    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { id: true, url: true, subdomain: true },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404, headers: corsHeaders(origin) }
      );
    }

    const strictOrigin = process.env.ANALYTICS_STRICT_ORIGIN === "1";
    if (strictOrigin && !isOriginAllowedForSite(origin, site)) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403, headers: corsHeaders(null) }
      );
    }

    const region = await getRegionFromIP(ipAddress);

    let isUniqueArticleView: boolean | undefined;

    if (articleSlug) {
      const existingView = await db.analyticsEvent.findFirst({
        where: {
          siteId: site.id,
          articleSlug,
          ipAddress,
        },
      });

      isUniqueArticleView = !existingView;

      if (isUniqueArticleView) {
        await db.article.updateMany({
          where: { siteId: site.id, slug: articleSlug },
          data: { uniqueViews: { increment: 1 } },
        });
      }

      await db.article.updateMany({
        where: { siteId: site.id, slug: articleSlug },
        data: { views: { increment: 1 } },
      });
    }

    await db.analyticsEvent.create({
      data: {
        siteId: site.id,
        path,
        referrer,
        userAgent,
        region,
        ipAddress,
        articleSlug: articleSlug || undefined,
        isUniqueArticleView,
      },
    });

    await db.site.update({
      where: { id: site.id },
      data: { views: { increment: 1 } },
    });

    const reflectOrigin =
      origin && (!strictOrigin || isOriginAllowedForSite(origin, site)) ? origin : null;
    return NextResponse.json({ success: true }, { headers: corsHeaders(reflectOrigin) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
