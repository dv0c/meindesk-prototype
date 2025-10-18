export function generateSlug(input?: string) {
  const title = (input || "").toString().trim()
  if (!title) return `${Date.now().toString(36)}`
  // try to remove diacritics (for latin-based chars)
  let slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  if (slug) return slug

  // Fallback: base64url of the title (shortened) to handle non-latin titles like Greek
  try {
    const b64 = Buffer.from(title).toString("base64url")
    return `t-${b64.slice(0, 12)}`
  } catch {
    // final fallback: timestamp-based
    return `${Date.now().toString(36)}`
  }
}