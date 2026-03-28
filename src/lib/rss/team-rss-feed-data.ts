import { normalizeUrl } from "@/lib/rss/url-utils";
import { fetchSiteMetadata } from "@/lib/rss/site-metadata";
import { detectRealFeed } from "@/lib/rss/feed-detection";
import { scrapeVirtualFeed } from "@/lib/rss/scraper";
import { fetchFromFeedSearchAPI } from "@/lib/rss/feed-search-api";

const memoryCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 hours

export type TeamRssFetchParams = {
  rawUrl: string;
  fetchContent: boolean;
  maxItems: number;
};

/**
 * Shared RSS discovery + fetch logic for the team API and cron jobs.
 * Uses an in-memory cache keyed by URL options (per server instance).
 */
export async function fetchTeamRssFeedData({
  rawUrl,
  fetchContent,
  maxItems,
}: TeamRssFetchParams): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  const target = normalizeUrl(rawUrl || "");
  if (!target) {
    return { ok: false, status: 400, body: { error: "Invalid ?url" } };
  }

  const cacheKey = target + (fetchContent ? "_content" : "_meta") + `_${maxItems}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return { ok: true, data: cached.data as Record<string, unknown> };
  }

  try {
    const siteMeta = await fetchSiteMetadata(target);
    let feedData = null;

    const externalFeeds = await fetchFromFeedSearchAPI(target);
    if (externalFeeds && externalFeeds.length > 0) {
      console.error("[RSS Scraper]: Detection=FeedSearchAPI");
      const topFeed = externalFeeds[0];
      feedData = await detectRealFeed(topFeed.url, fetchContent, siteMeta, maxItems);
    }

    if (!feedData) {
      console.error("[RSS Scraper]: Detection=Local Detection");
      feedData = await detectRealFeed(target, fetchContent, siteMeta, maxItems);
    }

    if (!feedData) {
      console.error("[RSS Scraper]: Detection=Fallback");
      const items = await scrapeVirtualFeed(target, fetchContent, maxItems);
      if (!items || items.length === 0) {
        return {
          ok: true,
          data: {
            found: false,
            message: "No feed could be generated",
          },
        };
      }
      feedData = {
        feedUrl: target,
        baseUrl: target,
        type: "Generator",
        title: siteMeta.title,
        description: null,
        image: null,
        items,
      };
    }

    let finalSiteMeta = siteMeta;
    if (feedData.baseUrl && feedData.baseUrl !== target) {
      console.log(`[RSS Scraper]: Fetching metadata from baseUrl: ${feedData.baseUrl}`);
      finalSiteMeta = await fetchSiteMetadata(feedData.baseUrl);
    }

    const data = {
      found: true,
      feedUrl: feedData.feedUrl,
      type: feedData.type,
      title: feedData.title || finalSiteMeta.title,
      description: feedData.description || finalSiteMeta.description,
      image: feedData.image || finalSiteMeta.logo || finalSiteMeta.favicon,
      itemCount: feedData.items.length,
      site: finalSiteMeta,
      items: feedData.items,
    };

    memoryCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
    return { ok: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("RSS fetch error:", message);
    return {
      ok: false,
      status: 500,
      body: { error: message || "Unknown error" },
    };
  }
}
