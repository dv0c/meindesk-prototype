import { safeFetch } from "./fetch-utils";

export async function fetchFromFeedSearchAPI(target: string) {
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
