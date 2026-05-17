export type ArticleStatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "BANNED" | "DELETED"

export type ArticleCoverFilter = "all" | "with_cover" | "without_cover"

export type ArticleSortOption = "newest" | "oldest" | "title-asc" | "title-desc"

export interface ArticleGalleryFilterState {
  search: string
  month: string | null
  categoryId: string | null
  status: ArticleStatusFilter
  authorId: string | null
  cover: ArticleCoverFilter
  sort: ArticleSortOption
}

export const DEFAULT_ARTICLE_FILTERS: ArticleGalleryFilterState = {
  search: "",
  month: null,
  categoryId: null,
  status: "ALL",
  authorId: null,
  cover: "all",
  sort: "newest",
}

export interface ArticleListItem {
  id: string
  title?: string | null
  slug?: string | null
  excerpt?: string | null
  cover?: string | null
  createdAt: string | Date
  status?: string
  authorId?: string
  authorIds?: string[]
  author?: { id: string; name?: string | null } | null
  authors?: { id: string; name?: string | null }[]
  categories?: { id: string; name?: string | null }[] | null
}
