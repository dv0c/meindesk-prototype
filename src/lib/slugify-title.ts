import slugify from "slugify"

/** Client-safe URL slug from title (no DB uniqueness). Match options used in generateSlug base step. */
export function slugifyTitle(input: string): string {
  return slugify(input.trim() || "untitled", {
    lower: true,
    strict: true,
    trim: true,
  })
}

/** True if slug looks generated from title (including numeric suffixes like base-1). */
export function isLikelyAutoSlug(title: string, slug: string): boolean {
  const d = slugifyTitle(title)
  if (!slug) return true
  if (slug === d) return true
  if (d && slug.startsWith(`${d}-`)) return true
  return false
}
