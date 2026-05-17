export interface Media {
  id: string
  name: string
  url: string
  alt?: string | null // Make alt optional
  type: string // e.g., 'image/jpeg', 'image/png'
  size: number // in bytes
  width?: number
  height?: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  siteId: string
  public_id?: string
  userId?: string // If you track which user uploaded it
}

export interface MediaGalleryResponse {
  media: Media[]
  totalPages: number
  currentPage: number
  nextPageCursor?: string | null
}

export type MediaUsageFilter = "all" | "used" | "unused"

export type MediaSortOption = "newest" | "oldest" | "name-asc" | "name-desc"

export interface MediaGalleryFilterState {
  search: string
  month: string | null
  articleId: string | null
  categoryId: string | null
  usage: MediaUsageFilter
  sort: MediaSortOption
}

export interface MediaUsageArticleRef {
  id: string
  title: string
  cover: string | null
}

export interface MediaUsageCategoryRef {
  id: string
  name: string
  thumbnail: string | null
}

export interface MediaUsageEntry {
  articles: { id: string; title: string }[]
  categories: { id: string; name: string }[]
}

export interface MediaUsageIndex {
  byUrl: Record<string, MediaUsageEntry>
  articles: MediaUsageArticleRef[]
  categories: MediaUsageCategoryRef[]
}

export const DEFAULT_MEDIA_GALLERY_FILTERS: MediaGalleryFilterState = {
  search: "",
  month: null,
  articleId: null,
  categoryId: null,
  usage: "all",
  sort: "newest",
}

export interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
  // any other relevant fields Cloudinary or your upload service returns
}
