import * as cheerio from "cheerio";
import { safeFetch } from "./fetch-utils";

export async function fetchSiteMetadata(url: string) {
  try {
    const res = await safeFetch(url);
    if (!res || !res.ok) return getDefaultSiteMetadata(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    let title = 
      $('meta[property="og:site_name"]').attr("content")?.trim() ||
      $('meta[name="application-name"]').attr("content")?.trim() ||
      $("head > title").text().trim() ||
      null;

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
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    const logo =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="image"]').attr("content") ||
      $('img[class*="logo"]').attr("src") ||
      $('img[alt*="logo"]').first().attr("src") ||
      null;

    let favicon: string;
    try {
      favicon = new URL(faviconRel, url).href;
    } catch {
      favicon = getDefaultFavicon(url);
    }

    const logoUrl = logo ? resolveUrl(logo, url) : null;

    return {
      title: title || "Unknown Site",
      favicon,
      logo: logoUrl,
      url,
    };
  } catch (err: any) {
    console.error("fetchSiteMetadata error:", err.message);
    return getDefaultSiteMetadata(url);
  }
}

function resolveUrl(path: string | null, baseUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  try {
    return new URL(path, baseUrl).href;
  } catch {
    return null;
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

function getDefaultSiteMetadata(url: string) {
  try {
    const u = new URL(url);
    const title = u.hostname.replace(/^www\./, "").split(".")[0];
    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      favicon: getDefaultFavicon(url),
      logo: null,
      url,
    };
  } catch {
    return {
      title: "Unknown Site",
      favicon: "/favicon.ico",
      logo: null,
      url,
    };
  }
}
