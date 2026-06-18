import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { verifyAnalyticsIngestToken } from "@/lib/security/analytics-ingest-token";
import { rateLimit, getClientIdentifier } from "@/lib/security/rate-limit";
import {
  validateIngestPayload,
  parseUserAgent,
  classifyTrafficSource,
  isBotUserAgent,
  hashIp,
  shouldAnonymizeIp,
  buildDedupeKey,
} from "@/lib/analytics";

export const runtime = "nodejs";

const SESSION_GAP_MS = 30 * 60 * 1000;
const recentDedupe = new Map<string, number>();
const DEDUPE_TTL_MS = 60_000;

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

async function getGeoFromIP(ip: string): Promise<{ region: string | null; country: string | null; city: string | null }> {
  if (!ip || ip === "unknown") return { region: null, country: null, city: null };
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { next: { revalidate: 86400 } });
    if (!res.ok) return { region: null, country: null, city: null };
    const data = await res.json();
    const city = data.city || null;
    const country = data.country_name || null;
    const region = city && country ? `${city}, ${country}` : country;
    return { region, country, city };
  } catch {
    return { region: null, country: null, city: null };
  }
}

function isDuplicate(dedupeKey: string): boolean {
  const now = Date.now();
  const last = recentDedupe.get(dedupeKey);
  if (last && now - last < DEDUPE_TTL_MS) return true;
  recentDedupe.set(dedupeKey, now);
  if (recentDedupe.size > 10_000) {
    for (const [k, t] of recentDedupe) {
      if (now - t > DEDUPE_TTL_MS) recentDedupe.delete(k);
    }
  }
  return false;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const validated = validateIngestPayload(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const payload = validated.data;
    const { siteId, path, referrer, userAgent, articleSlug, ingestToken, eventType, visitorId, sessionId, contentType, contentId, metadata } = payload;

    if (process.env.ANALYTICS_INGEST_SECRET && !verifyAnalyticsIngestToken(siteId, ingestToken)) {
      return NextResponse.json(
        { error: "Invalid or missing ingest token" },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateKey = `analytics:${siteId}:${getClientIdentifier(req, undefined)}`;
    if (!rateLimit(rateKey, 120, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: corsHeaders(origin) }
      );
    }

    const site = await db.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        url: true,
        subdomain: true,
        views: true,
        limitViews: true,
        settings: true,
        features: { select: { viewslimit: true } },
      },
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

    const viewLimit = site.features?.viewslimit ?? site.limitViews;
    if (viewLimit > 0 && site.views >= viewLimit) {
      return NextResponse.json(
        { error: "View limit reached" },
        { status: 429, headers: corsHeaders(origin) }
      );
    }

    const isBot = isBotUserAgent(userAgent);
    const parsed = parseUserAgent(userAgent);
    const source = classifyTrafficSource(referrer, path, metadata);
    const settings = (site.settings as Record<string, unknown>) ?? {};
    const ipAddress = shouldAnonymizeIp(settings)
      ? hashIp(rawIp)
      : rawIp;

    const dedupeKey = buildDedupeKey(visitorId, ipAddress, path, eventType ?? "page_view");
    if (eventType === "page_view" && isDuplicate(dedupeKey)) {
      return NextResponse.json({ success: true, deduplicated: true }, { headers: corsHeaders(origin) });
    }

    const geo = isBot ? { region: null, country: null, city: null } : await getGeoFromIP(rawIp);

    let isUniqueArticleView: boolean | undefined;
    if (articleSlug && eventType === "page_view" && !isBot) {
      const existingView = await db.analyticsEvent.findFirst({
        where: { siteId: site.id, articleSlug, ipAddress },
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

    const now = new Date();
    let activeSessionId = sessionId;

    if (visitorId && eventType === "page_view" && !isBot) {
      const recentSession = await db.analyticsSession.findFirst({
        where: {
          siteId: site.id,
          visitorId,
          startedAt: { gte: new Date(now.getTime() - SESSION_GAP_MS) },
        },
        orderBy: { startedAt: "desc" },
      });

      if (recentSession) {
        activeSessionId = recentSession.id;
        await db.analyticsSession.update({
          where: { id: recentSession.id },
          data: {
            pageViews: { increment: 1 },
            endedAt: now,
            exitPath: path,
          },
        });
      } else {
        const session = await db.analyticsSession.create({
          data: {
            siteId: site.id,
            visitorId,
            startedAt: now,
            pageViews: 1,
            entryPath: path,
            exitPath: path,
            referrer: referrer ?? null,
            source,
            device: parsed.device,
            browser: parsed.browser,
            os: parsed.os,
            country: geo.country,
            city: geo.city,
            isBot,
          },
        });
        activeSessionId = session.id;
      }
    }

    await db.analyticsEvent.create({
      data: {
        siteId: site.id,
        path,
        referrer,
        userAgent,
        region: geo.region,
        country: geo.country,
        city: geo.city,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        ipAddress,
        articleSlug: articleSlug || undefined,
        isUniqueArticleView,
        eventType: eventType ?? "page_view",
        visitorId,
        sessionId: activeSessionId,
        source,
        contentType,
        contentId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        isBot,
      },
    });

    if (!isBot && eventType === "page_view") {
      await db.site.update({
        where: { id: site.id },
        data: { views: { increment: 1 } },
      });
    }

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
