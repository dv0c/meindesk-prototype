const FETCH_TIMEOUT = 15000; // 15s timeout (increased for slower sites)

// Pool of common browser User-Agents for rotation
const USER_AGENTS = [
  // Chrome on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  // Chrome on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  // Firefox on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  // Firefox on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  // Safari on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

// Get a random User-Agent from the pool
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Get browser-like headers with randomized User-Agent
function getBrowserHeaders(url: string): Record<string, string> {
  const userAgent = getRandomUserAgent();
  const isFirefox = userAgent.includes("Firefox");

  // Extract domain for Referer header
  let referer = "";
  try {
    const urlObj = new URL(url);
    referer = `${urlObj.protocol}//${urlObj.hostname}/`;
  } catch { }

  const headers: Record<string, string> = {
    "User-Agent": userAgent,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,el;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };

  // Add referer to look more like a real browser
  if (referer) {
    headers["Referer"] = referer;
  }

  // Different headers for different browsers
  if (isFirefox) {
    headers["Upgrade-Insecure-Requests"] = "1";
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-User"] = "?1";
  } else {
    headers["Upgrade-Insecure-Requests"] = "1";
    headers["Sec-Ch-Ua"] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers["Sec-Ch-Ua-Mobile"] = "?0";
    headers["Sec-Ch-Ua-Platform"] = '"Windows"';
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = "none";
    headers["Sec-Fetch-User"] = "?1";
  }

  return headers;
}

export async function safeFetch(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
) {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Get fresh headers with random User-Agent for each attempt
      const headers = getBrowserHeaders(url);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { ...headers, ...(options.headers || {}) },
      });

      clearTimeout(timeout);

      // Log the User-Agent used for debugging
      if (attempt > 1) {
        console.log(`[safeFetch] Attempt ${attempt} succeeded with UA: ${headers["User-Agent"].substring(0, 50)}...`);
      }

      return response;
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err;

      if (attempt < maxRetries) {
        // Use increasing backoff with jitter
        const baseBackoff = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        const jitter = Math.random() * 1000;
        const backoffMs = baseBackoff + jitter;

        console.warn(
          `[safeFetch] Attempt ${attempt}/${maxRetries} failed for ${url}: ${err.message}. Retrying with different UA in ${Math.round(backoffMs)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  console.error(
    `[safeFetch] Failed for ${url} after ${maxRetries} attempts:`,
    lastError?.message
  );
  return null;
}
