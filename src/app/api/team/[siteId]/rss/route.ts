// app/api/find-or-generate-rss/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as xml2js from "xml2js";
import pLimit from "p-limit";

export const runtime = "nodejs";

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 hours
const FETCH_TIMEOUT = 10000; // 10s timeout
const limit = pLimit(8);

function normalizeUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

async function safeFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0", ...(options.headers || {}) },
    });
  } catch (err: any) {
    console.error(`Fetch failed for ${url}:`, err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Fetch site metadata (title, favicon, logo)
async function fetchSiteMetadata(url: string) {
  try {
    const res = await safeFetch(url);
    if (!res || !res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);

    // Use og:site_name first
    let title = $('meta[property="og:site_name"]').attr("content")?.trim();

    // Fallback: domain-based site name
    if (!title) {
      try {
        const u = new URL(url);
        title = u.hostname.replace(/^www\./, "").split(".")[0];
        title = title.charAt(0).toUpperCase() + title.slice(1);
      } catch {
        title = "Unknown Site";
      }
    }

    const faviconRel =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico";

    const logo =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    const favicon = new URL(faviconRel, url).href;

    return { title, favicon, logo: logo ? new URL(logo, url).href : null, url };
  } catch (err: any) {
    console.error("fetchSiteMetadata error:", err.message);
    return {};
  }
}

// Fetch metadata from article page
async function fetchMetadataFromPage(url: string, fetchContent = false) {
  try {
    const res = await safeFetch(url);
    if (!res || !res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      null;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $("p").first().text().trim() ||
      null;

    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico";

    const thumbnail =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $("img").first().attr("src") ||
      null;

    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $(".author, [rel=author]").first().text().trim() ||
      null;

    const categories = $(".tags a, .categories a")
      .map((_, el) => $(el).text().trim())
      .get();

    let content: string | null = null;
    if (fetchContent) {
      const articleTag = $("article");
      if (articleTag.length) content = articleTag.html() || "";
      else {
        let maxLength = 0;
        $("div, section").each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > maxLength) {
            maxLength = text.length;
            content = $(el).html() || "";
          }
        });
      }
      const clean = cheerio.load(content || "");
      clean("script, style, noscript").remove();
      content = clean.html() || null;
    }

    const absolute = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      try {
        return new URL(path, url).href;
      } catch {
        return null;
      }
    };

    return {
      title,
      description,
      favicon: absolute(favicon),
      thumbnail: absolute(thumbnail),
      author,
      categories,
      content,
    };
  } catch (err) {
    console.error("fetchMetadataFromPage error:", err.message);
    return {};
  }
}

