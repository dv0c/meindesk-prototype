import { formatMonthLabel, isInMonth } from "@/lib/media-gallery-filters"
import type {
  ArticleGalleryFilterState,
  ArticleListItem,
  ArticleSortOption,
} from "@/types/article-filters"

export { formatMonthLabel }

export function getAvailableMonthsForArticles(articles: ArticleListItem[]): string[] {
  const months = new Set<string>()
  for (const article of articles) {
    if (!article.createdAt) continue
    const date = new Date(article.createdAt)
    if (Number.isNaN(date.getTime())) continue
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    months.add(`${year}-${month}`)
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a))
}

export function countActiveArticleFilters(filters: ArticleGalleryFilterState): number {
  let count = 0
  if (filters.search.trim()) count++
  if (filters.month) count++
  if (filters.categoryId) count++
  if (filters.status !== "ALL") count++
  if (filters.authorId) count++
  if (filters.cover !== "all") count++
  if (filters.sort !== "newest") count++
  return count
}

export function hasActiveArticleFilters(filters: ArticleGalleryFilterState): boolean {
  return countActiveArticleFilters(filters) > 0
}

function articleMatchesAuthor(article: ArticleListItem, authorId: string): boolean {
  if (article.authorId === authorId) return true
  if (article.authorIds?.includes(authorId)) return true
  if (article.author?.id === authorId) return true
  if (article.authors?.some((a) => a.id === authorId)) return true
  return false
}

function sortArticles(items: ArticleListItem[], sort: ArticleSortOption): ArticleListItem[] {
  const sorted = [...items]
  switch (sort) {
    case "oldest":
      sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      break
    case "title-asc":
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      break
    case "title-desc":
      sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""))
      break
    case "newest":
    default:
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }
  return sorted
}

export function applyArticleFilters(
  articles: ArticleListItem[],
  filters: ArticleGalleryFilterState,
): ArticleListItem[] {
  let result = [...articles]

  const searchLower = filters.search.trim().toLowerCase()
  if (searchLower) {
    result = result.filter((article) => {
      const title = (article.title || "").toLowerCase()
      const slug = (article.slug || "").toLowerCase()
      const excerpt = (article.excerpt || "").toLowerCase()
      return (
        title.includes(searchLower) ||
        slug.includes(searchLower) ||
        excerpt.includes(searchLower)
      )
    })
  }

  if (filters.month) {
    result = result.filter((article) =>
      isInMonth(String(article.createdAt), filters.month!),
    )
  }

  if (filters.categoryId) {
    result = result.filter((article) =>
      article.categories?.some((c) => c.id === filters.categoryId),
    )
  }

  if (filters.status !== "ALL") {
    result = result.filter((article) => article.status === filters.status)
  }

  if (filters.authorId) {
    result = result.filter((article) => articleMatchesAuthor(article, filters.authorId!))
  }

  if (filters.cover === "with_cover") {
    result = result.filter((article) => Boolean(article.cover?.trim()))
  } else if (filters.cover === "without_cover") {
    result = result.filter((article) => !article.cover?.trim())
  }

  return sortArticles(result, filters.sort)
}

export function buildAuthorOptions(articles: ArticleListItem[]): { id: string; label: string }[] {
  const map = new Map<string, string>()
  for (const article of articles) {
    if (article.author?.id) {
      map.set(article.author.id, article.author.name || "Unknown")
    }
    for (const a of article.authors || []) {
      if (a.id) map.set(a.id, a.name || "Unknown")
    }
  }
  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function buildCategoryOptionsFromArticles(
  articles: ArticleListItem[],
): { id: string; label: string }[] {
  const map = new Map<string, string>()
  for (const article of articles) {
    for (const c of article.categories || []) {
      if (c?.id) map.set(c.id, c.name || "Untitled")
    }
  }
  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function mergeCategoryOptions(
  fromArticles: { id: string; label: string }[],
  fromApi: { id: string; label: string }[],
): { id: string; label: string }[] {
  const map = new Map<string, string>()
  for (const c of [...fromArticles, ...fromApi]) {
    map.set(c.id, c.label)
  }
  return Array.from(map.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
