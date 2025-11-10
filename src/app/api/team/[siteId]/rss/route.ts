import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as xml2js from "xml2js";
import pLimit from "p-limit";

export const runtime = "nodejs";

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 hours
const FETCH_TIMEOUT = 10000; // 10s timeout
const limit = pLimit(8);

// --------------------------------------------------
// Utilities
// --------------------------------------------------
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

// --------------------------------------------------
// Site Metadata
// --------------------------------------------------
async function fetchSiteMetadata(url: string) {
  try {
    const res = await safeFetch(url);
    if (!res || !res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);

    let title = $('meta[property="og:site_name"]').attr("content")?.trim();
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

// --------------------------------------------------
// Page Metadata (for articles)
// --------------------------------------------------
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

    let author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $('meta[property="og:article:author"]').attr("content") ||
      $(".author, [rel=author], .byline, .posted-by").first().text().trim() ||
      null;

    // --- Smart Category Extraction ---
    let categories: string[] = [];

    // From visible elements
    const selectors = [
      ".tags a",
      ".tag a",
      ".categories a",
      ".category a",
      ".post-tag",
      ".post-category",
      ".label",
      ".topic",
    ];
    selectors.forEach((sel) =>
      $(sel).each((_, el) => {
        const txt = $(el).text().trim();
        if (txt && !categories.includes(txt)) categories.push(txt);
      })
    );

    // From meta tags
    const metaKeys = [
      "keywords",
      "news_keywords",
      "article:section",
      "section",
      "category",
      "topic",
    ];
    metaKeys.forEach((name) => {
      const content =
        $(`meta[name="${name}"]`).attr("content") ||
        $(`meta[property="${name}"]`).attr("content");
      if (content) {
        content
          .split(/[,|]/)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((x) => {
            if (!categories.includes(x)) categories.push(x);
          });
      }
    });

    // From JSON-LD (schema.org data)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).contents().text());
        const data = Array.isArray(json) ? json : [json];
        for (const item of data) {
          const keys = ["keywords", "articleSection", "genre", "about"];
          keys.forEach((key) => {
            const val = item[key];
            if (Array.isArray(val)) {
              val.forEach((v) => {
                const name = typeof v === "string" ? v : v?.name;
                if (name && !categories.includes(name)) categories.push(name);
              });
            } else if (typeof val === "string") {
              val
                .split(/[,|]/)
                .map((x) => x.trim())
                .filter(Boolean)
                .forEach((x) => {
                  if (!categories.includes(x)) categories.push(x);
                });
            }
          });
        }
      } catch {}
    });

    // --- Content extraction (unchanged) ---
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

    // --- Normalize URLs ---
    const absolute = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      try {
        return new URL(path, url).href;
      } catch {
        return null;
      }
    };

    // --- Fallback author ---
    if (!author) {
      try {
        const u = new URL(url);
        author = u.hostname.replace(/^www\./, "");
      } catch {
        author = "Unknown Author";
      }
    }

    // --- Fallback categories ---
    if (!categories.length) {
      try {
        const u = new URL(url);
        categories = [u.hostname.replace(/^www\./, "")];
      } catch {
        categories = ["General"];
      }
    }

    return {
      title,
      description,
      favicon: absolute(favicon),
      thumbnail: absolute(thumbnail),
      author,
      categories,
      content,
    };
  } catch (err: any) {
    console.error("fetchMetadataFromPage error:", err.message);
    return {};
  }
}

// --------------------------------------------------
// YouTube Feed Parser
// --------------------------------------------------
async function parseYouTubeFeed(xmlText: string) {
  const parsed = await xml2js.parseStringPromise(xmlText, {
    explicitArray: false,
  });
  const feed = parsed.feed;
  if (!feed || !feed.entry) return null;

  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  const channelTitle = feed.title;
  // I don't really know why should i do this but it is working.
  const channelId = "UC" + feed["yt:channelId"] || null;

  const site = {
    title: `Youtube ${feed.author?.name ? `| ${feed.author.name}` : ""}`,
    favicon: "https://www.youtube.com/s/desktop/ce69dda5/img/favicon_32x32.png",
    logo: `https://yt3.googleusercontent.com/ytc/${channelId}`,
    url: feed.author?.uri || "https://www.youtube.com",
  };

  const items = entries.map((entry: any) => {
    const videoId = entry["yt:videoId"];
    const link = `https://www.youtube.com/watch?v=${videoId}`;

    const title = entry.title;
    const published = entry.published;
    const updated = entry.updated;
    const author = entry.author?.name || null;
    const thumbnail =
      entry["media:group"]?.["media:thumbnail"]?.url ||
      entry["media:thumbnail"]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const description =
      entry["media:group"]?.["media:description"] ||
      entry.summary?._ ||
      entry.summary ||
      null;

    return {
      title,
      link,
      thumbnail,
      description,
      pubDate: published || updated,
      author,
      categories: ["YouTube"],
      content: `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
      site,
    };
  });

  return {
    feedUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    type: "YouTube",
    title: `Youtube ${feed.author?.name ? `| ${feed.author.name}` : ""}`,
    description: `YouTube feed for ${channelTitle}`,
    image: site.logo,
    items,
  };
}

// --------------------------------------------------
// Feed Detection
// --------------------------------------------------
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

      // --- YouTube Detection ---
      if (
        target.includes("youtube.com/feeds/videos.xml") ||
        text.includes("yt:videoId") ||
        text.includes("youtube.com")
      ) {
        const ytFeed = await parseYouTubeFeed(text);
        if (ytFeed) return ytFeed;
      }

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
                  site: siteMeta,
                };
              })
            )
          );
          return {
            feedUrl,
            type: "json",
            title: siteMeta.title || json.title,
            description: json.description || null,
            image: json.icon || null,
            items,
          };
        }
      }

      // --- XML Feed ---
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
                site: siteMeta,
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
          title: siteMeta.title || channel?.title,
          description: feedDescription,
          image: feedImage,
          items,
        };
      }
    } catch (err: any) {
      console.error(`Feed check failed for ${feedUrl}:`, err.message);
    }
  }

  return null;
}

// --------------------------------------------------
// Fallback Scraper
// --------------------------------------------------
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

// --------------------------------------------------
// FeedSearch.dev API
// --------------------------------------------------
async function fetchFromFeedSearchAPI(target: string) {
  try {
    const apiUrl = `https://feedsearch.dev/api/v1/search?url=${encodeURIComponent(
      target
    )}`;
    const res = await safeFetch(apiUrl);
    if (!res || !res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    json.sort((a, b) => b.score - a.score);
    return json;
  } catch (err: any) {
    console.error("FeedSearch API error:", err.message);
    return null;
  }
}

// --------------------------------------------------
// Main API Route
// --------------------------------------------------
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
    let feedData = null;

    // 1️⃣ FeedSearch.dev API
    const externalFeeds = await fetchFromFeedSearchAPI(target);
    if (externalFeeds && externalFeeds.length > 0) {
      const topFeed = externalFeeds[0];
      feedData = await detectRealFeed(topFeed.url, fetchContent, siteMeta);
    }

    // 2️⃣ Local detection
    if (!feedData) {
      feedData = await detectRealFeed(target, fetchContent, siteMeta);
    }

    // 3️⃣ Fallback: scrape
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
  