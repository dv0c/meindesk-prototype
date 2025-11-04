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
        const res = await axios.get<any>(
          `/api/team/${team?.id}/rss?url=${url}`
        );
        if (!cancelled) {
          setFeed(res.data);
          if (!res.data.found) setError(res.data.message || "No feed found");
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
  }, [url]);

  return { feed, loading, error };
}
