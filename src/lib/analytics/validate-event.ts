import type { IngestEventPayload, AnalyticsEventType } from "./types"

const VALID_EVENT_TYPES: AnalyticsEventType[] = [
  "page_view",
  "search",
  "click",
  "listing_open",
  "contact_click",
  "phone_click",
  "website_click",
  "share_click",
  "favorite_click",
  "login",
  "register",
  "form_submit",
]

export function validateIngestPayload(body: unknown): {
  ok: true
  data: IngestEventPayload
} | {
  ok: false
  error: string
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" }
  }

  const b = body as Record<string, unknown>
  const siteId = b.siteId
  const path = b.path

  if (typeof siteId !== "string" || !siteId) {
    return { ok: false, error: "siteId required" }
  }
  if (typeof path !== "string" || !path || path.length > 2048) {
    return { ok: false, error: "path required" }
  }

  const eventType = (b.eventType as AnalyticsEventType) ?? "page_view"
  if (!VALID_EVENT_TYPES.includes(eventType)) {
    return { ok: false, error: "Invalid eventType" }
  }

  return {
    ok: true,
    data: {
      siteId,
      path,
      referrer: typeof b.referrer === "string" ? b.referrer.slice(0, 2048) : undefined,
      userAgent: typeof b.userAgent === "string" ? b.userAgent.slice(0, 512) : undefined,
      articleSlug: typeof b.articleSlug === "string" ? b.articleSlug.slice(0, 256) : undefined,
      ingestToken: typeof b.ingestToken === "string" ? b.ingestToken : undefined,
      eventType,
      visitorId: typeof b.visitorId === "string" ? b.visitorId.slice(0, 64) : undefined,
      sessionId: typeof b.sessionId === "string" ? b.sessionId.slice(0, 64) : undefined,
      contentType: typeof b.contentType === "string" ? b.contentType.slice(0, 32) : undefined,
      contentId: typeof b.contentId === "string" ? b.contentId.slice(0, 64) : undefined,
      metadata:
        b.metadata && typeof b.metadata === "object" && !Array.isArray(b.metadata)
          ? (b.metadata as Record<string, unknown>)
          : undefined,
    },
  }
}

/** Dedupe key: same visitor + path within same minute */
export function buildDedupeKey(
  visitorId: string | undefined,
  ipAddress: string,
  path: string,
  eventType: string
): string {
  const id = visitorId ?? ipAddress
  const minute = Math.floor(Date.now() / 60_000)
  return `${id}:${path}:${eventType}:${minute}`
}
