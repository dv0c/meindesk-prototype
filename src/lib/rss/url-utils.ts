export function normalizeUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}
