import * as xml2js from "xml2js";

export async function parseYouTubeFeed(xmlText: string) {
  const parsed = await xml2js.parseStringPromise(xmlText, {
    explicitArray: false,
  });
  const feed = parsed.feed;
  if (!feed || !feed.entry) return null;

    console.error("[RSS Scraper]: Method used YoutubeScraper");  

  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  const channelTitle = feed.title;
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
