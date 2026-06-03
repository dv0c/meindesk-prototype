/** Allowed parent origins for postMessage when MeinDesk CMS is embedded in Efindly admin. */
export function getCmsEmbedParentOrigins(): string[] {
  const raw = process.env.CMS_EMBED_PARENT_ORIGINS?.trim()
  if (raw) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  }

  if (process.env.NODE_ENV === "development") {
    return ["http://localhost:3000", "http://127.0.0.1:3000"]
  }

  return []
}

export function isAllowedCmsEmbedParentOrigin(origin: string): boolean {
  const allowed = getCmsEmbedParentOrigins()
  if (allowed.length === 0) return false
  return allowed.includes(origin)
}
