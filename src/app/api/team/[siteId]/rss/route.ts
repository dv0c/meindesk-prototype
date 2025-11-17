import { NextRequest, NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/rss/url-utils";
import { fetchSiteMetadata } from "@/lib/rss/site-metadata";
import { detectRealFeed } from "@/lib/rss/feed-detection";
import { scrapeVirtualFeed } from "@/lib/rss/scraper";
import { fetchFromFeedSearchAPI } from "@/lib/rss/feed-search-api";

export const runtime = "nodejs";

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const fetchContent = searchParams.get("content") === "true";
  const maxItems = parseInt(searchParams.get("maxItems") || "20", 10); // default 20
  const target = normalizeUrl(rawUrl || "");
  if (!target)
    return NextResponse.json({ error: "Invalid ?url" }, { status: 400 });

  const cacheKey = target + (fetchContent ? "_content" : "_meta") + `_${maxItems}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now())
    return NextResponse.json(cached.data);

  try {
    const siteMeta = await fetchSiteMetadata(target);
    let feedData = null;

    // 1️⃣ FeedSearch.dev API
    const externalFeeds = await fetchFromFeedSearchAPI(target);
    if (externalFeeds && externalFeeds.length > 0) {
      console.error("[RSS Scraper]: Detection=FeedSearchAPI");
      const topFeed = externalFeeds[0];
      feedData = await detectRealFeed(topFeed.url, fetchContent, siteMeta, maxItems);
    }

    // 2️⃣ Local detection
    if (!feedData) {
      console.error("[RSS Scraper]: Detection=Local Detection");
      feedData = await detectRealFeed(target, fetchContent, siteMeta, maxItems);
    }

    // 3️⃣ Fallback: scrape
    if (!feedData) {
      console.error("[RSS Scraper]: Detection=Fallback");
      const items = await scrapeVirtualFeed(target, fetchContent, maxItems); // pass maxItems
      if (!items || items.length === 0)
        return NextResponse.json({
          found: false,
          message: "No feed could be generated",
        });
      feedData = {
        feedUrl: target,
        type: "Generator",
        title: siteMeta.title,
        description: null,
        image: null,
        items,
      };
    }

    const data = {
      found: true,
      feedUrl: feedData.feedUrl,
      type: feedData.type,
      title: feedData.title,
      description: feedData.description,
      image: feedData.image || siteMeta.favicon,
      itemCount: feedData.items.length,
      site: siteMeta,
      items: feedData.items,
    };

    cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Route error:", err.message);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
