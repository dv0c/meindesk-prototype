import * as cheerio from "cheerio";
import * as xml2js from "xml2js";
import pLimit from "p-limit";
import { safeFetch } from "./fetch-utils";
import { fetchMetadataFromPage } from "./page-metadata";
import { parseYouTubeFeed } from "./youtube-parser";

const limit = pLimit(8);

export async function detectRealFeed(
  target: string,
  fetchContent = false,
  siteMeta: any = {},
  maxItems = 20 // <-- limit number of items
) {
  const baseUrl = target.replace(/\/(feed|rss|rss\.xml|atom\.xml)(\/)?$/, "");
  const res = await safeFetch(target);
  if (!res || !res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);

  // --- Collect possible feed URLs ---
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

  // --- Common guesses for feed URLs ---
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

  // --- Try each candidate feed ---
  for (const feedUrl of allCandidates) {
    try {
      const r = await safeFetch(feedUrl);
      if (!r || !r.ok) continue;
      const text = await r.text();
      const contentType = r.headers.get("content-type") || "";

      // --- YouTube feed detection ---
      if (
        target.includes("youtube.com/feeds/videos.xml") ||
        text.includes("yt:videoId") ||
        text.includes("youtube.com")
      ) {
        const ytFeed = await parseYouTubeFeed(text);
        if (ytFeed) {
          if (ytFeed.items.length > maxItems) ytFeed.items = ytFeed.items.slice(0, maxItems);
          return ytFeed;
        }
      }

      // --- JSON Feed ---
      if (contentType.includes("json") || text.trim().startsWith("{")) {
        const json = JSON.parse(text);
        if (json.items || json.feed_url || json.title) {
          const items = await Promise.all(
            (json.items || []).slice(0, maxItems).map((i: any) =>
              limit(async () => {
                const url = i.url || i.link;
                const meta = await fetchMetadataFromPage(url, fetchContent);
                return {
                  title: i.title,
                  link: url,
                  thumbnail: i.image || meta.thumbnail || null,
                  description: i.summary || i.content || meta.description || null,
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

      // --- XML/Atom Feed ---
      if (contentType.includes("xml") || /<rss|<feed/i.test(text)) {
        const parsed = await xml2js.parseStringPromise(text, { explicitArray: false });
        const channel = parsed.rss?.channel || parsed.feed;
        if (!channel) continue;

        const itemsArray =
          (channel?.item && (Array.isArray(channel.item) ? channel.item : [channel.item])) ||
          (parsed.feed?.entry && (Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry])) ||
          [];

        const items = await Promise.all(
          itemsArray.slice(0, maxItems).map((item: any) =>
            limit(async () => {
              let url = item.link;
              if (typeof url === "object" && url?.href) url = url.href;
              const meta = await fetchMetadataFromPage(url, fetchContent);
              const thumb =
                item["media:thumbnail"]?.$.url ||
                item["media:content"]?.$.url ||
                item.enclosure?.$.url ||
                (item.description && item.description.match(/<img[^>]+src="([^"]+)"/)?.[1]) ||
                meta.thumbnail ||
                null;
              const description = item.description || item.summary || meta.description || null;
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
        const feedDescription = channel?.description || parsed.feed?.subtitle?._ || null;

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
