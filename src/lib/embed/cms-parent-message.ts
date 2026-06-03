"use client"

import { getCmsEmbedParentOrigins, isAllowedCmsEmbedParentOrigin } from "@/lib/embed/parent-origins"

export type CmsParentMessageType = "meindesk-cms-authenticated" | "meindesk-cms-auth-failed"

export function isCmsEmbedContext(): boolean {
  if (typeof window === "undefined") return false
  const embed = new URLSearchParams(window.location.search).get("embed") === "1"
  return embed && window.self !== window.top
}

function postToEmbedParents(type: CmsParentMessageType): void {
  if (!isCmsEmbedContext()) return

  const payload = { type }
  const origins = getCmsEmbedParentOrigins()

  for (const origin of origins) {
    try {
      window.parent.postMessage(payload, origin)
    } catch {
      /* ignore invalid target */
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
