import * as cheerio from "cheerio";
import { safeFetch } from "./fetch-utils";

export async function fetchMetadataFromPage(url: string, fetchContent = false) {
  try {
    const res = await safeFetch(url);
    if (!res || !res.ok) return getDefaultMetadata(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[name="headline"]').attr("content") ||
      null;

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[property="article:description"]').attr("content") ||
      $("p").first().text().trim() ||
      null;

    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="apple-touch-icon-precomposed"]').attr("href") ||
      "/favicon.ico";

    const thumbnail =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="image"]').attr("content") ||
      $('meta[name="og:image:url"]').attr("content") ||
      $('link[rel="image_src"]').attr("href") ||
      $("img[alt]").first().attr("src") ||
      $("img").not(".logo, .icon, .avatar, [width='1'], [height='1']").first().attr("src") ||
      null;

    let author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $('meta[property="og:article:author"]').attr("content") ||
      $('span[class*="author" i]').first().text().trim() ||
      $('div[class*="author" i]').first().text().trim() ||
      $(".author, [rel=author], .byline, .posted-by").first().text().trim() ||
      $('a[rel="author"]').first().text().trim() ||
      null;

    let categories: string[] = [];

    const selectors = [
      ".tags a",
      ".tag a",
      ".tags",
      ".categories a",
      ".category a",
      ".post-tag",
      ".post-category",
      ".label",
      ".topic",
      "[rel='tag']",
      "[data-category]",
    ];
    selectors.forEach((sel) =>
      $(sel).each((_, el) => {
        const txt = $(el).text().trim();
        if (txt && txt.length > 1 && txt.length < 50 && !categories.includes(txt)) {
          categories.push(txt);
        }
      })
    );

    // Extract from meta tags
    const metaKeys = [
      "keywords",
      "news_keywords",
      "article:section",
      "article:tag",
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
          .split(/[,|;]/)
          .map((x) => x.trim())
          .filter((x) => x && x.length > 1 && x.length < 50)
          .forEach((x) => {
            if (!categories.includes(x)) categories.push(x);
          });
      }
    });

    // Extract from JSON-LD
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
                .split(/[,|;]/)
                .map((x) => x.trim())
                .filter((x) => x && x.length > 1 && x.length < 50)
                .forEach((x) => {
                  if (!categories.includes(x)) categories.push(x);
                });
            }
          });
        }
      } catch { }
    });

    let pubDate: string | null = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).contents().text());
        if (json.datePublished) {
          pubDate = json.datePublished;
          return false; // break
        }
      } catch { }
    });

    if (!pubDate) {
      pubDate =
        $('meta[property="article:published_time"]').attr("content") ||
        $('meta[name="publish_date"]').attr("content") ||
        null;
    }

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
      title: title || getDefaultTitle(url),
      description: description || null,
      favicon: absolute(favicon) || getDefaultFavicon(url),
      thumbnail: absolute(thumbnail),
      author: author || getDefaultAuthor(url),
      categories: categories.length > 0 ? categories : getDefaultCategories(url),
      content,
      pubDate,
    };
  } catch (err: any) {
    console.error("fetchMetadataFromPage error:", err.message);
    return getDefaultMetadata(url);
  }
}

function getDefaultTitle(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1]
        .replace(/[-_]/g, " ")
        .replace(/\.(html|php|aspx)$/i, "")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Article";
  }
}

function getDefaultAuthor(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Unknown Author";
  }
}

function getDefaultCategories(url: string): string[] {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length > 1) {
      return [parts[0].replace(/[-_]/g, " ")];
    }
    return [u.hostname.replace(/^www\./, "")];
  } catch {
    return ["General"];
  }
}

function getDefaultFavicon(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/favicon.ico`;
  } catch {
    return "/favicon.ico";
  }
}

function getDefaultMetadata(url: string) {
  return {
    title: getDefaultTitle(url),
    description: null,
    favicon: getDefaultFavicon(url),
    thumbnail: null,
    author: getDefaultAuthor(url),
    categories: getDefaultCategories(url),
    content: null,
    pubDate: null,
  };
}
