"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useTeam } from "./useTeam";

export interface FeedResponse {
  found: boolean;
  feedUrl: string | null;
  type: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  itemCount: number;
  site: SiteInfo;
  items: FeedItem[];
}

export interface SiteInfo {
  title: string | null;
  favicon: string | null;
  logo: string | null;
  url: string | null;
}

export interface FeedItem {
  title: string | null;
  link: string | null;
  thumbnail: string | null;
  description: string | null;
  content: string | null;
  pubDate: string | null;
  author: string | null;
  categories: string[];
  site: SiteInfo;
}

// Parse RSS XML to FeedResponse format
function parseRssXml(xmlText: string, feedUrl: string): FeedResponse {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const channel = doc.querySelector("channel");
  const title = channel?.querySelector("title")?.textContent || "Merged Feed";
  const description = channel?.querySelector("description")?.textContent || "";

  const items: FeedItem[] = [];
  const itemElements = doc.querySelectorAll("item");

  itemElements.forEach((item) => {
    items.push({
      title: item.querySelector("title")?.textContent || null,
      link: item.querySelector("link")?.textContent || null,
      thumbnail: item.querySelector("enclosure")?.getAttribute("url") || null,
      description: item.querySelector("description")?.textContent || null,
      content: null,
      pubDate: item.querySelector("pubDate")?.textContent || null,
      author: item.querySelector("author")?.textContent || null,
      categories: [],
      site: {
        title: item.querySelector("source")?.textContent || title,
        favicon: null,
        logo: null,
        url: null,
      },
    });
  });

  return {
    found: true,
    feedUrl,
    type: "Merged RSS",
    title,
    description,
    image: null,
    itemCount: items.length,
    site: {
      title,
      favicon: null,
      logo: null,
      url: feedUrl,
    },
    items,
  };
}

export function useFeed(url: string | null) {
  const { team } = useTeam();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      setFeed(null);

      try {
        // Check if this is a merged feed URL
        const decodedUrl = decodeURIComponent(url);
        const isMergedFeed = decodedUrl.includes("/api/rss/merged/");

        if (isMergedFeed) {
          // For merged feeds, fetch directly and parse the RSS XML
          const res = await axios.get(decodedUrl, {
            headers: { Accept: "application/rss+xml" },
          });
          if (!cancelled) {
            const feedData = parseRssXml(res.data, decodedUrl);
            setFeed(feedData);
          }
        } else {
          // For regular feeds, use the existing API
          const res = await axios.get<any>(
            `/api/team/${team?.id}/rss?url=${url}`
          );
          if (!cancelled) {
            setFeed(res.data);
            if (!res.data.found) setError(res.data.message || "No feed found");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.error || err.message || "Failed to fetch feed"
          );
          setFeed(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeed();

    return () => {
      cancelled = true;
    };
  }, [url, team?.id]);

  return { feed, loading, error };
}