// Detect RSS / Atom / JSON feeds
async function detectRealFeed(
  target: string,
  fetchContent = false,
  siteMeta: any = {}
) {
  const baseUrl = target.replace(/\/(feed|rss|rss\.xml|atom\.xml)(\/)?$/, "");
  const res = await safeFetch(target);
  if (!res || !res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);

  const candidates = new Set<string>();
  $("link, a").each((_, el) => {
    const href = $(el).attr("href");
    const type = $(el).attr("type") || "";
    const text = ($(el).text() || "").toLowerCase();
    if (!href) return;
    if (
      href.toLowerCase().includes("rss") ||
      href.toLowerCase().includes("feed") ||
      text.includes("rss feed") ||
      type.includes("rss") ||
      type.includes("atom")
    ) {
      try {
        candidates.add(new URL(href, baseUrl).href);
      } catch {}
    }
  });

  const path = new URL(target).pathname;
  const guesses = [
    "feed",
    "rss",
    "rss.xml",
    "atom.xml",
    "feeds/posts/default",
    `${path}?format=rss`,
    "?format=rss",
  ].map((p) => new URL(p, baseUrl).href);

  const allCandidates = [...candidates, ...guesses];

  for (const feedUrl of allCandidates) {
    try {
      const r = await safeFetch(feedUrl);
      if (!r || !r.ok) continue;
      const text = await r.text();
      const contentType = r.headers.get("content-type") || "";

      // --- JSON Feed ---
      if (contentType.includes("json") || text.trim().startsWith("{")) {
        const json = JSON.parse(text);
        if (json.items || json.feed_url || json.title) {
          const items = await Promise.all(
            (json.items || []).map((i: any) =>
              limit(async () => {
                const url = i.url || i.link;
                const meta = await fetchMetadataFromPage(url, fetchContent);
                return {
                  title: i.title,
                  link: url,
                  thumbnail: i.image || meta.thumbnail || null,
                  description:
                    i.summary || i.content || meta.description || null,
                  content: meta.content || null,
                  pubDate: i.date_published || i.pubDate || null,
                  author: i.author?.name || meta.author || null,
                  categories: i.tags || meta.categories || [],
                };
              })
            )
          );
          return {
            feedUrl,
            type: "json",
            title: siteMeta.title || null,
            description: json.description || null,
            image: json.icon || null,
            items,
          };
        }
      }

      // --- XML Feed (RSS / Atom) ---
      if (contentType.includes("xml") || /<rss|<feed/i.test(text)) {
        const parsed = await xml2js.parseStringPromise(text, {
          explicitArray: false,
        });
        const channel = parsed.rss?.channel || parsed.feed;
        if (!channel) continue;

        const itemsArray =
          (channel?.item &&
            (Array.isArray(channel.item) ? channel.item : [channel.item])) ||
          (parsed.feed?.entry &&
            (Array.isArray(parsed.feed.entry)
              ? parsed.feed.entry
              : [parsed.feed.entry])) ||
          [];

        const items = await Promise.all(
          itemsArray.map((item: any) =>
            limit(async () => {
              let url = item.link;
              if (typeof url === "object" && url?.href) url = url.href;
              const meta = await fetchMetadataFromPage(url, fetchContent);

              let thumb =
                item["media:thumbnail"]?.$.url ||
                item["media:content"]?.$.url ||
                item.enclosure?.$.url ||
                (item.description &&
                  item.description.match(/<img[^>]+src="([^"]+)"/)?.[1]) ||
                meta.thumbnail ||
                null;
              const description =
                item.description || item.summary || meta.description || null;
              const pubDate = item.pubDate || item.updated || null;
              const author = item.author?.name || meta.author || null;
              const categories = Array.isArray(item.category)
                ? item.category
                : item.category
                ? [item.category]
                : meta.categories || [];

              return {
                title: item.title,
                link: url,
                thumbnail: thumb,
                description,
                content: meta.content,
                pubDate,
                author,
                categories,
              };
            })
          )
        );

        const feedImage = channel?.image?.url || parsed.feed?.logo?._ || null;
        const feedDescription =
          channel?.description || parsed.feed?.subtitle?._ || null;

        return {
          feedUrl,
          type: parsed.feed ? "atom" : "Native RSS",
          title: siteMeta.title || null,
          description: feedDescription,
          image: feedImage,
          items,
        };
      }
    } catch (err) {
      console.error(`Feed check failed for ${feedUrl}:`, err.message);
    }
  }

  return null;
}

// Virtual feed fallback
async function scrapeVirtualFeed(target: string, fetchContent = false) {
  const res = await safeFetch(target);
  if (!res || !res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);

  const articleEls = $("article");
  const candidateEls = articleEls.length ? articleEls : $("div:has(a)");
  const items: any[] = [];

  for (let i = 0; i < candidateEls.length && items.length < 20; i++) {
    const el = candidateEls[i];
    const a = $(el).find("a").first();
    const href = a.attr("href");
    if (!href) continue;
    const title =
      a.text().trim() || $(el).find("h1,h2,h3,h4").first().text().trim();
    if (!title) continue;

    const meta = await fetchMetadataFromPage(
      new URL(href, target).href,
      fetchContent
    );
    items.push({
      title,
      link: new URL(href, target).href,
      thumbnail: meta.thumbnail,
      description: meta.description,
      content: meta.content,
      pubDate: meta.pubDate,
      author: meta.author,
      categories: meta.categories,
    });
  }

  return items;
}

// --- Main API Route ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const fetchContent = searchParams.get("content") === "true";
  const target = normalizeUrl(rawUrl || "");
  if (!target)
    return NextResponse.json({ error: "Invalid ?url" }, { status: 400 });

  const cacheKey = target + (fetchContent ? "_content" : "_meta");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now())
    return NextResponse.json(cached.data);

  try {
    const siteMeta = await fetchSiteMetadata(target);

    let feedData = await detectRealFeed(target, fetchContent, siteMeta);

    if (!feedData) {
      const items = await scrapeVirtualFeed(target, fetchContent);
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

    feedData.items = feedData.items.map((item: any) => ({
      ...item,
      site: siteMeta,
    }));

    const data = {
      found: true,
      feedUrl: feedData.feedUrl,
      type: feedData.type,
      title: siteMeta.title, // always match site title
      description: feedData.description,
      image: feedData.image,
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
