"use client"

import { getCmsEmbedParentOrigins, isAllowedCmsEmbedParentOrigin } from "@/lib/embed/parent-origins"

export type CmsParentMessageType = "meindesk-cms-authenticated" | "meindesk-cms-auth-failed"

export function isCmsEmbedContext(): boolean {
  if (typeof window === "undefined") return false
  return window.self !== window.top
}

function postToEmbedParents(type: CmsParentMessageType): void {
  if (!isCmsEmbedContext()) return

  const payload = { type }
  const origins = getCmsEmbedParentOrigins()
  const posted = new Set<string>()

  for (const origin of origins) {
    try {
      window.parent.postMessage(payload, origin)
      posted.add(origin)
    } catch {
      /* ignore invalid target */
    }
  }

  // Dev fallback when env is not wired into the client bundle yet.
  if (posted.size === 0 && process.env.NODE_ENV === "development") {
    try {
      window.parent.postMessage(payload, "*")
    } catch {
      /* ignore */
    }
  }
}

export function notifyCmsEmbedAuthenticated(): void {
  postToEmbedParents("meindesk-cms-authenticated")
}

export function notifyCmsEmbedAuthFailed(): void {
  postToEmbedParents("meindesk-cms-auth-failed")
}

/** Client-side check for incoming messages (Efindly shell). */
export function parseCmsParentMessage(
  data: unknown,
  origin: string,
): CmsParentMessageType | null {
  if (!isAllowedCmsEmbedParentOrigin(origin)) return null
  if (!data || typeof data !== "object") return null
  const type = (data as { type?: string }).type
  if (type === "meindesk-cms-authenticated" || type === "meindesk-cms-auth-failed") {
    return type
  }
  return null
}
