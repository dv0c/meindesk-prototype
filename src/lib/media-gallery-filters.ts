import { isMediaUsed, mediaUrlsMatch } from "@/lib/media-gallery-usage"
import type { Media } from "@/types/media-gallery"
import type { MediaGalleryFilterState, MediaUsageIndex } from "@/types/media-gallery"

export function getAvailableMonths(media: Media[]): string[] {
  const months = new Set<string>()
  for (const item of media) {
    if (!item.createdAt) continue
    const date = new Date(item.createdAt)
    if (Number.isNaN(date.getTime())) continue
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    months.add(`${year}-${month}`)
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a))
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function isInMonth(createdAt: string, monthKey: string): boolean {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return false
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}` === monthKey
}

export function countActiveFilters(filters: MediaGalleryFilterState): number {
  let count = 0
  if (filters.search.trim()) count++
  if (filters.month) count++
  if (filters.articleId) count++
  if (filters.categoryId) count++
  if (filters.usage !== "all") count++
  if (filters.sort !== "newest") count++
  return count
}

export function hasActiveFilters(filters: MediaGalleryFilterState): boolean {
  return countActiveFilters(filters) > 0
}

function sortMedia(items: Media[], sort: MediaGalleryFilterState["sort"]): Media[] {
  const sorted = [...items]
  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case "name-asc":
      sorted.sort((a, b) => (a.name || a.public_id || "").localeCompare(b.name || b.public_id || ""))
      break
    case "name-desc":
      sorted.sort((a, b) => (b.name || b.public_id || "").localeCompare(a.name || a.public_id || ""))
      break
    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return sorted
}

export function applyMediaFilters(
  media: Media[],
  filters: MediaGalleryFilterState,
  usageIndex: MediaUsageIndex,
): Media[] {
  let result = [...media]

  const searchLower = filters.search.trim().toLowerCase()
  if (searchLower) {
    result = result.filter((item) => {
      const name = (item.name || "").toLowerCase()
      const publicId = (item.public_id || "").toLowerCase()
      const alt = (item.alt || "").toLowerCase()
      return name.includes(searchLower) || publicId.includes(searchLower) || alt.includes(searchLower)
    })
  }

  if (filters.month) {
    result = result.filter((item) => isInMonth(item.createdAt, filters.month!))
  }

  if (filters.articleId) {
    const article = usageIndex.articles.find((a) => a.id === filters.articleId)
    if (article?.cover) {
      result = result.filter((item) => mediaUrlsMatch(item.url, article.cover))
    } else {
      result = []
    }
  }

  if (filters.categoryId) {
    const category = usageIndex.categories.find((c) => c.id === filters.categoryId)
    if (category?.thumbnail) {
      result = result.filter((item) => mediaUrlsMatch(item.url, category.thumbnail))
    } else {
      result = []
    }
  }

  if (filters.usage === "used") {
    result = result.filter((item) => isMediaUsed(item.url, item.public_id, usageIndex))
  } else if (filters.usage === "unused") {
    result = result.filter((item) => !isMediaUsed(item.url, item.public_id, usageIndex))
  }

  return sortMedia(result, filters.sort)
}
