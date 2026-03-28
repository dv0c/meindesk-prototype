import { createHmac, timingSafeEqual } from "node:crypto";

const PREFIX = "v1";

/**
 * HMAC token proving the client was served this page for the given site (server-rendered).
 * Set ANALYTICS_INGEST_SECRET in production.
 */
export function createAnalyticsIngestToken(siteId: string): string | null {
  const secret = process.env.ANALYTICS_INGEST_SECRET;
  if (!secret || !siteId) return null;

  const hmac = createHmac("sha256", secret);
  hmac.update(siteId);
  const sig = hmac.digest("base64url");
  return `${PREFIX}.${sig}`;
}

export function verifyAnalyticsIngestToken(siteId: string, token: unknown): boolean {
  const secret = process.env.ANALYTICS_INGEST_SECRET;
  if (!secret) return true;

  if (typeof token !== "string" || !token.startsWith(`${PREFIX}.`)) {
    return false;
  }

  const expected = createAnalyticsIngestToken(siteId);
  if (!expected) return false;

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
