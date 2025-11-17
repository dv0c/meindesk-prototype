import * as cheerio from "cheerio";
import { safeFetch } from "./fetch-utils";
import { fetchMetadataFromPage } from "./page-metadata";

export async function scrapeVirtualFeed(target: string, fetchContent = false) {
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
