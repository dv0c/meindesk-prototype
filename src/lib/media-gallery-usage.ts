import type {
  MediaUsageArticleRef,
  MediaUsageCategoryRef,
  MediaUsageEntry,
  MediaUsageIndex,
} from "@/types/media-gallery"

/** Strip query/hash and trailing slash for stable URL comparison. */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null
  try {
    const parsed = new URL(url.trim())
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "")
  } catch {
    return url.trim().split("?")[0]?.split("#")[0]?.replace(/\/$/, "") || null
  }
}

/** Extract Cloudinary public_id path from a secure URL when possible. */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
  const normalized = normalizeMediaUrl(url)
  if (!normalized) return null

  const uploadMarker = "/upload/"
  const idx = normalized.indexOf(uploadMarker)
  if (idx === -1) return null

  let path = normalized.slice(idx + uploadMarker.length)
  // Remove version segment e.g. v1234567890/
  path = path.replace(/^v\d+\//, "")
  // Remove transformations segment (contains commas or underscores before final path)
  const parts = path.split("/")
  if (parts.length > 1 && parts[0].includes(",")) {
    path = parts.slice(1).join("/")
  } else if (parts[0].includes("_") && !parts[0].includes(".")) {
    path = parts.slice(1).join("/")
  }

  const withoutExt = path.replace(/\.[^/.]+$/, "")
  return withoutExt || null
}

export function mediaUrlsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normA = normalizeMediaUrl(a)
  const normB = normalizeMediaUrl(b)
  if (!normA || !normB) return false
  if (normA === normB) return true

  const pubA = extractCloudinaryPublicId(a)
  const pubB = extractCloudinaryPublicId(b)
  if (pubA && pubB && pubA === pubB) return true

  return normA.endsWith(normB) || normB.endsWith(normA)
}

export function findUsageForMediaUrl(
  url: string,
  publicId: string | undefined,
  index: MediaUsageIndex,
): MediaUsageEntry {
  const entry: MediaUsageEntry = { articles: [], categories: [] }

  for (const [indexedUrl, usage] of Object.entries(index.byUrl)) {
    if (
      mediaUrlsMatch(url, indexedUrl) ||
      (publicId && extractCloudinaryPublicId(indexedUrl) === publicId)
    ) {
      entry.articles.push(...usage.articles)
      entry.categories.push(...usage.categories)
    }
  }

  return entry
}

export function buildMediaUsageIndex(
  articles: MediaUsageArticleRef[],
  categories: MediaUsageCategoryRef[],
): MediaUsageIndex {
  const byUrl: Record<string, MediaUsageEntry> = {}

  const addEntry = (
    url: string | null | undefined,
    kind: "articles" | "categories",
    ref: { id: string; title?: string; name?: string },
  ) => {
    const key = normalizeMediaUrl(url)
    if (!key) return

    if (!byUrl[key]) {
      byUrl[key] = { articles: [], categories: [] }
    }

    if (kind === "articles") {
      if (!byUrl[key].articles.some((a) => a.id === ref.id)) {
        byUrl[key].articles.push({ id: ref.id, title: ref.title || "Untitled" })
      }
    } else {
      if (!byUrl[key].categories.some((c) => c.id === ref.id)) {
        byUrl[key].categories.push({ id: ref.id, name: ref.name || "Untitled" })
      }
    }
  }

  for (const article of articles) {
    addEntry(article.cover, "articles", { id: article.id, title: article.title })
  }

  for (const category of categories) {
    addEntry(category.thumbnail, "categories", { id: category.id, name: category.name })
  }

  return { byUrl, articles, categories }
}

export function isMediaUsed(
  url: string,
  publicId: string | undefined,
  index: MediaUsageIndex,
): boolean {
  const usage = findUsageForMediaUrl(url, publicId, index)
  return usage.articles.length > 0 || usage.categories.length > 0
}
