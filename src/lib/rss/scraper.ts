import * as cheerio from "cheerio";
import { safeFetch } from "./fetch-utils";
import { fetchMetadataFromPage } from "./page-metadata";

export async function scrapeVirtualFeed(
  target: string,
  fetchContent = false,
  maxItems = 20 // <-- add maxItems param
) {
  const res = await safeFetch(target);
  if (!res || !res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);

  console.error("[RSS Scraper]: Method used VirtualFeed");

  const articleEls = $("article");
  const candidateEls = articleEls.length ? articleEls : $("div:has(a)");
  const items: any[] = [];

  for (let i = 0; i < candidateEls.length && items.length < maxItems; i++) {
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

/**
 * Scrape a website using a user-defined CustomFeedTemplate
 * Uses CSS selectors to extract feed items
 */
export interface TemplateConfig {
  targetUrl: string;
  containerSelector: string;
  titleSelector?: string | null;
  linkSelector?: string | null;
  thumbnailSelector?: string | null;
  descriptionSelector?: string | null;
  dateSelector?: string | null;
  authorSelector?: string | null;
  linkAttribute?: string;
  thumbnailAttribute?: string;
  maxItems?: number;
}

export async function scrapeWithTemplate(
  template: TemplateConfig,
  fetchContent = false
) {
  const res = await safeFetch(template.targetUrl);
  if (!res || !res.ok) {
    console.error(`[RSS Scraper]: Failed to fetch template target: ${template.targetUrl}`);
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const baseUrl = new URL(template.targetUrl).origin;

  console.error(`[RSS Scraper]: Scraping with custom template`);
  console.error(`[RSS Scraper]: HTML length: ${html.length}`);
  console.error(`[RSS Scraper]: Container selector: "${template.containerSelector}"`);

  // Debug: Show what's in the page
  const bodyChildren = $('body').children().toArray().map(el => el.tagName?.toLowerCase()).slice(0, 10);
  console.error(`[RSS Scraper]: Body children tags: ${bodyChildren.join(', ')}`);

  // Helper: Get the last part of a CSS selector path for relative matching
  // e.g., "main > div > article > h1.title" -> "h1.title"
  function getRelativeSelector(fullSelector: string | null | undefined): string | null {
    if (!fullSelector) return null;
    const parts = fullSelector.split(' > ');
    return parts[parts.length - 1]?.trim() || null;
  }

  // Helper: Convert strict child combinator selectors to descendant selectors
  // e.g., "main > div > article" -> "main div article"
  function toDescendantSelector(selector: string): string {
    return selector.replace(/\s*>\s*/g, ' ');
  }

  // Try the original selector first
  let containers = $(template.containerSelector);
  console.error(`[RSS Scraper]: Found ${containers.length} containers with full selector`);

  // If no matches, try converting > to space (descendant instead of direct child)
  if (containers.length === 0) {
    const descendantSelector = toDescendantSelector(template.containerSelector);
    if (descendantSelector !== template.containerSelector) {
      containers = $(descendantSelector);
      console.error(`[RSS Scraper]: Trying descendant selector "${descendantSelector}", found ${containers.length}`);
    }
  }

  // If still no matches, try just the last part of the selector (tag.class)
  if (containers.length === 0) {
    const lastPart = getRelativeSelector(template.containerSelector);
    if (lastPart) {
      containers = $(lastPart);
      console.error(`[RSS Scraper]: Trying fallback selector "${lastPart}", found ${containers.length}`);
    }
  }

  // If still no matches, try common article containers
  if (containers.length === 0) {
    const commonSelectors = ['article', '.post', '.article', '.entry', '[class*="post"]', '[class*="article"]'];
    for (const sel of commonSelectors) {
      containers = $(sel);
      if (containers.length > 0) {
        console.error(`[RSS Scraper]: Using common fallback "${sel}", found ${containers.length}`);
        break;
      }
    }
  }

  const items: any[] = [];
  const maxItems = template.maxItems || 20;

  // Get relative selectors (last part of path)
  const relativeTitle = getRelativeSelector(template.titleSelector);
  const relativeLink = getRelativeSelector(template.linkSelector);
  const relativeThumbnail = getRelativeSelector(template.thumbnailSelector);
  const relativeDescription = getRelativeSelector(template.descriptionSelector);
  const relativeDate = getRelativeSelector(template.dateSelector);
  const relativeAuthor = getRelativeSelector(template.authorSelector);

  for (let i = 0; i < containers.length && items.length < maxItems; i++) {
    const container = $(containers[i]);

    // Extract title - use relative selector
    let title = "";
    if (relativeTitle) {
      title = container.find(relativeTitle).first().text().trim();
    }
    if (!title) {
      title = container.find("h1, h2, h3, h4, a").first().text().trim();
    }
    if (!title) continue;

    // Extract link - use relative selector
    let link = "";
    if (relativeLink) {
      const linkEl = container.find(relativeLink).first();
      link = linkEl.attr(template.linkAttribute || "href") || "";
    }
    if (!link) {
      link = container.find("a").first().attr("href") || "";
    }
    if (!link) continue;

    // Make link absolute
    try {
      link = new URL(link, baseUrl).href;
    } catch {
      continue;
    }

    // Extract thumbnail - use relative selector
    let thumbnail = "";
    if (relativeThumbnail) {
      const thumbEl = container.find(relativeThumbnail).first();
      thumbnail = thumbEl.attr(template.thumbnailAttribute || "src") || "";

      // Also check for background-image style
      if (!thumbnail) {
        const style = thumbEl.attr("style") || "";
        const bgMatch = style.match(/url\(['"]?([^'")\\s]+)['"]?\)/);
        if (bgMatch) thumbnail = bgMatch[1];
      }
    }
    if (!thumbnail) {
      thumbnail = container.find("img").first().attr("src") || "";
    }
    if (thumbnail && !thumbnail.startsWith("http")) {
      try {
        thumbnail = new URL(thumbnail, baseUrl).href;
      } catch { }
    }

    // Extract description - use relative selector
    let description = "";
    if (relativeDescription) {
      description = container.find(relativeDescription).first().text().trim();
    }
    if (!description) {
      description = container.find("p").first().text().trim();
    }

    // Extract date - use relative selector
    let pubDate = null;
    if (relativeDate) {
      const dateText = container.find(relativeDate).first().text().trim();
      if (dateText) {
        try {
          pubDate = new Date(dateText).toISOString();
        } catch { }
      }
    }

    // Extract author - use relative selector
    let author = "";
    if (relativeAuthor) {
      author = container.find(relativeAuthor).first().text().trim();
    }

    // Optionally fetch full content from the article page
    let content = null;
    if (fetchContent && link) {
      const meta = await fetchMetadataFromPage(link, true);
      content = meta.content;
      if (!thumbnail) thumbnail = meta.thumbnail || null;
      if (!description) description = meta.description || "";
      if (!author) author = meta.author || "";
    }

    items.push({
      title,
      link,
      thumbnail: thumbnail || null,
      description: description || null,
      content,
      pubDate,
      author: author || null,
      categories: [],
    });
  }

  console.error(`[RSS Scraper]: Scraped ${items.length} items with custom template`);
  return items;
}
